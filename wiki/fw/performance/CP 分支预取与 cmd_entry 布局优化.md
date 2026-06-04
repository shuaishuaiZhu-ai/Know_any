---
type: topic
title: "CP 分支预取与 cmd_entry 布局优化"
created: 2026-05-09
updated: 2026-05-09
tags: [cp, firmware, branch, prefetch, goto, performance]
status: active
source:
  - "[[语雀工作笔记索引]]"
---

# CP 分支预取与 cmd_entry 布局优化

## 结论

工作笔记把一次波形误判修正成了更精确的 CPU 前端解释：ret 或 beqz 目标尚未解析完成时，前端会顺序预取后续 `.text`，这些指令可能出现在 trace 中，但处于 invalid 区间，不代表实际执行。

## 关键观察

- 2026-05：`ib_get_candidate_bitmask` 后波形出现 `ib_wait_idma_idle` 开头地址，但后续跳回真实返回目标。
- 2026-05：`0x80002554/0x8000255a/0x80002560/0x80002564` 更像 ret 目标解析前的 wrong-path fetch。
- 2026-05：beqz 跳转也观测到约 10ns 延迟，说明普通条件分支也会付出前端重定向成本。

## 优化方案

对于多数情况下不执行的 if body，不应该把 body 布局在 fall-through 路径上。两类方案：

- `unlikely()`：release `-O2` 下通常能把冷路径 out-of-line，但 debug `-O0` 效果有限。
- 手写 goto 布局：在 `-O0` 也能固定布局，使默认预取落到下一个判断。

## 面试表达

这类优化不是简单“少写 if”，而是从波形、trace valid 位、汇编布局和 CPU 前端行为一起判断：哪些地址是实际执行，哪些只是 wrong-path fetch。

## 关联

- [[cmd_entry]]
- [[CP candidate peek 热路径优化]]
- [[CP command processing flow]]
