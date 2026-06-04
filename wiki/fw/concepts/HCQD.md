---
type: entity
title: "HCQD"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, queue, hcqd, hardware]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
related:
  - "[[wiki/fw/learnings/hcqd-scheduling|HCQD 调度设计与版本演进]]"
---

# HCQD

> HCQD 是 Hardware Command Queue Descriptor，负责从 ringbuffer fetch command packet，并把可执行/待处理状态暴露给 CP firmware。

## 职责

- 从 ringbuffer fetch 1024-bit command packet。
- 维护 read pointer，并访问 host/device memory。
- 将 rb_fifo 中的 packet 暴露给 [[Interaction-Buffer]]。
- candidate bit 表示哪个 HCQD ready，供 `ib_get_candidate_bitmask()` 读取。
- stop/flush 时停止 fetch，等待 read 回来，并进入 queue stopped 状态。

## 代码入口

- `ib_get_candidate_bitmask()`：读取 8-bit candidate mask。
- `ib_peek_packet()`：从 peek FIFO 查看 header/body，不真正消费 packet。
- `ib_read_packet()`：等待 [[iDMA]] idle，切换 use_idma，从 rb_fifo 读取 packet。
- `ib_consume_packet()` / `ib_drop_packet()` / `ib_finish_packet()`：向硬件提交 consume/drop/finish 动作。
- `sf_drop_hcqd_packets()`：stop/flush 时根据 cost_osd_cnt drop IB resident packet。

## 延伸

- [[Interaction-Buffer]]
- [[cmd_entry]]
- [[CP stop flush 与 queue 切换]]
