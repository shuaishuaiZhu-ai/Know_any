---
type: topic
title: "CP cmd_entry 热路径与分支布局优化"
created: 2026-05-09
updated: 2026-06-12
tags: [cp, firmware, cmd_entry, candidate, peek, branch, prefetch, goto, performance]
status: active
source:
  - "[[语雀工作笔记索引]]"
---

# CP cmd_entry 热路径与分支布局优化

> 本页合并原 `CP candidate peek 热路径优化` 与 `CP 分支预取与 cmd_entry 布局优化` 两篇——它们都围绕 `cmd_entry` 主循环的前端/热路径开销，放在一起更便于对照。

## 一、candidate peek 热路径

### 结论

工作笔记中多次出现同一类性能问题：`cmd_entry` 拿到 candidate 后，在真正 `peek` packet 前存在额外读取 candidate、读取 MCU id 或等待状态的路径，导致 hot loop 延迟上升。

### 证据链

- 2026-04：波形显示拿到 candidate 后又多读一次 candidate 才 `peek` packet。
- 2026-04：同时发现 MCU id 也被多读，建议固化为全局变量。
- 2026-05：从收到 candidate 到真正 `peek` 约 586ns，仍有优化空间。
- 2026-05：`ib_get_candidate_bitmask()` 返回后，波形里看到后续错误路径/invalid 指令，需要区分前端预取和真实执行。

### 设计判断

candidate 可放到 while 循环外缓存，但要和 stop/flush 语义一起验证：

- stop/flush 中断意味着对应 HCQD 曾经有效。
- 若 HCQD candidate 有效，则 stop/flush 可在当前 round 中被处理。
- 若 HCQD candidate 无效，则不应因旧 candidate cache 误处理普通 packet。

### 与代码相关的关注点

`cmd_entry`、`ib_get_candidate_bitmask()`、`ib_peek_packet()`、`sf_get_stop_bitmask()`、`sf_get_flush_cxt_bitmap()`。

## 二、分支预取与布局

### 结论

工作笔记把一次波形误判修正成更精确的 CPU 前端解释：ret 或 beqz 目标尚未解析完成时，前端会顺序预取后续 `.text`，这些指令可能出现在 trace 中，但处于 invalid 区间，不代表实际执行。

### 关键观察

- 2026-05：`ib_get_candidate_bitmask` 后波形出现 `ib_wait_idma_idle` 开头地址，但后续跳回真实返回目标。
- 2026-05：`0x80002554/0x8000255a/0x80002560/0x80002564` 更像 ret 目标解析前的 wrong-path fetch。
- 2026-05：beqz 跳转也观测到约 10ns 延迟，说明普通条件分支也会付出前端重定向成本。

### 优化方案

对于多数情况下不执行的 if body，不应把 body 布局在 fall-through 路径上：

- `unlikely()`：release `-O2` 下通常能把冷路径 out-of-line，但 debug `-O0` 效果有限。
- 手写 goto 布局：在 `-O0` 也能固定布局，使默认预取落到下一个判断。详见 [cmd_entry branch layout](<../cp-user/cmd_entry-branch-layout.md>)（`asm goto` 硬布局实现）。

### 面试表达

这类优化不是简单"少写 if"，而是从波形、trace valid 位、汇编布局和 CPU 前端行为一起判断：哪些地址是实际执行，哪些只是 wrong-path fetch。

## 关联

- [[cmd_entry]]
- [[cmd_entry-branch-layout]]
- [[Interaction-Buffer]]
- [[CP stop flush 与 queue 切换]]
- [[CP command processing flow]]
