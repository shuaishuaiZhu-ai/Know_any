---
type: codex-reflection
title: "Codex 反思归档 Skill 与 Obsidian 目录"
created: 2026-05-22
updated: 2026-05-22
tags:
  - codex
  - reflection
  - evolution
  - skill
status: active
scope: evolution
source:
  - "C:\Users\18355\.codex\skills\codex-reflection-archiver\SKILL.md"
  - "C:\Users\18355\.codex\automations\automation\automation.toml"
---

# Codex 反思归档 Skill 与 Obsidian 目录

## 1. 改动结论

新增 `codex-reflection-archiver` skill，并建立 Obsidian 目录 `wiki/codex-reflection/`，用于保存 Daily Codex Self-Review、项目复盘、自我反思、automation/prompt/skill 进化文档。

## 2. 触发原因

用户要求：只要进行自我反思、总结、项目自我反思，都要生成对应文档，并存储到 Obsidian 的专用目录中。

## 3. 改动内容

- 新增 Obsidian 入口：`C:\home\for_ai\wiki\codex-reflection\index.md`。
- 新增分类目录：`daily/`、`projects/`、`evolution/`。
- 新增 skill：`C:\Users\18355\.codex\skills\codex-reflection-archiver\SKILL.md`。
- 更新 Daily Review automation prompt：每日反思除项目本地 `notes/codex-daily/YYYY-MM-DD.md` 外，还要写入 Obsidian durable copy。
- 回填已有 `notes/codex-daily/*.md` 到 `wiki/codex-reflection/daily/`。

## 4. 验证

- skill frontmatter、名称、触发描述、daily/projects/evolution 路径均存在。
- Obsidian 目录和 `index.md` 存在。
- automation prompt 保持 `id = "automation"`、`status = "ACTIVE"`、`Asia/Tokyo`，并包含 Obsidian 归档规则。

## 5. 剩余风险

- 当前 session 的 skills 列表不会动态刷新；新 skill 可能需要新会话后才出现在可用 skill 列表。
- automation 下一次运行是否同时写入 Obsidian，需要等下一次 09:00 JST 触发后验证。

## 6. 下次规则

以后遇到“自我反思 / 总结反思 / 项目复盘 / automation 进化 / prompt 进化 / skill 进化”，必须生成 Obsidian 文档到 `wiki/codex-reflection/` 下对应分类。