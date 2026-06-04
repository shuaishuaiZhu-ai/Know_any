---
type: topic
title: "CP event atomic wait host handling"
created: 2026-05-09
updated: 2026-05-09
tags: [cp, event, atomic, wait_host, pending]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
---

# CP event atomic wait host handling

> event、atomic、wait_host 是 CP command processing 中最容易进入 firmware pending 状态的 packet 类型，不能简单按普通 job 处理。

## Event signal / wait

- Event signal 负责 record event entry、timestamp、fence、interrupt。
- Event wait 读取 [[Event-Table]] shadow dependency，dependency 未满足时进入 pending，并由 [[cmd_entry]] 后续重试。
- dependency 未满足时，firmware 不消费 packet，而是通过 `event_entry_read_dependency()` 读取目标 counter。
- event 类 packet 完成时调用 `ib_finish_packet()`，不同于 job 的 consume-only 语义。

## Atomic

- Atomic add/swap/cmp_swap 通过 [[iDMA]] 投递到 ATO FIFO。
- add/swap 通常 dispatch 后 consume。
- cmp_swap 可能需要 retry，consume 时机依赖 OSD 和比较结果。
- `cmd_status[hcqd_id].cur_atomic_handle_status` 与 `pending_mask` 决定 [[cmd_entry]] 是否继续阻塞该 HCQD。

## Wait_Host

- Wait_Host 分两阶段：
  1. barrier/OSD 满足后，firmware 把 `trig_value` 写到 `trig_addr` 通知 CPU。
  2. 等待 CPU 更新 `polling_addr`，匹配 `expect_value` 后执行 fence/finish。
- 代码中 record、polling 和 event entry counter 存在耦合，需要按 pending FSM 理解。

## 延伸

- [[CP-Command-Packet]]
- [[Event-Table]]
- [[iDMA]]
- [[cmd_entry]]
