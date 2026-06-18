---
type: source
title: "GraceC CP MAS v1.4"
created: 2026-05-09
updated: 2026-05-09
tags: [source, cp, mas, spec]
status: active
source_type: local-docx
source_path: "C:\\work\\mas\\GraceC CP MAS_v1.4.docx"
source_extracted: "raw/notes/mas/2026-05-09-GraceC-CP-MAS-v1.4-extracted.md"
related:
  - "[[fw CP user firmware code summary]]"
---

# GraceC CP MAS v1.4

> GraceC CP MAS v1.4 是 [[GraceC-CP]] 的架构规格来源，描述 CP 如何接收 host/UMD/KMD 命令、管理 HCQD/MCQD、执行 stop/flush/event/atomic/wait_host 等流程。

## 来源

- 原始文档：`C:\work\mas\GraceC CP MAS_v1.4.docx`
- 提取文本：`raw/notes/mas/2026-05-09-GraceC-CP-MAS-v1.4-extracted.md`
- 版本信息：v1.4，2026-03-12，包含 submitJD 和 local_step 等更新。
- 代码参照：[[fw CP user firmware code summary]]

## 核心结论

1. [[GraceC-CP]] 是 GPU 命令处理单元，通过 mailbox、doorbell、ringbuffer 接收 host 侧命令包。
2. [[HCQD]] 从 ringbuffer fetch command packet，维护 read pointer，并将 packet 暴露给 [[CP-Firmware-CPE]]。
3. [[CP-Firmware-CPE]] 运行在 NX900 RISC-V core 上，负责 packet decode、queue 调度、event/atomic/wait_host 等固件路径。
4. job/sdma/vpu/atomic 主要通过 [[iDMA]] 投递到下游 FIFO；event signal/wait 通常由 firmware 处理。
5. queue scheduling 和 process flush 都依赖 stop/drain/drop/release 语义，最终落到 [[cmd_entry]] 的 stop/flush 处理路径。

## 关键对象

- [[GraceC-CP]]
- [[HCQD]]
- [[MCQD]]
- [[CP-Firmware-CPE]]
- [[Interaction-Buffer]]
- [[CP-Command-Packet]]
- [[iDMA]]
- [[Event-Table]]
- [[cmd_entry]]

## 与代码的对应

- MAS 的 HCQD 读取 command packet、CPE 处理、iDMA/firmware 分流，对应 [[Interaction-Buffer]]、`ib_read_packet()`、`idma_dispatch_packet()` 和 `cmd_dispatch_packet()`。
- MAS 的 event signal/event wait 固件处理，对应 `cmd_handle_event_packet()`、`event_entry_check_shadow_dependency()`、`ib_finish_packet()`。
- MAS 的 queue stopped 和 flush 过程，对应 `sf_handle_stop()`、`sf_handle_flush()` 和 `sf_drop_hcqd_packets()`。
- MAS 的 block_mask/OSD 等待语义，对应 `cmd_pkt_hdr_t.header.block_mask` 和 `cmd_check_block_mask_osd()`。

## 延伸

- [[CP command processing flow]]
- [[CP stop flush 与 queue 切换]]
- [[GraceC CP MAS v1.4 code knowledge map]]
