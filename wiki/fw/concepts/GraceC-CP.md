---
type: entity
title: "GraceC-CP"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, hardware, firmware, gracec]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
---

# GraceC-CP

> GraceC CP 是 GPU 命令处理单元，负责从 host/IMC 接收 command packet，并分发到 cluster、SDMA、VPU、Atomic 或 firmware 处理路径。

## 定义

[[GraceC CP MAS v1.4]] 中的 CP 连接 host、IMC、Gctrl、SDMA、VPU、Atomic、Event table 和 data/ctrl fabric。CP user firmware 位于 `aigc_sdk/grace/applications/cp/user`。

## 组成

- [[HCQD]]：硬件 command queue descriptor，面向 ringbuffer 和 read pointer。
- [[MCQD]]：memory command queue descriptor，由 master MCU 查询并 bind 到 HCQD。
- [[CP-Firmware-CPE]]：负责 packet 解析、event、wait_host、stop/flush 等固件逻辑。
- [[Interaction-Buffer]]：firmware 访问 HCQD rb_fifo、FIFO 和 MMIO 的接口。
- [[iDMA]]：把 command packet 投递到下游 FIFO。
- [[Event-Table]]：管理 stream/event dependency。

## 延伸

- [[CP command processing flow]]
- [[CP stop flush 与 queue 切换]]
- [[GraceC CP MAS v1.4 code knowledge map]]
