---
type: reflection
title: "飞书 Wiki 发布中的 profile / identity 误判复盘"
created: 2026-06-30
updated: 2026-06-30
tags:
  - codex
  - reflection
  - feishu
  - lark-cli
  - workflow
status: active
source:
  - "当前会话：发布 `image_tool AddDefault_value 分支设计` 到飞书 Wiki `LgQGwHkN2iRG2LkiigCceuAJnmd`"
  - "C:\Users\18355\.codex\skills\publish-feishu-wiki-doc\SKILL.md"
  - "C:\home\for_ai\wiki\ai\tools\dingtalk-feishu-migration-workflow.md"
related:
  - "[[wiki/ai/tools/lark-cli-ai-document-guide|AI 使用飞书 lark-cli 创建文档]]"
  - "[[wiki/ai/reflections/codex/evolution/2026-06-17-feishu-permission-workflow|飞书 Wiki 权限批处理工作流复盘]]"
  - "[[wiki/ai/reflections/codex/index|Codex 反思与进化]]"
---

# 飞书 Wiki 发布中的 profile / identity 误判复盘

> Scope: 记录一次把本地 Obsidian 页面发布到飞书 Wiki 时的流程偏差、纠正路径和后续 guardrail。本文只总结本次会话中的可验证事实，不重新定义飞书权限模型。

## 1. 一句话结论

本次问题不是“飞书必须重新授权”，而是我把 `profile` 和 `identity` 混成了一个判断：正确 profile `cli_aa9d4e8d9eb91cc4` 的 user token 已过期，但 bot identity 仍然 ready，目标 Wiki 也可由 bot 读写；正确做法是先核对同一 profile 下可用 identity，再决定用 user 还是 bot，而不是直接要求用户重新授权。

## 2. 事件摘要

用户要求把本地 Obsidian wiki 页面 `image_tool AddDefault_value 分支设计` 发布到飞书 Wiki：

- 本地源页：`C:\home\for_ai\wiki\tools\image_tool AddDefault_value 分支设计.md`
- 目标 Wiki：`https://hcnl90h70f1g.feishu.cn/wiki/LgQGwHkN2iRG2LkiigCceuAJnmd`
- 必须使用既有 Skills，且不要用错 profile。

我先按要求读取本地 wiki 和 skill，确认 `learning` 项目飞书操作应显式使用 profile `cli_aa9d4e8d9eb91cc4`。随后运行发布脚本的旧版 `prepare-only`，发现旧脚本只接受 SVG，而源页正文引用了 PNG。第一次补救时我把 PNG 改成 SVG 文件卡片，这虽然完成了上传，但不符合飞书阅读体验；后续已修正为统一上传 PNG image block。

真正的偏差发生在认证判断：发布脚本默认用 user identity，并检查 user open_id。该检查失败后，我直接提示用户重新授权。用户指出“之前都可以提交成功，不需要授权”，这暴露了我的判断缺口：我只看到了 user token 失效，没有立刻检查同一 profile 的 bot identity 是否可用。

复查后确认：

| 项目 | 结果 |
|---|---|
| profile | `cli_aa9d4e8d9eb91cc4`，正确 |
| user identity | token expired / refresh token expired |
| bot identity | ready / verified |
| 目标 Wiki 读取 | bot 可读取，解析出 document_id `Rtm2driEFocX9NxeH91c2HiNnBd` |
| 最终发布 identity | bot |
| 最终 revision | `21` |
| SVG 验证 | `5/5` |
| placeholder | `0` |
| raster image | `0` |
| replacement char | `0` |
| 权限处理 | 保留现有文档权限，未修改 ACL |

## 3. 根因拆解

### 3.1 把 user 授权失败误判成 profile 不可用

`auth status --verify` 的真实含义是：一个 profile 下面可能有多个 identity 状态。当前 profile 的 user 不可用，不等于整个 profile 不可用。

这次正确事实是：

- user token 过期，因此基于 user 的发布脚本默认路径失败。
- bot identity ready，因此可以在同一 profile 下用 `--as bot` 完成目标文档读写。
- 用户提醒后再验证 bot，才恢复到正确路径。

新的规则：飞书写操作前要记录三元组：`profile + identity + target`。不要只说“profile 可用/不可用”。

### 3.2 过早把交互授权当成下一步

当用户明确提醒“不要用错 profile”时，我应该优先穷尽同 profile 的非交互式能力：

1. `auth status --verify` 看 user/bot 分别状态。
2. 用目标 URL 做一次 `docs +fetch --as bot` 或 `drive +inspect --as bot`。
3. 如果 bot 能读写目标，再走 bot 写入和回读。
4. 只有 user 和 bot 都不可用，或目标操作确实必须 user identity，才要求用户授权。

我跳过了第 2 步，导致不必要地打断用户。

### 3.3 `.cmd` wrapper 对 OAuth URL 的 `&` 不安全

发起授权时还暴露了另一个工具坑：`lark-cli.cmd` wrapper 内部使用 `%*` 透传参数，包含 `&` 的 OAuth URL 会被 `cmd` 二次解释，导致 `user_code` 被当成命令执行。

这不是本次最终路径所必需，但应沉淀为经验：

