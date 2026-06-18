---
type: learning
title: "固件 Code Review 规则"
created: 2026-05-09
updated: 2026-05-09
tags:
  - fw
  - learning
  - review
  - checklist
status: active
---

# 固件 Code Review 规则

**关联**: [[hcqd-scheduling]] | [[../cp-user/cmd_entry]] | [[../cp-user/ib]]
**来源**: 历史 session 教训汇总（多次 CRITICAL bug 经历）

---

## 必查清单

### 1. Magic Number 必须 grep 验证

发现 hex 字面量（如 `0x7c`、`0x1F`）时：
```bash
grep -rn '#define' *.h | grep -i '0x7c'
```
4 轮 review 曾漏过 magic number，最终在 hw 上暴露。

### 2. Exception Handler 必须 continue

`while(1)` 循环中异常处理后**必须加 `continue`**：

```c
// 错误：fall-through 进正常调度
if (exception_get_flag() != EXCEPTION_NONE) {
    rt_thread_yield();
    // ← 没有 continue！
}
// 继续执行调度逻辑 ← CRITICAL BUG

// 正确
if (exception_get_flag() != EXCEPTION_NONE) {
    rt_thread_yield();
    continue;  // ← 必须
}
```

### 3. CPE_FW_HCQD_STOPPED 必须 RMW

不能直接 `writel`，会覆盖其他 HCQD 的 stopped bit：
```c
// 错误
writel(BIT(hcqd_id), CPE_FW_HCQD_STOPPED);

// 正确（Read-Modify-Write）
val = readl(CPE_FW_HCQD_STOPPED);
val |= BIT(hcqd_id);
writel(val, CPE_FW_HCQD_STOPPED);
```

### 4. flush_asid 必须 mask 提取

bit5 是 valid flag，不能直接比 ASID：
```c
// 错误
if (flush_asid == target_asid) ...

// 正确
if ((flush_asid & 0x1F) == target_asid) ...
```

### 5. IB FIFO 寄存器读必须在中断锁内

`ib_peek_packet`、`ib_consume_packet` 等**不能**移到 `rt_hw_interrupt_disable()` 之外。

- **可以**锁外：`ib_get_candidate_bitmask()`（状态寄存器，idempotent）
- **不可以**锁外：peek/consume（FIFO，并发读破坏硬件状态）

> "减小中断延迟"不是把 IB FIFO 读移出锁的理由。

---

## Review 工作流

对于复杂固件改动，同时启动两个 subagent：
1. **Review agent**：检查 magic number、dead code、控制流、overflow
2. **Test agent**：写 host-side 单测覆盖 edge case + 模拟场景

效果：发现 CRITICAL bug 同时验证 51 个测试用例（2026-03-31 session）。
