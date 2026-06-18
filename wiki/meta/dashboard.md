---
type: meta
title: "Dashboard"
created: 2026-05-09
updated: 2026-06-18
tags:
  - meta
  - dashboard
status: active
---

# Dashboard

## Quick Links

- [[wiki/index|Wiki 总索引]]
- [[wiki/grace/index|GraceC 芯片软硬件栈]]
- [[wiki/grace/fw/index|FW 技术知识库]]
- [[wiki/grace/fw/cli/index|CLI 索引]]
- [[wiki/hot|Hot Cache]]
- [[wiki/meta/wiki-maintenance-rules|Wiki 维护规则]]

## Main FW Pages

| Page | Role |
|---|---|
| [[wiki/grace/fw/GraceC CP MAS v1.4 code knowledge map|GraceC CP MAS v1.4 code knowledge map]] | MAS 与代码映射 |
| [[wiki/grace/fw/flows/CP command processing flow|CP command processing flow]] | 端到端命令流程 |
| [[wiki/grace/fw/cp-user/cmd_entry|cmd_entry]] | CP User hot loop |
| [[wiki/grace/fw/concepts/Interaction-Buffer|Interaction-Buffer]] | HCQD 与 firmware 接口 |
| [[wiki/grace/fw/concepts/iDMA|iDMA]] | fast dispatch path |
| [[wiki/grace/fw/cp-user/CP stop flush 与 queue 切换|CP stop flush 与 queue 切换]] | stop/flush（含调度优先级视角） |
| [[wiki/grace/fw/cli/agc_shell-cli-path|agc_shell CLI 输入输出路径]] | CLI 卡顿路径 |

## Folder Model

- `.raw/` — immutable source material.
- `wiki/index.md` — single master index.
- `wiki/grace/` — GraceC 芯片软硬件栈（产品栈层）：
  - `wiki/grace/mas/` — MAS 设计规格（RguCore/RGU/L2C）。
  - `wiki/grace/fw/` — FW 片上固件，按 IMC/CP Master/CP User/CLI/RT-Thread/concepts/flows/performance/interconnect/debug 分子目录。
  - `wiki/grace/kmd/` — KMD 主机内核驱动 `aigc.ko`（完整驱动）。
  - `wiki/grace/tiny-kmd/` — tiny-kmd 最小骨架驱动 + ajthunk 移植缺口。
- `wiki/synthesis/` — cross-source conclusions, work notes, interview material.
- `wiki/sources/` — source mirrors and source indexes; use for evidence checks.
- `wiki/tools/` — tool-specific knowledge.
- `wiki/codex-reflection/` — Codex workflow retrospectives and skill evolution.
- `wiki/canvases/` — Obsidian canvas files.
- `wiki/meta/` — maintenance rules, dashboard, audit.
