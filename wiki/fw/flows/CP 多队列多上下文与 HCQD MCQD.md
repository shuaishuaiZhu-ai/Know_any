---
type: topic
title: "CP 多队列多上下文与 HCQD MCQD"
created: 2026-05-09
updated: 2026-05-09
tags: [cp, hcqd, mcqd, multi-context, queue]
status: active
source:
  - "[[语雀工作笔记索引]]"
---

# CP 多队列多上下文与 HCQD MCQD

## 结论

2025-09 到 2025-12 的工作笔记主线是从单队列向多 MCQD、多 context、多 CLS/PE 的 bring-up 过渡。核心问题集中在 MCQD 地址布局、HCQD id 语义、context/asid 属性和 query/bind 流程。

## 关键事件

- 2025-09：多个 MCQD 并行时，先发现 MCQD addr 忘记加 base。
- 2025-09：根据 CP MAS，MCQD 需要 128 字节连续存放，才能被 query。
- 2025-09：使用两个 proc + 两个 MCQD 后，可以看到 HCQD0/HCQD1 轮流取 cmd 执行。
- 2025-12：多 context 下，context 1 的 HCQD attr 一直为 0，最后定位为 MCQD 未写。
- 2025-12：HCQD id 使用内部 id 而不是 global HCQD id，改成 global 后问题解决。
- 2025-10：CP master 卡在 `qdma_get_mcqd_ready_status()` / `top_reg_get_mcqd_doorbell_id()` 一类 doorbell/query 路径。

## 设计原则

- MCQD 地址布局必须和硬件 query 逻辑一致。
- HCQD id 要区分 local/internal id 和 global id。
- 多 context 下 attr/asid 必须从 MCQD 到 HCQD 保持一致。
- query/bind/doorbell 是跨 master MCU、HCQD 和 firmware 的系统链路，不能只看单个函数。

## 关联

- [[HCQD]]
- [[MCQD]]
- [[GraceC-CP]]
- [[CP command processing flow]]
