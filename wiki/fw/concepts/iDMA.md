---
type: entity
title: "iDMA"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, idma, fast-path]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
---

# iDMA

> iDMA 是 CP 内部搬运路径，用于把 HCQD rb_fifo 中的 command packet 直接搬运到下游 FIFO，减少 firmware 逐字读写。

## 职责

- `idma_transfer_operator_to_dispatch_type()` 根据 operator id 选择目标 FIFO。
- `idma_dispatch_packet()` 等待 iDMA idle，设置 src=HCQD id、dst=目标 FIFO、length=body_size+1。
- atomic packet 需要附加 FIFO 目标、hcqd_id 和 offset。
- MAS 约束：event signal/event wait 需要 firmware 处理，不能只依赖 iDMA 直接投递。

## 目标

- Job -> CLS FIFO
- SDMA -> SDMA FIFO
- Atomic -> ATO FIFO
- VPU -> VPU FIFO

## 延伸

- [[Interaction-Buffer]]
- [[CP command processing flow]]
- [[CP event atomic wait host handling]]
