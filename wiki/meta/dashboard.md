---
type: meta
title: "Dashboard"
created: 2026-05-09
updated: 2026-05-14
tags:
  - meta
  - dashboard
status: active
---

# Dashboard

## Quick Links

- [[wiki/index|Wiki 总索引]]
- [[wiki/fw/index|FW 技术知识库]]
- [[wiki/fw/cli/index|CLI 索引]]
- [[wiki/hot|Hot Cache]]
- [[wiki/overview|Wiki Overview]]
- [[wiki/meta/wiki-maintenance-rules|Wiki 维护规则]]

## Main FW Pages

| Page | Role |
|---|---|
| [[wiki/fw/source-maps/GraceC CP MAS v1.4 code knowledge map|GraceC CP MAS v1.4 code knowledge map]] | MAS 与代码映射 |
| [[wiki/fw/flows/CP command processing flow|CP command processing flow]] | 端到端命令流程 |
| [[wiki/fw/cp-user/cmd_entry|cmd_entry]] | CP User hot loop |
| [[wiki/fw/concepts/Interaction-Buffer|Interaction-Buffer]] | HCQD 与 firmware 接口 |
| [[wiki/fw/concepts/iDMA|iDMA]] | fast dispatch path |
| [[wiki/fw/cp-user/CP stop flush 与 queue 切换|CP stop flush 与 queue 切换]] | stop/flush（含调度优先级视角） |
| [[wiki/fw/cli/agc_shell-cli-path|agc_shell CLI 输入输出路径]] | CLI 卡顿路径 |

## Folder Model

- `.raw/` — immutable source material.
- `wiki/index.md` — single master index.
- `wiki/fw/` — firmware technical knowledge, subdivided by CP, CLI, RT-Thread, concepts, flows, performance, debug.
- `wiki/synthesis/` — cross-source conclusions, work notes, interview material.
- `wiki/sources/` — source mirrors and source indexes; use for evidence checks.
- `wiki/tools/` — tool-specific knowledge.
- `wiki/canvases/` — Obsidian canvas files.
- `wiki/meta/` — maintenance rules, dashboard, audit.