---
type: source
title: "fw CP user firmware code summary"
created: 2026-05-09
updated: 2026-05-09
tags: [source, fw, cp, understand]
status: active
source_type: remote-code
source_repo: "/home/shuaishuai.zhu/fw"
source_commit: c333676d1864e3e16b387ef83e8f66cc97a6ba20
related:
  - "[[GraceC CP MAS v1.4]]"
---

# fw CP user firmware code summary

> 这是 fw 仓库 CP user firmware 的代码摘要，来自 Understand-Anything 图谱和远端代码，用来和 [[GraceC CP MAS v1.4]] 建立映射。

## 来源

- 仓库：`/home/shuaishuai.zhu/fw`
- Understand 图谱：`.understand-anything/knowledge-graph.json`
- commit：`c333676d1864e3e16b387ef83e8f66cc97a6ba20`
- 主要目录：`aigc_sdk/grace/applications/cp/user/`

## 代码主线

1. [[cmd_entry]] 是 CP user firmware 的调度热循环入口。
2. [[Interaction-Buffer]] 连接 firmware、HCQD rb_fifo 和下游 FIFO/interrupt/MMIO。
3. [[iDMA]] 用于把 HCQD rb_fifo packet 直接搬运到 CLS/SDMA/ATO/VPU FIFO。
4. `sf.c` 处理 stop/flush，与 MAS 的 queue scheduling 和 process flush 对应。
5. `event_entry.c` 维护 [[Event-Table]] 的 shadow dependency check 和 counter update。

## 关键文件

| 文件 | 角色 | 关联 |
|---|---|---|
| `cmd.c` | command packet 解析、pending FSM、主调度循环 | [[cmd_entry]], [[CP-Command-Packet]] |
| `ib.c` | IB MMIO access、peek/read/consume/drop/finish | [[Interaction-Buffer]], [[HCQD]] |
| `idma.c` | iDMA destination mapping and dispatch | [[iDMA]] |
| `sf.c` | stop/flush IRQ and handling | [[CP stop flush 与 queue 切换]] |
| `event_entry.c` | event table counter/dependency | [[Event-Table]] |
| `cmd.h` | packet header/operator/context state | [[CP-Command-Packet]] |

## 延伸

- [[GraceC CP MAS v1.4]]
- [[CP command processing flow]]
- [[CP stop flush 与 queue 切换]]
- [[GraceC CP MAS v1.4 code knowledge map]]
