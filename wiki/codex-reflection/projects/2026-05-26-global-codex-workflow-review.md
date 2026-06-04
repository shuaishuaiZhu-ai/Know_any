---
type: codex-reflection
title: "全局 Codex 工作流复盘"
created: 2026-05-26
updated: 2026-05-26
tags:
  - codex
  - reflection
  - workflow
  - skills
status: active
scope: project
source:
  - "notes/codex-daily/2026-05-18.md .. 2026-05-25.md"
  - "C:\Users\18355\.codex\automations\automation\memory.md"
  - "C:\Users\18355\.codex\memories\MEMORY.md"
  - "C:\Users\18355\.codex\session_index.jsonl tail summary"
  - "codex-reflection-archiver, Cross-Session Learning, memory-management-model, source-command-brainstorming, source-command-verify"
---

# 全局 Codex 工作流复盘

## 1. 结论

本次全局复盘的核心结论是：Codex 在你的环境里最有价值的能力不是单次回答，而是能围绕真实证据、远端 source-of-truth、Windows 本地配置和 Obsidian 知识库形成可追溯工作流。最大短板也很明确：过去几天多次暴露出“文件存在不等于调度生效”“解析成功不等于用户可读”“session 路径日期不等于真实工作窗口”“没有验证不等于完成”。

今天最该执行的改进是把反思流程固定为：先读上一份反思，再建立 session 覆盖清单，再产出 Obsidian 文档，最后做用户视角的编码/结构验证。任何没有证据的内容必须写“证据不足，无法确认。”

## 2. 证据来源

- 已读取当前项目日报：2026-05-18、2026-05-19、2026-05-20、2026-05-21、2026-05-22、2026-05-25。
- 已读取 automation memory，覆盖 Daily Codex Self-Review 的多次修复、漏跑、编码、Obsidian 归档和 skill 沉淀记录。
- 已读取 Obsidian `codex-reflection` 索引、`wiki/log.md`、`wiki/hot.md`。
- 已读取全局 MEMORY.md 中 automation、PowerShell、乱码、CodeRabbit、主动 skill 使用等规则。
- 已读取 `session_index.jsonl` 尾部摘要，只使用 thread name 和 updated_at，不展开原始 session 正文。
- 已读取并应用这些 skills：`Cross-Session Learning`、`memory-management-model`、`source-command-brainstorming`、`source-command-verify`、`codex-reflection-archiver`。

## 3. 做得好的地方

1. 反思任务逐步从聊天答复升级为可追溯知识资产：项目日报、Obsidian `codex-reflection`、wiki log 和 hot cache 已经形成基本闭环。
2. Daily Review 的证据边界越来越清晰：非 git 目录不再假装有 git 证据，缺 build/test/logs 时明确写证据不足。
3. 用户指出“乱码”和“没有 review”后，后续流程开始把用户可见视图纳入验证，而不是只看 TOML 解析或文件存在。
4. 对 automation 的理解更准确：不能把手写 `automation.toml` 等同于 scheduler registry 生效；不能为了 UI 可见性破坏 scheduler-known ID。
5. 对 review 工具定位更稳：CodeRabbit 适合作第二 reviewer，不替代上下文审查和真实验证；PowerShell 是 Windows 本地默认，Git Bash 只在 bash-native 场景更合适。
6. 在远端/固件类任务上，长期规则保持正确：需要回到真实机器、真实路径、真实日志，不用旧记忆替代当前 source-of-truth。

## 4. 做得不好的地方

1. automation 初期修改后没有做充分 review，尤其漏掉了用户实际打开时看到的编码问题。
2. 曾把“目录里有 active TOML”误判为“调度器会执行”，导致 Daily Review 出现漏跑。
3. 早期 Daily Review 只按 `sessions/YYYY/MM/DD` 路径日期读 session，漏掉创建较早但当天继续更新的长期会话。
4. 反思结果曾过于依赖当前 notes-only workspace，导致真实主用户任务和远端任务覆盖不足。
5. 自定义反思 skill 已存在，但当前会话显式 skill 列表里未稳定出现，说明 skill 加载链路仍有断点。
6. 多处规则散落在 automation prompt、Obsidian、MEMORY.md、日报和聊天里，缺少一个短小稳定的项目入口规则。

## 5. 可能根因

