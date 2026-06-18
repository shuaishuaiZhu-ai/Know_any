---
type: note
title: "IB — Interaction Buffer"
created: 2026-05-09
updated: 2026-06-18
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

> 本页只讲 **CP User 代码侧**的 IB 使用：C API 与锁规则。IB 的概念、完整寄存器/通道表与语义（含 `flush_asid` bit5 valid flag）见 [[Interaction-Buffer]]。

**文件**: `fw/aigc_sdk/grace/applications/cp/user/ib.c / ib.h`
**关联**: [[cmd_entry]] | [[../learnings/review-rules]] | [[Interaction-Buffer]]

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
