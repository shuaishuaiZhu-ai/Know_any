---
type: entity
title: "CP-Firmware-CPE"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, firmware, cpe, nx900]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
---

# CP-Firmware-CPE

> CP-Firmware-CPE 运行在 NX900 RISC-V core 上，是 command execute firmware，负责 packet decode、queue 状态管理、event/atomic/wait_host 等固件路径。

## 职责

- 在 [[cmd_entry]] 中轮询 8 个 HCQD 的 candidate、pending、stop、flush 状态。
- 将 job/sdma/atomic 等 packet 通过 [[iDMA]] 或 IB buffer dispatch。
- 处理 event signal/wait、wait_host、NOP 等 firmware-only packet。
- 维护 per-HCQD `cmd_hcqd_ctx_t`，包括 atomic/event/block_mask/wait_host pending 状态。

## 代码

- `cmd.c`：command handling 主体。
- `cmd.h`：operator id 和 context 定义。
- `event_entry.c`：event dependency 处理。
- `sf.c`：stop/flush 处理。

## 延伸

- [[cmd_entry]]
- [[CP-Command-Packet]]
- [[CP event atomic wait host handling]]
