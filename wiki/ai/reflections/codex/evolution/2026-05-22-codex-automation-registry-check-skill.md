---
type: codex-reflection
title: "Codex Automation Registry Check Skill"
created: 2026-05-22
updated: 2026-05-22
tags:
  - codex
  - reflection
  - evolution
  - skill
  - automation
status: active
scope: evolution
source:
  - "C:\Users\18355\.codex\skills\codex-automation-registry-check\SKILL.md"
---

# Codex Automation Registry Check Skill

## 1. 改动结论

新增 `codex-automation-registry-check` skill，用于验证 Codex automation 从配置文件到调度器身份、实际运行、产物生成和消息送达的完整链路。

## 2. 触发原因

Daily Codex Self-Review 曾出现两类稳定失败模式：

- 手改 `automation.toml` 后，文件层看似 ACTIVE，但调度器并未接管新 ID，导致漏跑。
- 为了 UI 可见性迁移 active ID，破坏了 scheduler-known ID，导致 2026-05-21 没有自动生成日报和消息。

## 3. Skill 覆盖范围

- active `automation.toml` 数量检查。
- scheduler-known ID 与当前 ID 对齐检查。
- `status`、`rrule`、`timezone`、`cwds`、prompt contract 检查。
- `session_index.jsonl` 和 session jsonl 的实际触发证据检查。
- 输出产物和 inbox/final 可见消息检查。
- 常见故障诊断：未注册 ID、重复 active 配置、无产物、无消息、mojibake、长会话漏扫。

## 4. 验证

- `SKILL.md` 已创建并包含 frontmatter。
- `agents/openai.yaml` 已创建。
- Skill 明确区分 config layer、identity layer、schedule layer、execution layer、artifact layer、delivery layer。
- Skill guardrails 明确禁止 broad-scan `.codex`、读取 secret、为 UI 可见性迁移 active ID、无运行证据就声称修复。

## 5. 剩余风险

- 当前会话的 skills 列表不会动态刷新；新 skill 可能需要新会话后才稳定触发。
- 若未来官方提供 `automation_update` 工具，需要优先使用官方 registry 能力，而不是只手改 TOML。

## 6. 下次规则

任何 Codex automation 的创建、修改、迁移、启停、漏跑排查、消息未送达排查，都应先使用 `codex-automation-registry-check`。