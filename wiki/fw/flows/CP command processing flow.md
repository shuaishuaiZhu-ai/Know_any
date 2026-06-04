---
type: topic
title: "CP command processing flow"
created: 2026-05-09
updated: 2026-05-09
tags: [cp, command-flow, hcqd, ib, cmd_entry]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
---

# CP command processing flow

> CP 命令处理链路是：host/UMD 写 ringbuffer，doorbell 通知 CP，[[HCQD]] fetch，[[Interaction-Buffer]] 暴露 packet，[[cmd_entry]] 选择处理路径，最后由 [[iDMA]] 或 firmware 完成分发。

## 主流程

1. host/UMD/KMD 通过 [[MCQD]] 对应的 ringbuffer 写入 command packet。
2. UMD 更新 wptr 并触发 doorbell。
3. Master MCU 将 ready 的 MCQD bind 到 [[HCQD]]。
4. HCQD fetch packet 到 rb_fifo，并设置 candidate bit。
5. [[cmd_entry]] 读取 candidate mask，选择一个 HCQD。
6. `ib_peek_packet()` 读取 header/body 信息，判断 operator 和 block_mask。
7. `cmd_handle_packet()` 按 operator id 分派：
   - job/sdma：通常通过 [[iDMA]] dispatch 并 consume。
   - atomic：通过 [[iDMA]] 投递到 ATO FIFO，cmp_swap 有 retry/consume 细节。
   - event/wait/nop：firmware 处理并 finish。
   - wait_host：trigger + polling 两阶段处理。

## iDMA 与 firmware 分流

- MAS 明确 event signal/event wait 需要 firmware 参与，所以 event packet 不能只走 `idma_dispatch_packet()`，必须进入 `cmd_handle_event_packet()`。
- 代码里分发类型包括 `CMD_DISPATCH_BY_IDMA_DIRECT`、`CMD_DISPATCH_BY_IB_BUFFER`、`CMD_DISPATCH_BY_IDMA_THREAD`，对应不同 fast path。
- job/sdma/atomic 的高价值路径是 iDMA direct，因为能减少 firmware 逐字搬运 packet 的开销。

## 延伸

- [[GraceC CP MAS v1.4]]
- [[fw CP user firmware code summary]]
- [[CP-Command-Packet]]
- [[cmd_entry]]
