---
type: note
title: "cmd_entry — CP User 调度器"
created: 2026-05-09
updated: 2026-05-09
tags:
  - fw
  - cp-user
  - cmd_entry
  - scheduler
status: active
source:
  - "[[fw CP user firmware code summary]]"
  - "[[CP cmd_entry Candidate V7 调度设计]]"
---

# cmd_entry — CP User 调度器

**文件**: `fw/aigc_sdk/grace/applications/cp/user/cmd.c`
**版本**: V7 Candidate-Driven Dispatch（当前）
**关联**: [[../learnings/hcqd-scheduling]] | [[ib]] | [[../cp-master/ipc_cmd]]

---

## 整体架构

`cmd_entry` 是 CP User 固件的主调度线程（RT-Thread 线程，`while(1)` 循环），负责从 IB（Interaction Buffer）读取 Host 下发的命令包（cmd_pkt）并分发执行。

```
while(1)
  └─ Phase 1（无锁预检）
  │    ├─ exception check → yield
  │    ├─ 刷新 candidate cache（MMIO，仅 empty 时读）
  │    ├─ active = candidate | pending_mask | stop_mask
  │    ├─ flush_bm = sf_get_flush_cxt_bitmap()
  │    └─ active==0 && flush_bm==0 → continue（跳过锁）
  └─ Phase 2（中断锁内）
       ├─ flush 最高优先：排空所有 pending ctx → continue
       ├─ cmd_find_next_hcqd(active, rr_start) → hcqd_id
       └─ 分发：stop / atomic / event / wait_host / block_mask / candidate
```

---

## 关键全局变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `cmd_status[8]` | `cmd_hcqd_ctx_t[]` | 每个 HCQD 的挂起状态 |
| `cmd_peek_pkt[8]` | `cmd_pkt_t[]` | peek 到的包缓存，跨迭代保持 |
| `candidate` | `rt_uint32_t` | HCQD candidate bitmask 缓存（MMIO only when empty） |
| `pending_mask` | `rt_uint32_t` | 有挂起状态的 HCQD bitmask |
| `rr_start` | `rt_uint32_t` | Round-Robin 起始 HCQD id |

---

## Phase 1：无锁预检

```c
// active 只含 hcqd-id 空间（0..7），flush_bm 单独
rt_uint32_t active   = candidate | pending_mask | sf_get_stop_bitmask();
rt_uint32_t flush_bm = sf_get_flush_cxt_bitmap();
if (active == 0U && flush_bm == 0U) continue;
```

- `candidate` 缓存：`ib_get_candidate_bitmask()` 是 MMIO 读，只在 candidate==0 时触发
- `sf_get_stop_bitmask()` / `sf_get_flush_cxt_bitmap()` 是 RAM 读，几乎无开销
- **flush_bm 不混入 active**：ctx-id 空间（0..31）≠ hcqd-id 空间（0..7），分开检查

---

## Phase 2：中断锁内调度

### Flush 最高优先
```c
rt_uint32_t cxt_bm = sf_get_flush_cxt_bitmap();   // fresh read under lock
while (cxt_bm != 0U) {
    rt_uint32_t cxt_id = __builtin_ctz(cxt_bm);
    rt_uint32_t flush_bitmap = sf_handle_flush(cxt_id);
    // reset cmd_status + 清 candidate/pending_mask
    cxt_bm &= cxt_bm - 1U;
}
rt_hw_interrupt_enable(level); continue;
```

### Round-Robin CTZ 分发
```c
hcqd_id = cmd_find_next_hcqd(active, rr_start % IB_MAX_HCQD_NUM_PER_CORE);
RT_ASSERT(hcqd_id < IB_MAX_HCQD_NUM_PER_CORE);
```

`cmd_find_next_hcqd` 用查表 CTZ：从 rr_start 开始，旋转 bitmask 找第一个 set bit，O(1)，零空转。

### 分发优先级（从高到低）

| 优先级 | 条件 | 处理 |
|--------|------|------|
| 1 | `stop_bitmask & BIT(hcqd)` | `sf_handle_stop()` + 清 cmd_status |
| 2 | `CMD_ATOMIC_HANDLE_WAIT` | `cmd_handle_atomic_packet()` |
| 3 | `CMD_EVENT_WAIT_HANDLE_DEPENDENCY` 或 `CMD_EVENT_BARRIE_HANDLE_WAIT` | `cmd_handle_event_packet()` |
| 4 | `CMD_WAIT_HOST_HANDLE_WAIT` 或 `CMD_WAIT_HOST_TRIG_DONE` | `cmd_handle_wait_host_packet()` |
| 5 | `CMD_BLOCK_MASK_HANDLE_WAIT` | 轮询 OSD，满足后 dispatch |
| 6 | `candidate & BIT(hcqd)` | `ib_peek_packet()` + `cmd_handle_packet()` |
| 7 | stale pending_mask | 清 bit，无操作 |

---

## V 版本演进摘要

| 版本 | 核心改进 |
|------|---------|
| V2 | bool has_pending（全局），一个 HCQD pending 阻塞所有队列 |
| V3 | pending 改 per-HCQD bitmask |
| V6 | 引入 candidate bitmask（节省 MMIO） |
| V7 | CTZ 跳跃代替 round-robin 空转；active = candidate\|pending\|stop |
| V7.1（本次）| active 与 flush_bm 解耦；cmd_find_next_hcqd 入参改 start；去掉 advance 死路径 |

---

## 重要不变量（踩过的坑）

> 详见 [[../learnings/hcqd-scheduling]] 和 [[../learnings/review-rules]]

- `ib_peek_packet` **必须在中断锁内**：peek reg 是 FIFO，并发读破坏硬件状态
- `ib_get_candidate_bitmask` 锁外 OK：`rd_rb_candidate` 是状态寄存器，idempotent read
- `CPE_FW_HCQD_STOPPED` 必须 RMW：直接 writel 覆盖其他 HCQD 的 stopped bit
- exception handler 的 `while(1)` 后必须 `continue`：否则 fall-through 进正常调度
