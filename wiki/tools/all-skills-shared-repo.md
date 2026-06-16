---
type: note
title: "all_skills:跨机器共享 Claude/Codex Skills 仓库"
created: 2026-06-16
updated: 2026-06-16
tags: [tools, claude-code, codex, skills, sync, best-practice]
status: active
---

# all_skills:跨机器共享 Claude/Codex Skills 仓库

> 解决:在多台机器(Win/macOS/Linux)、同时用 Claude Code 与 OpenAI Codex CLI 时,
> 怎么用一个 git 仓库集中保存常用 skills,拉取后两边都能用。
>
> 配套:[Codex Skills 使用地图](<./codex-skills-map.md>)(查当前装了哪些 skill、触发场景)、
> [Claude Code 会话策略与跨 session 记忆机制](<./claude-code-session-and-memory.md>)(skill 属"写进磁盘的产物"层记忆)。
> 仓库与脚本以远端为准,整理日期 2026-06-16。

---

## 一、仓库与定位

- **远端**:`git@github.com:shuaishuaiZhu-ai/all_skills.git`(用户给的是 HTTPS,推送用 SSH,与 wiki 仓库同账号),分支 `main`。
- **本地**:每台机器各自 `git clone`(路径随机器,本会话机器在 `~/agent-skills`)。
- **核心难点**:两个工具的技能机制不同——
  - **Claude Code** 有原生 skills:`~/.claude/skills/<名>/SKILL.md`(`name`/`description` frontmatter)自动发现;第三方技能集还能以**插件市场**安装(`superpowers@claude-plugins-official`,文件在 `~/.claude/plugins/cache/...`)。
  - **Codex CLI** 没有自动发现、也没有插件系统,只有 `~/.codex/AGENTS.md`(常驻指令)和 `~/.codex/prompts/`(手动斜杠命令)。

## 二、设计:单一真相源 + 同步编译器

仓库存规范 `SKILL.md`,一个零依赖的 `sync.py`(纯 Python3 标准库)把它"编译"成两边各自认得的形式:

- **Claude**:把自有 skill **复制**进 `~/.claude/skills/`(不用软链接,因要兼容 Windows);按 `manifest.json` 用 `claude plugin install` 装好插件形态的技能集。
- **Codex**:在 `~/.codex/AGENTS.md` 的 `<!-- AGENT-SKILLS:BEGIN/END -->` 区间生成"技能索引 + 何时用 + 文件绝对路径"路由块,Codex 常驻读到、需要时自己 `Read`;插件形态 skill 的路由从 `installed_plugins.json` 解析路径,**指向插件缓存正本**(不复制),与 Claude 共用一份。

```
all_skills/
├── sync.py            零依赖同步编译器
├── manifest.json      单文件安装清单:插件依赖 + 自有 skill + Codex 选项
├── README.md
├── references/codex-tools.md   Claude 工具名 → Codex 映射
└── skills/            claude-api · mcp-builder · svg-diagrams · memory-management-model
                       · cross-session-learning · webapp-testing · contribute-skills
```

## 三、安装清单 = manifest.json(单文件驱动)

`install` 只装 `manifest.json` 里声明的,不多不少:

```jsonc
{
  "plugins": [ { "marketplace": "claude-plugins-official",
                 "repo": "anthropics/claude-plugins-official",
                 "plugin": "superpowers" } ],   // 插件:声明依赖,不复制
  "skills":  [ { "name": "claude-api" }, … ],   // 自有 skill:复制进 ~/.claude/skills/
  "codex":   { "include_plugin_skills": true, "plugin_skills": ["superpowers/*"] }
}
```

## 四、子命令

| 命令 | 作用 |
|---|---|
| `python sync.py`(= `install`) | 装插件依赖 + 复制自有 skill + 生成 Codex 路由 |
| `python sync.py install --dry-run` | 只打印将做什么,不改动 |
| `python sync.py collect [--json]` | 列出本机"非插件、可贡献"的候选 skill |
| `python sync.py push --only a,b` | 把选中的本机 skill 收进仓库并 `git commit && push` |
| `python sync.py add <目录>` | 收录任意含 `SKILL.md` 的目录(如 Codex 的 prompt) |
| `python sync.py doctor` | 只报告:重复 / 残留 / 失效路径 / 待贡献候选 |
| `python sync.py uninstall` | 移除本工具装过的 skill + 清掉 Codex 路由区间 |

幂等:内容与仓库一致的自有 skill 会"已是最新,跳过";Codex 路由两次写入字节一致。

## 五、去重与撞名(回答"云端有 superpowers、本地也有")

原则:**插件归插件,仓库归仓库——靠"声明依赖"去重,不靠"复制副本"。**

- 有插件形态的技能集(superpowers、cloudflare 系…)**只在 `manifest.plugins` 声明**,由 `claude plugin install` 安装(幂等:云端有/本地已装 → 只确保到位,不产生第二份),云端市场是正本、自动更新。
- 仓库 `skills/` 只放**没有插件形态、手写**的 skill。
- 撞名**仓库优先**:`install` 遇 `~/.claude/skills/` 下非本工具管理的同名个人副本,备份 `.bak` 后覆盖;插件命名空间副本(`plugin:skill`)与个人裸名不在同一路径,仅告警。
- Codex 没有插件系统,故插件 skill 在 Codex 端靠路由指向缓存正本;插件升级后重跑 `sync.py` 刷新路径。

## 六、贡献回仓库(在 Claude/Codex 里说"push skills")

仓库内 `contribute-skills` 元技能驱动:`collect --json` 列候选 → 代理用**多选框**(Claude 多选 / Codex 等价 UI)让你勾 → `push --only <勾选项>`(复制进仓库 + 登记 manifest + `git commit && push`)。`sync.py` 不含交互 UI,复选框由代理呈现。插件提供的名字会被守卫拒绝(应改为声明依赖,`--force-vendor` 才放行)。

## 七、清理历史重复(本机已做)

Claude 装某些插件(如 `cloudflare`)时会把插件 skill 自动抽取一份到 `~/.claude/skills/`,造成重复。`doctor` 的①项列出这些。安全步骤:`doctor` 列出 → 删前逐字节核对没被改过 → `tar` 备份后 `rm -rf` 个人副本 → 复查①归零。删的只是个人副本,插件以 `plugin:skill`(如 `cloudflare:wrangler`)继续提供。本会话已据此清掉 9 个 Cloudflare 个人重复副本(备份在 `~/.claude/skills-cloudflare-dup-backup.tar.gz`)。

## 八、新机器:拉取即用

```bash
git clone git@github.com:shuaishuaiZhu-ai/all_skills.git ~/agent-skills
cd ~/agent-skills && python sync.py        # Windows: py -3 sync.py
```

## 坑

- **headless 下 `claude plugin install` 可能失败**:某些沙盒的 `claude` 命令需交互 TTY/密码(`/dev/tty` 报错),skill 复制不受影响;正常机器无此问题。
- **`node_modules` / `__pycache__` 已 `.gitignore` 不入库**:跨平台原生二进制不能共享;`svg-diagrams` 等靠各机 `npm i` 还原(其 SKILL.md 自带还原命令)。
