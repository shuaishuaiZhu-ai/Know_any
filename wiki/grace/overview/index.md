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
| [一个 Kernel 的奇幻漂流：从 .cu 源码到硬件执行的全流程](<./saxpy-kernel-end-to-end.md>) | 完全没碰过这套栈，想先建立"一段 kernel 怎么从 `.cu` 跑到硬件"的整体地图。以 UMD `test_saxpy_op.cu` 为例，含 1 张全景框图 + 多张分阶段图，通俗讲解，适合组内分享。 |

## 延伸

- 上一级：[GraceC 芯片软硬件栈](<../index.md>)
- 全库入口：[Wiki 总索引](<../../index.md>)
