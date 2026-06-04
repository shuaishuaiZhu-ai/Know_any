---
type: entity
title: "MCQD"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, queue, mcqd, master]
status: stub
source:
  - "[[GraceC CP MAS v1.4]]"
---

# MCQD

> MCQD 是 Memory Command Queue Descriptor，保存在 device memory 中，由 master MCU 查询、调度并 bind 到 [[HCQD]]。

## 职责

- KMD/UMD 为 stream 创建 MCQD，并通过 mailbox/share memory 通知 CP master MCU。
- Master MCU 使用 QueryDMA/schDMA 查询 MCQD 是否 ready。
- BindDMA 将 MCQD 绑定到空闲 HCQD。
- Doorbell 到来后，HCQD 根据 MCQD 信息从 ringbuffer fetch command packet。

## 延伸

- [[HCQD]]
- [[CP stop flush 与 queue 切换]]
- [[GraceC-CP]]