| 类别 | 判断 |
|---|---|
| Prompt 不清楚 | 多次只说“总结反思”或“让 automation 可见”，没有同时规定输出路径、证据窗口和触发链路验收。 |
| Context 不足 | 当前项目是 notes-only workspace，不是业务 repo；git/build/test 证据天然不足。 |
| 任务范围过大 | 一次复盘常常跨 automation、skills、wiki、memory、session、远端项目和工具插件。 |
| 验证不足 | 过去偏重解析成功、文件存在，轻视用户可见显示、scheduler tick、live validation。 |
| Skill 不稳定 | 反思归档 skill 已落盘，但不总是出现在当前显式 skill 列表；需要入口规则兜底。 |
| AGENTS.md 信息不足 | 当前目录没有持久 AGENTS.md 文件；用户提供的 AGENTS 指令只存在于会话上下文。 |
| Windows 编码问题 | PowerShell 默认显示、UTF-8 BOM、脚本写入路径都可能造成中文 mojibake。 |
| 人工 review 不足 | 关键配置变更后没有形成固定“二次审查 + 用户视角复核”。 |

## 6. Prompt 质量复盘

好的 prompt 模式应该包含：目标、时间窗口、证据来源、允许写入路径、禁止事项、验证方式、done when、是否需要写 Obsidian、是否需要更新 memory。

坏的 prompt 模式是：只说“总结一下”“优化一下”“让它可见”，但不说证据来源和验收条件。这类 prompt 容易导致我把推测当事实，或把文件层成功当系统层成功。

建议以后使用：

```text
目标：执行一次 Codex 全局总结反思。
范围：读取最近日报、automation memory、Obsidian codex-reflection、MEMORY.md 相关规则、session_index 摘要；不要展开原始敏感 session。
输出：写入 C:\home\for_ai\wiki\codex-reflection\projects\YYYY-MM-DD-global-codex-workflow-review.md，并更新 index/log/hot。
限制：不改业务代码、不 commit、不 push、不删除文件、不直接改 AGENTS.md、不创建 Skill、不写长期 memory，除非我明确批准。
验证：写完后检查文件存在、frontmatter、关键章节、UTF-8 可读、索引链接存在。
无证据：必须写“证据不足，无法确认。”
```

## 7. 验证复盘

| 验证项 | 当前证据 | 结果 | 风险 |
|---|---|---|---|
| 当前项目 git | `git status` / `git log` 报当前目录不是 git repo | 未验证业务 diff | 不能总结业务代码变更 |
| build/test | 当前 notes workspace 未发现 build/test 日志 | 证据不足，无法确认 | 不能声称质量通过 |
| automation 触发 | 既有日报显示多次需要手动补跑；2026-05-25 仍提示自动触发未闭环 | 证据不足，无法确认 | 不能声称 Daily Review 已稳定 |
| Obsidian 归档 | `codex-reflection` 目录、daily/evolution/projects 已存在 | 有文件证据 | 需要继续验证新文档可读 |
| 编码显示 | 历史 MEMORY.md 和日报都记录过 mojibake 风险；本次默认 PowerShell 读 2026-05-25 曾显示乱码，显式 UTF-8 正常 | 风险仍存在 | 必须显式 UTF-8/BOM 验证 |
| skill 使用 | 本次已读取 5 个相关 skill/skill 文件 | 已应用 | 自定义 skill 不一定在显式列表里 |
| 原始 session | 本次只读 session_index 摘要 | 有意限制 | 可能漏掉具体上下文，但降低 secret 风险 |

## 8. Skills 使用复盘

| Skill | 用途 | 是否有效 | 问题 | 建议 |
|---|---|---|---|---|
| Cross-Session Learning | 读取跨会话经验，避免重复踩坑 | 有效 | 其默认 `.Codex/learnings` 结构与当前实际 memory 系统不完全一致 | 作为历史经验读取入口使用，不机械套目录 |
| memory-management-model | 判断哪些写 Obsidian、哪些可进长期 memory | 有效 | 长期 memory 写入需要用户明确授权 | 本次只写 wiki，不写 memory |
| source-command-brainstorming | 发散改进工作流 | 部分有效 | 该 skill 偏设计流程，硬性“先设计再实现”不完全适配复盘落盘 | 只借用方案发散，不创建 spec/commit |
| source-command-verify | 完成前强制证据检查 | 有效 | 不能证明业务 build/test | 用于文件、结构、编码、索引验证 |
| codex-reflection-archiver | 指定 Obsidian 归档路径和文档契约 | 有效 | 当前显式技能列表未稳定展示 | 建议写入 AGENTS.md 作为入口规则 |

## 9. 是否需要沉淀新 Skill

