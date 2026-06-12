---
type: learning
title: "HCQD 调度设计与版本演进"
created: 2026-05-09
updated: 2026-05-09
tags:
  - fw
  - learning
  - hcqd
  - scheduler
  - history
status: active
source:
  - "[[HCQD]]"
  - "[[cmd_entry]]"
---

# HCQD 调度设计与版本演进

**关联**: [[../cp-user/cmd_entry]] | [[review-rules]]
**来源**: Sessions 2026-03-30 ~ 2026-04-01，memory/project_fw_learnings.md

---

## 核心设计原则

### 1. pending 是 per-HCQD，不是全局

```c
// 错误（V2）：bool has_pending，一个 HCQD pending 阻塞所有
bool has_pending = false;
if (some_hcqd_blocked) has_pending = true;

// 正确（V3+）：bitmask，per-HCQD 精确跟踪
pending_mask |= BIT(hcqd_id);   // set
pending_mask &= ~BIT(hcqd_id);  // clear
```

**Why**: 多 HCQD 并发时，一个 HCQD 等待不应阻塞其他队列调度。

### 2. CTZ 跳跃优于 round-robin 空转

```c
// V6 之前：for 循环遍历所有 HCQD，无论有没有工作
for (int i = 0; i < 8; i++) { ... }  // 空转

// V7：candidate bitmask + CTZ，直接定位有效 HCQD
rt_uint32_t hcqd_id = cmd_find_next_hcqd(active, rr_start);
// N 个 active HCQD = N 次迭代，零空转
```

### 3. firmware 职责边界

固件只负责：
- 排空 IB（读完所有包）
- 发 `fw_hcqd_stopped` 信号

**不负责**：OSD drain 等待（由 Master MCU / KMD 轮询）。

### 4. candidate 缓存失效路径要完整

每条消费 candidate bit 的路径都要 `candidate &= ~BIT(hcqd_id)`：
- `skip:` 标签（正常调度完）✓
- `handle_stop` → goto skip ✓
- flush 分支：`candidate &= ~flush_bitmap` ✓

漏掉任意一条 → stale bit → 死循环。

---

## 版本演进表

| 版本 | 关键问题 | 解决方案 |
|------|---------|---------|
| V2 | `bool has_pending` 全局，一挂全挂 | — |
| V3 | pending 改 per-HCQD bitmask | `pending_mask \|= BIT(id)` |
| V5 | 候选缓存失效路径不完整 | 每个消费路径补 `candidate &= ~BIT` |
| V6 | MMIO 频率过高 | candidate 缓存，仅 empty 时刷新 |
| V7 | round-robin 空转 | CTZ 跳跃，active bitmask |
| V7.1 | active 混入 ctx-space flush bit | flush_bm 单独变量；入参改 start 语义；删 advance 死路径 |

---

## active 与 flush_bm 解耦（V7.1）

**背景**：flush_cxt_bitmap 是 ctx-id 空间（0..31），candidate/pending/stop 是 hcqd-id 空间（0..7）。V7 把 flush_bm 混入 active，靠"flush 分支总是 continue"来防止脏 bit 进入 cmd_find_next_hcqd —— 是脆弱不变量。

**修复**：
```c
// Before（V7）
rt_uint32_t active = candidate | pending_mask | stop_mask | flush_bm;
if (active == 0U) continue;

// After（V7.1）
rt_uint32_t active   = candidate | pending_mask | sf_get_stop_bitmask();
rt_uint32_t flush_bm = sf_get_flush_cxt_bitmap();
if (active == 0U && flush_bm == 0U) continue;
```

**效果**：active 语义纯净（hcqd-id space），删掉 12 行注释依赖。
