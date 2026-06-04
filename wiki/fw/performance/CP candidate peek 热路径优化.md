---
type: topic
title: "CP candidate peek 热路径优化"
created: 2026-05-09
updated: 2026-05-09
tags: [cp, firmware, cmd_entry, candidate, peek, performance]
status: active
source:
  - "[[语雀工作笔记索引]]"
---

# CP candidate peek 热路径优化

## 结论

工作笔记中多次出现同一类性能问题：`cmd_entry` 拿到 candidate 后，在真正 `peek` packet 前存在额外读取 candidate、读取 MCU id 或等待状态的路径，导致 hot loop 延迟上升。

## 证据链

- 2026-04：波形显示拿到 candidate 后又多读一次 candidate 才 `peek` packet。
- 2026-04：同时发现 MCU id 也被多读，建议固化为全局变量。
- 2026-05：从收到 candidate 到真正 `peek` 约 586ns，仍有优化空间。
- 2026-05：`ib_get_candidate_bitmask()` 返回后，波形里看到后续错误路径/invalid 指令，需要区分前端预取和真实执行。

## 设计判断

candidate 可以放到 while 循环外缓存，但要和 stop/flush 语义一起验证：

- stop/flush 中断意味着对应 HCQD 曾经有效。
- 如果 HCQD candidate 有效，则 stop/flush 可以在当前 round 中被处理。
- 如果 HCQD candidate 无效，则不应该因为旧 candidate cache 误处理普通 packet。

## 与代码相关的关注点

- `cmd_entry`
- `ib_get_candidate_bitmask()`
- `ib_peek_packet()`
- `sf_get_stop_bitmask()`
- `sf_get_flush_cxt_bitmap()`

## 关联

- [[cmd_entry]]
- [[Interaction-Buffer]]
- [[CP 分支预取与 cmd_entry 布局优化]]
- [[CP stop flush 与 queue 切换]]