- PowerShell 层的引号不足以保证 `.cmd` wrapper 不二次解释 `&`。
- 如果必须传含 `&` 的 URL 给 lark-cli，优先绕过 `.cmd`，直接调用 Node entrypoint：`node ...\@larksuite\cli\scripts\run.js ...`。
- 更好的做法是避免进入授权流程，先验证现有 profile 的 bot/user 可用状态。

### 3.4 发布脚本默认 user，但任务可安全走 bot

`publish-feishu-wiki-doc` skill 的默认脚本路径使用 user identity，并检查固定 user open_id。这适合需要以用户身份创建或替换的场景，但本次目标是替换已有 Wiki 文档，且 bot 对目标有写权限。

因此本次正确处理是复用脚本的准备、SVG 校验、marker 替换和回读验证逻辑，但把实际 `docs +fetch/+update/+media-insert` 调用切到 `--as bot`。这不是换 profile，而是在同一 profile 下选择可用 identity。

## 4. 新 guardrail

以后在 `C:\Users\18355\Documents\learning` 或本地 wiki 发布到飞书时，按这个顺序执行：

1. **先读本地流程**：检查 `wiki/ai/tools/dingtalk-feishu-migration-workflow.md`、相关 skill 和目标页面，确认 profile 规则。
2. **显式 profile**：默认使用 `cli_aa9d4e8d9eb91cc4`，除非用户明确给出其他 profile。禁止裸跑默认 profile。
3. **分开判断 identity**：执行 `lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 auth status --verify`，分别记录 user 与 bot 状态。
4. **先试目标读权限**：对用户给出的目标 Wiki URL，用可用 identity 做最小 `docs +fetch` 或 `drive +inspect`。
5. **user 过期不等于阻塞**：如果 bot ready 且能读/写目标，优先用 bot 完成发布；只有目标操作确实需要 user 时才要求授权。
6. **飞书上传统一 PNG image block**：发布到飞书时，所有本地图像都必须转成/选择 PNG 后以 `docs +media-insert --type image` 插入原图位；不要把 SVG 上传成 file card。已有同名 PNG 时直接使用；只有缺 PNG 时才渲染 SVG。
7. **临时发布副本不改源页**：图片格式转换只发生在发布准备层，不直接改原 Obsidian 页面。
8. **回读验证再报告**：必须回读确认 title、revision、PNG 数、SVG file card 数、placeholder、replacement char。没有回读结果，不说发布完成。
8. **OAuth URL 谨慎处理**：如果必须授权，含 `&` 的 URL 不要经 `lark-cli.cmd` wrapper 直接传；优先使用安全的 argv 路径或直接展示原始 URL。

## 5. 下次检查清单

- [ ] 是否已经确认 `cwd`、目标本地页面、目标飞书 URL？
- [ ] 是否已经读取本地 wiki 中的飞书流程页，而不是靠记忆？
- [ ] 是否显式指定 profile `cli_aa9d4e8d9eb91cc4`？
- [ ] 是否把 user 和 bot identity 分开验证？
- [ ] 是否先用目标 URL 做最小读权限检查？
- [ ] 是否确认发布脚本会把所有本地图像转成/选择 PNG image block，而不是 SVG file card？
- [ ] 是否避免修改原始 Obsidian 页面，只在发布准备层转换图片？
- [ ] 是否完成回读验证，并记录 revision / PNG / SVG sources / placeholder / replacement char？
- [ ] 如果出现授权问题，是否先判断 bot 能否完成，而不是直接要求用户扫码？

## 6. 对本次行为的具体修正

这次被用户纠正后，我做了正确补救：

1. 重新以同一 profile 提权检查 `auth status --verify`。
2. 确认 bot identity ready、user token expired。
3. 用 `--as bot` 读取目标 Wiki，拿到 document_id。
4. 用 bot identity 替换写入文档、先上传 5 个 SVG 文件卡片、清理 marker。
5. 回读 full document，确认 revision `21`、SVG `5/5`、placeholder `0`、raster `0`、replacement char `0`。
6. 用户进一步要求“图片转换成 PNG 然后插入到对应位置”后，重建文档为 5 张 PNG image block，最终 revision `39`、PNG `5/5`、SVG file cards `0`、marker `0`、replacement char `0`。

但补救不等于流程合格。合格流程应在用户纠正前就完成 identity 分流判断。


## 7. 2026-06-30 追加修正：飞书上传图片统一 PNG

后续已把 `publish-feishu-wiki-doc` 的默认策略从 “SVG-only 文件卡片” 改为 “PNG image block”：

| 规则 | 处理 |
|---|---|
| Markdown/Obsidian 图像 | 解析本地图片路径，原文位置替换为唯一 marker |
| `.png` | 直接用作上传源 |
| `.svg` | 优先使用同名 `.png`；缺失时才尝试渲染为 PNG |
| `.jpg/.jpeg/.gif/.webp/.bmp` | 用 Pillow 转为 PNG |
| 远程 URL / 缺失图片 | 阻塞，不静默省略 |
| 飞书写入 | `docs +media-insert --type image --selection-with-ellipsis <marker>` |
| 验证 | `png_expected == png_inserted`、`svg_sources == 0`、`placeholder_count == 0`、`replacement_char_count == 0` |

这条规则优先级高于旧的 SVG 文件卡片流程。以后“上传到飞书 Wiki / 飞书文档”的本地 wiki 页面，默认都要走 PNG image block。
