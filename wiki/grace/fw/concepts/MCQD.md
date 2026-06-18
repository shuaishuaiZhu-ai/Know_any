---
type: entity
title: "MCQD"
created: 2026-05-09
updated: 2026-06-18
tags: [entity, cp, queue, mcqd, master]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
---

# MCQD

> MCQD（Memory Command Queue Descriptor）是 device memory 里的命令队列描述符，由 Host/KMD/UMD 创建，CP Master MCU 查询、调度并 bind 到 [[HCQD]]。它是「Host 想让芯片执行的命令流」在 device 侧的入口结构。

## 职责

- KMD/UMD 为 stream 创建 MCQD，并通过 mailbox / shared memory 通知 CP Master MCU。
- Master MCU 用 QueryDMA / schDMA 查询 MCQD 是否 ready。
- BindDMA 将 ready 的 MCQD 绑定到空闲 [[HCQD]]。
- Doorbell 到来后，HCQD 根据 MCQD 信息从 ringbuffer fetch command packet，经 [[Interaction-Buffer]] 进入 CP User 执行。

## 在 CP Master 流程中的位置

MCQD 的查询、绑定、与 HCQD 的生命周期绑定是 CP Master 的核心控制面：

- **查询与入队**：Master 用 QDMA 查询 MCQD ready 状态并维护 task_list。详见 [[qdma]] 的 `task_list` 数据结构与 TOP 寄存器表。
- **绑定与 HCQD 生命周期**：BindDMA 把 MCQD 绑到 HCQD，stop/release 时解绑。详见 [[overview]] 的模块分工表与 [[master-user-interaction]] 的绑定/stop/release 路径。
- **模块分工全景**：MCQD → HCQD → IB → cmd_entry 的主线见 [[overview]]。

## 延伸

- [[HCQD]] — MCQD 绑定的硬件命令队列描述符。
- [[GraceC-CP]] — CP 硬件单元组成（HCQD/MCQD/CPE/IB/iDMA/Event-Table）。
- [[qdma]] / [[overview]] / [[master-user-interaction]] — CP Master 侧 MCQD 数据结构与生命周期主线。
- [[CP stop flush 与 queue 切换]] — stop/flush 时 MCQD/HCQD 的解绑与清理语义。
