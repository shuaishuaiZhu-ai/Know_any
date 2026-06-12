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

## event / atomic / wait_host 的特殊处理

> 本节由原 `CP event atomic wait host handling` 页合并而来。event、atomic、wait_host 是命令处理中最容易进入 firmware pending 状态的 packet 类型，不能简单按普通 job 处理。

### Event signal / wait

- Event signal 负责 record event entry、timestamp、fence、interrupt。
- Event wait 读取 [[Event-Table]] shadow dependency；dependency 未满足时进入 pending，由 [[cmd_entry]] 后续重试。
- dependency 未满足时 firmware 不消费 packet，而是通过 `event_entry_read_dependency()` 读目标 counter。
- event 类 packet 完成时调用 `ib_finish_packet()`，不同于 job 的 consume-only 语义。

### Atomic

- Atomic add/swap/cmp_swap 通过 [[iDMA]] 投递到 ATO FIFO。
- add/swap 通常 dispatch 后 consume；cmp_swap 可能 retry，consume 时机依赖 OSD 和比较结果。
- `cmd_status[hcqd_id].cur_atomic_handle_status` 与 `pending_mask` 决定 [[cmd_entry]] 是否继续阻塞该 HCQD。

### Wait_Host

- 两阶段：① barrier/OSD 满足后 firmware 把 `trig_value` 写到 `trig_addr` 通知 CPU；② 等待 CPU 更新 `polling_addr`，匹配 `expect_value` 后执行 fence/finish。
- 代码中 record、polling 和 event entry counter 存在耦合，需按 pending FSM 理解。

## 多队列 / 多上下文与 HCQD-MCQD

> 本节由原 `CP 多队列多上下文与 HCQD MCQD` 页合并而来，来源是 2025-09…2025-12 工作笔记的多 MCQD/多 context bring-up 主线。

### 关键事件

- 2025-09：多个 MCQD 并行时，先发现 MCQD addr 忘记加 base。
- 2025-09：根据 CP MAS，MCQD 需 128 字节连续存放才能被 query。
- 2025-09：两个 proc + 两个 MCQD 后，可见 HCQD0/HCQD1 轮流取 cmd 执行。
- 2025-12：多 context 下 context 1 的 HCQD attr 一直为 0，最后定位为 MCQD 未写。
- 2025-12：HCQD id 使用内部 id 而非 global HCQD id，改成 global 后解决。
- 2025-10：CP master 卡在 `qdma_get_mcqd_ready_status()` / `top_reg_get_mcqd_doorbell_id()` 一类 doorbell/query 路径。

### 设计原则

- MCQD 地址布局必须和硬件 query 逻辑一致。
- HCQD id 要区分 local/internal id 和 global id。
- 多 context 下 attr/asid 必须从 [[MCQD]] 到 [[HCQD]] 保持一致。
- query/bind/doorbell 是跨 master MCU、HCQD 和 firmware 的系统链路，不能只看单个函数。

## 延伸

- [[GraceC CP MAS v1.4]]
- [[fw CP user firmware code summary]]
- [[CP-Command-Packet]]
- [[Event-Table]]
- [[cmd_entry]]
- [[HCQD]]
- [[MCQD]]
- [[GraceC-CP]]
