---
type: entity
title: "Interaction-Buffer"
created: 2026-05-09
updated: 2026-06-18
tags: [entity, cp, ib, mmio, hardware-interface]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
related:
  - "[[wiki/grace/fw/cp-user/ib|FW: IB 寄存器与 API]]"
---

# Interaction-Buffer

> Interaction Buffer（IB）是 Host（KMD）与 CP User 固件之间的硬件共享内存接口，映射到 `INTERACTION_BUFFER_BASE`。它是 CP firmware 访问 HCQD rb_fifo、下游 FIFO、event/interrupt 状态以及 MMIO 寄存器的中间接口。每个 [[HCQD]] 有独立的 IB 通道。

本页是 IB 的概念与寄存器/语义权威页；CP User 代码侧的 C API 与锁规则见 [[ib]]。

## 关键寄存器/通道

读侧（firmware 观察/消费 packet）：

| 寄存器/通道 | 类型 | 说明 |
|---|---|---|
| `rd_rb_candidate` | 状态（idempotent） | 8-bit bitmask，每 bit 表示对应 [[HCQD]] 是否有待处理包 |
| `rd_rb_peek[hcqd]` | **FIFO（消费型）** | peek FIFO，不消费前提下查看 header/body；每次读消费一个 word |
| `rd_rb_data[]` | read FIFO | 供 firmware 读取完整 packet |
| `rd_rb_cnt[hcqd]` | 状态 | 当前 HCQD RingBuffer 中的包数量 |
| `rd_idma_status` | 状态 | [[iDMA]] 空闲/忙状态 |

写侧（firmware 控制/通知）：

| 寄存器/通道 | 说明 |
|---|---|
| `wr_use_idma` | 控制 [[iDMA]] 与 firmware 读取路径之间的切换 |
| `wr_fw_consume_rb[]` | consume packet，并减少 cost OSD |
| `wr_fw_drop_rb[]` | drop packet，更新 HCQD exe/rptr 语义 |
| `wr_fw_finish_rb[]` | finish event-like packet，减少 finish OSD |
| `wr_idma` | 触发 iDMA 将 packet 投递到下游 FIFO |

## 行为

- `ib_read_packet()` 先调用 `ib_wait_idma_idle()`，再 disable use_idma，读取 packet 后重新 enable。
- `ib_dispatch_packet()` 走 firmware 写 FIFO 路径。
- `idma_dispatch_packet()` 通过 `wr_idma` 触发硬件搬运。

## 语义注意

`flush_asid` 字段的 **bit5 是 valid flag**，不能直接比较 ASID：

```c
// 错误
if (flush_asid == target_asid) ...
// 正确
if ((flush_asid & 0x1F) == target_asid) ...
```

## 延伸

- [[HCQD]]
- [[iDMA]]
- [[cmd_entry]]
- [[ib]] — CP User 代码侧 IB API 与锁规则
