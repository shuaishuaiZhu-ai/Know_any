---
type: entity
title: "Interaction-Buffer"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, ib, mmio, hardware-interface]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
related:
  - "[[wiki/fw/cp-user/ib|FW: IB 寄存器与 API]]"
---

# Interaction-Buffer

> Interaction Buffer 是 CP firmware 访问 HCQD rb_fifo、下游 FIFO、event/interrupt 状态以及 MMIO 寄存器的中间接口。

## 关键寄存器/通道

- `rd_rb_candidate`：按 bit 表示哪个 [[HCQD]] ready。
- `rd_rb_peek[]`：peek FIFO，用于不消费 packet 的前提下查看 header/body。
- `rd_rb_data[]`：read FIFO，供 firmware 读取完整 packet。
- `wr_use_idma`：控制 [[iDMA]] 与 firmware 读取路径之间的切换。
- `wr_fw_consume_rb[]`：consume packet，并减少 cost OSD。
- `wr_fw_drop_rb[]`：drop packet，更新 HCQD exe/rptr 语义。
- `wr_fw_finish_rb[]`：finish event-like packet，减少 finish OSD。
- `wr_idma`：触发 iDMA 将 packet 投递到下游 FIFO。

## 行为

- `ib_read_packet()` 先调用 `ib_wait_idma_idle()`，再 disable use_idma，读取 packet 后重新 enable。
- `ib_dispatch_packet()` 走 firmware 写 FIFO 路径。
- `idma_dispatch_packet()` 通过 `wr_idma` 触发硬件搬运。

## 延伸

- [[HCQD]]
- [[iDMA]]
- [[cmd_entry]]
