---
type: entity
title: "Event-Table"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, event, dependency]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
---

# Event-Table

> Event Table 维护 stream/event 状态。event signal 更新 entry，event wait 读取 dependency，并决定 packet 是否需要 pending。

## 职责

- event signal record 路径通过 `event_entry_set_counter()` 更新 event entry counter/keep。
- event wait 读取 shadow entry，检查 dependency 是否满足。
- dependency 未满足时，`event_entry_read_dependency()` 读取目标 entry 的 counter 信息。
- event signal/wait 处理完成后，firmware 通过 `ib_finish_packet()` 结束 HCQD packet。

## 代码入口

- `cmd_handle_event_packet()`：event signal/event wait/NOP 分派。
- `event_entry_check_shadow_dependency()`：shadow dependency check。
- `event_entry_read_dependency()`：读取 dependency。
- `cmd_handle_event_barrie_packet()`：signal/record/timestamp/fence/interrupt 处理。
- `cmd_handle_event_wait_packet()`：wait dependency/timestamp/fence/interrupt 处理。

## 延伸

- [[CP command processing flow]]
- [[CP-Command-Packet]]
- [[cmd_entry]]