| 候选 Skill | 是否建议 | 触发条件 | 输入 | 输出 | 验证方式 | 优先级 |
|---|---|---|---|---|---|---|
| codex-session-safe-summary | 建议，但需用户批准后再创建 | 需要从 session JSONL 提炼日报/复盘摘要且避免 secret 泄露 | session_index、白名单 session 文件、时间窗口 | 脱敏覆盖清单、主用户会话摘要、风险项 | 人工检查无 secret、覆盖所有主会话、排除 guardian/approval 噪声 | P1 |
| codex-reflection-quality-gate | 暂不创建，先用 checklist | 每次写反思、日报、Obsidian 复盘后 | 产物路径、章节要求、索引路径 | 验证报告 | frontmatter、章节、链接、UTF-8、最终摘要 | P2 |

不要立即创建 skill 的原因：本次用户没有明确批准创建 skill；而且已有 `codex-reflection-archiver`、`codex-automation-registry-check` 能覆盖一部分需求。

## 10. 是否需要更新 AGENTS.md

建议更新，但不要直接修改。建议新增短规则：

```md
当用户要求 Codex 自我反思、总结反思、复盘、项目总结或工作流进化时：
1. 必须先读取上一份相关反思和当前可见证据。
2. 必须写入 C:\home\for_ai\wiki\codex-reflection\ 对应目录。
3. 不直接展开原始 session 中的敏感内容；无证据必须写“证据不足，无法确认。”
4. 写完后必须验证 frontmatter、章节、索引链接和 UTF-8 可读性。
5. 不修改业务代码、AGENTS.md、Skill 或长期 memory，除非用户明确批准。
```

## 11. 工作流改进建议

1. 反思类任务固定四步：读上一份反思 -> 建证据清单 -> 写 Obsidian -> 验证用户可见视图。
2. automation 修改固定五层验证：config 文件、scheduler-known ID、schedule/timezone、实际 session_index、输出产物/最终可见摘要。
3. Windows 写中文文档时固定使用 UTF-8 BOM，并用显式 UTF-8 读取复核。
4. 对 remote repo 和固件任务，继续保持“远端真实路径优先”，旧记忆只能当索引，不能当当前事实。
5. CodeRabbit 只作为额外 reviewer；主线 review 仍应由上下文审查 + 本地/远端验证完成。
6. 全局总结不要直接写长期 memory；先写 Obsidian，等用户明确批准再把稳定规则沉淀到 memory。

## 12. 今天应该做什么

- 验证本次全局复盘文档、索引、log、hot cache 是否写入且 UTF-8 可读。
- 下次 09:00 JST 后检查 Daily Codex Self-Review 是否真的自动生成 2026-05-27 日报和 Obsidian copy。
- 如果用户同意，给出 `AGENTS.md` 反思入口规则草案，而不是直接修改。
- 如果用户同意，设计 `codex-session-safe-summary` skill 草案，先 review 后创建。

## 13. 今天不应该做什么

- 不要把本次全局复盘说成业务代码 review。
- 不要声称 build/test/remote build 通过。
- 不要展开原始 session JSONL 或输出疑似敏感信息。
- 不要自动改 AGENTS.md、automation prompt、skill 文件或长期 memory。
- 不要把一次手动复盘当成 automation 自动触发已稳定的证据。

## 14. 未验证项和风险

| 风险 | 当前证据 | 影响 | 下一步 |
|---|---|---|---|
| Daily Review 自动触发仍可能不稳定 | 2026-05-25 日报仍记录手动触发和触发链路未闭环 | 每日复盘可能继续漏跑 | 下次定时后检查 session_index 和文件产物 |
| 反思 skill 加载不稳定 | `codex-reflection-archiver` 文件存在，但当前显式 skill 列表未显示 | 未来可能忘记写 Obsidian | 用 AGENTS.md 入口规则兜底 |
| session 摘要存在漏读/泄密双重风险 | 过去日报多次提到 long session、guardian/approval 和 secret handling | 复盘可能不完整或不安全 | 创建安全摘要 skill 前先让用户批准 |
| 当前项目非 git repo | 当前目录只有 notes，git 命令失败 | 不能复盘业务代码变更 | 需要业务复盘时切到真实 repo |
| 编码/显示仍有摩擦 | 默认 PowerShell 曾显示 2026-05-25 乱码 | 用户可能误判文件损坏 | 每次写后做显式 UTF-8/BOM 验证 |

## 15. 本次复盘的后续建议 Prompt

```text
请基于今天这份全局 Codex 工作流复盘，起草一个 AGENTS.md 规则补丁。
限制：先只展示草案，不要直接修改文件；重点覆盖反思归档、session 安全摘要、证据不足措辞、UTF-8 验证、automation 触发链路验证。
```

## 16. Secret Handling

本次没有展开原始 session JSONL 正文，没有输出 token、账号、密钥、auth.json 或环境变量敏感值。若原始证据中存在疑似敏感信息，应只记录：发现疑似敏感信息，已省略具体值。