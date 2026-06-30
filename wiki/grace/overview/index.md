---
type: index
title: "端到端总览"
created: 2026-06-25
updated: 2026-06-25
tags:
  - grace
  - overview
  - index
status: active
---

# 端到端总览

本目录放**跨子域的端到端讲解**——把 UMD（aigc-driver）→ KMD（aigc.ko）→ CP（fw）→ 硬件 的完整链路串成一篇能通读的故事。
单层的深入细节仍在各自子域（[mas](<../mas/index.md>) / [fw](<../fw/index.md>) / [kmd](<../kmd/index.md>) / [tiny-kmd](<../tiny-kmd/index.md>)）里。

## 页面

| 页面 | 适合的问题 |
|---|---|
| [一个 Kernel 从 .cu 源码到硬件执行的全流程](<./saxpy-kernel-end-to-end.md>) | 完全没碰过这套栈，想先建立"一段 kernel 怎么从 `.cu` 跑到硬件"的整体地图。以 UMD `test_saxpy_op.cu`（`add1`）为例，含 10 张手绘 SVG/Graphviz 分阶段图、严谨技术风、每阶段带"面试官会追问"盒子。**先读这篇。** |
| [stream / MCQD / HCQD 与命令下发](<./stream-mcqd-hcqd-and-command-submission.md>) | stream 和硬件 ring buffer 什么关系、何时懒创建；MCQD（软件逻辑队列）↔ HCQD（32 个硬件槽）为什么两级；哪块内存落 host/device；命令下发的两条路径（UMD 直发主路径 vs KMD 两阶段非主/禁用路径）。 |
| [kernel cmd → CP job cmd 字段映射](<./kernel-cmd-to-cp-job-cmd.md>) | `aica_kernel_dispatch_packet_t` 逐字段拆解；澄清"全栈只有一个 `0x10`"；dispatch 包到执行单元的映射链。主文档第 2.4 节的深度展开。 |

> 配套子域入口：[UMD 用户态运行时（aigc-driver）](<../umd/index.md>)、[KMD 面试向深入](<../kmd/appendix/interview-qa.md>)、[CP 固件面试向深入](<../fw/fw-cp-interview-deep-dive.md>)。

## 延伸

- 上一级：[GraceC 芯片软硬件栈](<../index.md>)
- 全库入口：[Wiki 总索引](<../../index.md>)
