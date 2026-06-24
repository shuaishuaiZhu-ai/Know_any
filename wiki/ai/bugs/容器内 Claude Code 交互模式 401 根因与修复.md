---
type: note
title: "容器内 Claude Code 交互模式 401（Please run /login）根因与修复"
created: 2026-06-22
updated: 2026-06-22
tags: [tools, claude-code, docker, auth, 401, oauth, debug]
status: active
---

# 容器内 Claude Code 交互模式 401（Please run /login）根因与修复

> 环境：80.116（`192.168.80.116`，SSH 免密钥登录）上的 docker 容器 `claude-code-<user>`（镜像 `192.168.90.119:5000/claude-code:<user>`）。进入后用密码门 `claude` + 访问密码运行。

## 现象

`docker exec -it claude-code-<user> /bin/bash` → `claude` → 输入访问密码 → **交互式 TUI 发消息时**报：

```
● Please run /login · API Error: 401 Invalid authentication credentials
```

但 `claude -p "..."`（headless/print 模式）**完全正常**。问题在一次 `claude` 自动更新之后出现。

## 架构背景：密码门 + 注入 token

容器用一个密码门 wrapper 装在 `/usr/local/sbin/claude`（PATH 优先于 `/usr/local/bin`，npm 自更新只动 bin、冲不掉 sbin）。它校验访问密码后**注入** `CLAUDE_CODE_OAUTH_TOKEN`（`sk-ant-oat01-…`，由 `claude setup-token` 生成），再 `exec /usr/local/bin/claude.origin`。API 认证本应全靠这个注入的 token。`/root/.claude` 是持久挂载，wrapper 备份与脚本放在 `.container-wrapper/`。

## 根因（已实测坐实）

> **Claude Code 2.1.18x 改了认证优先级：交互式 TUI 优先读 `~/.claude/.credentials.json` 里的 `claudeAiOauth` 登录块，而不是密码门注入的 `CLAUDE_CODE_OAUTH_TOKEN`。** 该容器的 `claudeAiOauth` 早已**过期** → 交互模式拿过期凭证认证 → 401。

鉴别证据：

| 测试 | 结果 |
|---|---|
| `claude -p`（带注入 token，headless） | ✅ 200 OK —— token 本身有效 |
| 交互 TUI（带注入 token） | ❌ 401 |
| 把 `.credentials.json` 挪开后跑交互 TUI | ✅ OK，且 claude 自动重写出**只含 `mcpOAuth`、无 `claudeAiOauth`** 的新凭证 |
| 降级到更新前版本（2.1.173） | ✅ 交互 OK（旧版优先 env token） |

- `-p` 两版都用 env token → 一直正常；2.1.173 交互优先 env token → 旧版正常；这解释了「**更新后才坏**」。
- 重装密码门 / 跑 `heal-claude.sh`（旧逻辑）**治不了**——因为密码门和 token 注入本来就完好（`token注入=1`），坏的不是密码门。

复现/验证命令（容器内）：

```bash
# 复现 401：不带注入 token，强制走磁盘过期凭证
env -u CLAUDE_CODE_OAUTH_TOKEN /usr/local/bin/claude.origin -p "reply OK"   # -> 401
# 证明 token 有效：带注入 token
CLAUDE_CODE_OAUTH_TOKEN="$TOKEN" /usr/local/bin/claude.origin -p "reply OK" # -> OK
# 查磁盘凭证是否过期
python3 -c 'import json,time;d=json.load(open("/root/.claude/.credentials.json")).get("claudeAiOauth",{});print("expiresAt",d.get("expiresAt"),"now",int(time.time()*1000))'
```

## 修复

**删除 `.credentials.json` 里过期的 `claudeAiOauth` 块（保留 `mcpOAuth`，MCP 服务器登录不受影响）**，交互模式即回退用密码门注入的 env token。**无需重新登录、无需降级。**

```bash
docker exec claude-code-<user> bash -lc '
python3 - <<PY
import json
p="/root/.claude/.credentials.json"; d=json.load(open(p))
d.pop("claudeAiOauth", None)
json.dump(d, open(p,"w"))
PY
'
# 验证：交互 claude 应返回正常，且 grep -c claudeAiOauth = 0、mcpOAuth 仍在
```

备选（放弃最新版时）：`npm install -g @anthropic-ai/claude-code@2.1.173`（旧版交互优先 env token）。

## 免维护保险（已部署并验证）

新增 `~/.claude/.container-wrapper/strip-stale-oauth.sh`：幂等、fail-safe，**只删过期的** `claudeAiOauth`（保留其它键），靠 `python3`，任何异常都静默退出绝不阻塞 claude 启动。接入三处：

1. **密码门** `/usr/local/sbin/claude`（及备份 `.container-wrapper/claude`）：密码校验后、`exec` claude 前调用 → **每次启动自动剔除过期 `claudeAiOauth`**。
2. **`reinstall.sh`**（容器重建后重装密码门的脚本）：装门后调用。
3. **`heal-claude.sh`**（主自愈脚本）：新增步骤 [4.5]，内嵌 base64 自重建该 helper（容器被冲也能恢复）+ 接入密码门 + 即时清理一次。

验证：删掉 helper + 注入一个过期 `claudeAiOauth` → 跑 `heal-claude.sh` → helper 自动重建、过期块归零、交互 `claude` 返回 `● OK`。**问题复发会自愈，无需人工干预。**

## 防复发 / 注意

- 修复态（无 `claudeAiOauth`）+ 保险脚本都在持久挂载 `/root/.claude`，**容器重建后保留**；但 `/usr/local/sbin/claude` 不持久，重建后需重跑 `docker exec claude-code-<user> /root/.claude/.container-wrapper/reinstall.sh`（现已含清理）。
- 密码门含 `DISABLE_AUTOUPDATER=1`，经 `docker exec -it … claude` 启动不会自动更新。
- 依赖容器内 `python3`（现有）；若缺失，保险静默失效，需手动删 `claudeAiOauth`。
- 残留风险：注入的 `oat01` token 本身将来也会过期，届时密码门也会 401，需 `claude setup-token` 重新生成并更新密码门两处的 token。

## 相关

- [[Claude Code CLI 使用教程]]、[[Claude Code CLI 进阶教程]]、[[claude-code-session-and-memory]]
- 同类容器/SSH 调试：[[Git fetch known_hosts 与 Docker 共享 SSH 排查]]
