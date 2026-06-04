---
type: codex-reflection
title: "Daily Codex Self-Review Skill 更新"
created: 2026-06-01
updated: 2026-06-01
tags:
  - codex
  - reflection
  - skill
  - daily-review
status: active
scope: evolution
source:
  - "2026-06-01 project session review"
  - "Daily Codex Self-Review automation memory"
  - "Superpowers writing-skills"
---

# Daily Codex Self-Review Skill 更新

## 1. 改动结论

新增 `codex-daily-self-review`，把每日复盘从“大段 automation prompt”沉淀成可触发的专用 skill。核心规则改成：默认覆盖目标窗口内所有项目级 session，按项目分组复盘；复盘后分别判断项目集 `AGENTS.md` 与全局 `AGENTS.md` 是否需要更新，但不直接修改。

## 2. 触发原因

最近复盘暴露出两个稳定问题：一是日报容易只看当前目录、最近文件或单个长期会话，遗漏其他主项目 session；二是复盘会提出经验，但没有稳定判断这些经验应写入项目集还是全局 `AGENTS.md`。

## 3. 根因

旧规则把 session 覆盖、归档、automation registry、prompt 模板、skill 沉淀混在一起，导致每日复盘 prompt 过长且职责不清。真正需要稳定复用的是证据收集、项目分组、风险归因和 AGENTS.md 决策门禁。

## 4. 改动内容

- 新增 `C:\Users\18355\.codex\skills\codex-daily-self-review\SKILL.md`。
- 新增对应 `agents/openai.yaml` 元数据。
- 更新 `codex-reflection-archiver`：每日复盘证据收集先用 `codex-daily-self-review`，归档 skill 只负责 Obsidian 持久化和索引。
- 删除不重要功能的含义是从每日复盘工作流中剔除：为写日报而跑 build/test、自动修 bug、自动改 AGENTS.md、自动创建 skill、dump 原始 transcript、只看当前 cwd 或 git diff。

## 5. 验证

已规划验证：检查 skill frontmatter、触发词、session 覆盖规则、AGENTS.md 决策门禁、secret guardrail、UTF-8/BOM 可读性，以及 Obsidian index/log/hot 是否包含入口。

## 6. 剩余风险

本次没有使用 subagent 做 Superpowers 要求的压力测试，因为当前会话没有单独获得 subagent 委派授权。后续可以用三个压力场景验证：只看当前目录、把 guardian 当主任务、直接改 AGENTS.md。

## 7. 下次规则

每日复盘时，先触发 `codex-daily-self-review` 做 session 覆盖和项目分组，再用 `codex-reflection-archiver` 落地 Obsidian；只有 automation 配置本身出问题时才触发 `codex-automation-registry-check`。