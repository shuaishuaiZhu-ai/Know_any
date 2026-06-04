---
type: note
title: "IB — Interaction Buffer"
created: 2026-05-09
updated: 2026-05-09
tags:
  - fw
  - cp-user
  - ib
  - hardware-interface
status: active
source:
  - "[[fw CP user firmware code summary]]"
  - "[[Interaction-Buffer]]"
---

# IB — Interaction Buffer

**文件**: `fw/aigc_sdk/grace/applications/cp/user/ib.c / ib.h`
**关联**: [[cmd_entry]] | [[../learnings/review-rules]]

---

## 概念

IB（Interaction Buffer）是 Host（KMD）与 CP User 固件之间的硬件共享内存接口，映射到 `INTERACTION_BUFFER_BASE`。

每个 HCQD（Hardware Command Queue Descriptor）有独立的 IB 通道。

---

## 关键寄存器

| 寄存器 | 类型 | 说明 |
|--------|------|------|
| `rd_rb_candidate` | 状态（idempotent） | 8-bit bitmask，每 bit 表示对应 HCQD 是否有待处理包 |
| `rd_rb_peek[hcqd]` | **FIFO（消费型）** | 每次读消费一个 word，依次读取包头/包体 |
| `rd_rb_cnt[hcqd]` | 状态 | 当前 HCQD RingBuffer 中的包数量 |
| `rd_idma_status` | 状态 | iDMA 空闲/忙状态 |

---

## 锁规则（关键）

| 操作 | 是否需要中断锁 | 原因 |
|------|--------------|------|
| `ib_get_candidate_bitmask()` | **不需要** | 读 `rd_rb_candidate`，idempotent，多次读返回同值 |
| `ib_peek_packet()` | **必须在锁内** | 读 `rd_rb_peek` FIFO，并发读会破坏顺序/状态 |
| `ib_consume_packet()` | **必须在锁内** | 同上，消费操作不可并发 |
| `ib_finish_packet()` | **必须在锁内** | 写 IB 完成通知 |

---

## 主要接口

```c
// 读整个 candidate bitmask（8 个 HCQD 一次），Phase 1 锁外调用
rt_uint32_t ib_get_candidate_bitmask(void);

// Peek 包头+包体到 pkt 缓存，内部自己拿锁（Phase 2 调用时已在锁内）
void ib_peek_packet(rt_uint32_t hcqd_id, void *pkt);

// 消费（dequeue）当前包
void ib_consume_packet(rt_uint32_t hcqd_id);

// 通知 Host 包已完成
void ib_finish_packet(rt_uint32_t hcqd_id);

// 查询 OSD（Outstanding Descriptor）计数，用于 block_mask 检查
rt_uint32_t ib_get_osd_count(rt_uint32_t hcqd_id, rt_uint32_t type, rt_uint32_t mode);
```

---

## flush 中的 ASID 处理

`flush_asid` 字段 bit5 是 valid flag，**不能直接比较 ASID**：
```c
// 错误
if (flush_asid == target_asid) ...

// 正确
if ((flush_asid & 0x1F) == target_asid) ...
```
