---
type: topic
title: "CP cmd_entry Candidate V7 调度设计"
created: 2026-05-09
updated: 2026-05-09
tags:
  - cp
  - cmd-entry
  - hcqd
  - candidate
status: active
---

# CP cmd_entry Candidate V7 调度设计

核心来源是 cmd_entry_roundrobin_design.md 以及 .claude 中多次 V3/V7 复盘。它们共同描述了从逐个扫描 HCQD，到使用 candidate bitmask、pending_mask、ctz/round-robin 的调度模型。

## 要点

- candidate 表示当前可尝试的 HCQD active 集合；每次 consume 一个 bit，避免重复 MMIO 扫描。
- pending_mask 表示已经 peek 到命令但不能立即完成的 HCQD，event/wait 类命令尤其需要避免重复 peek。
- round-robin 通过 next_hcqd + ctz 在 active bitmask 上选择下一个候选，目标是在效率和公平性之间平衡。
- V7 设计文档强调顺序：refresh candidate、处理 pending、选择 hcqd、peek/dispatch、根据状态 set/clear pending。

## 关联页面

- [[cmd_entry]]
- [[HCQD]]
- [[Interaction-Buffer]]
- [[CP candidate peek 热路径优化]]
- [[CP 分支预取与 cmd_entry 布局优化]]

## 来源

- **Learning: HCQD Round-Robin V3 Design Patterns** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\2026-03-31-hcqd-v3.md`
- **Learning: Candidate Bitmask Caching Pattern** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\candidate-cache-pattern.md`
- **Local Pointer Extraction: pending_mask Bitmask Pattern** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\local-pointer-extraction.md`
- **Struct Deduplication: Per-HCQD vs Global Pending** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\struct-deduplication.md`
- **Session Retro: 2026-03-31-1916 - HCQD Round-Robin V3 Design** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-03-31-1916.md`
- **Session Retrospective: 2026-04-07** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-07-candidate-cache.md`
- **Session Retrospective: 2026-04-08** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-v7-candidate-driven.md`
- **Session Retrospective: 2026-04-08** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-v7-context.md`
- **Session Retrospective: 2026-04-08 (V7 Document Update)** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-v7-doc-update.md`
- **CP User cmd_entry Candidate-Driven Dispatch 设计说明 V7** — `.raw/local-md/C-home-shuaishuai.zhu/fw\cmd_entry_roundrobin_design.md`