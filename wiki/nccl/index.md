---
type: index
title: "NCCL 学习教程 — NVIDIA 集合通信库"
created: 2026-06-30
updated: 2026-06-30
tags:
  - nccl
  - collective
  - allreduce
  - gpu
  - communication
status: active
source:
  - "NVIDIA/nccl v2.30.7（tarball master，源码确认 2026-06-30，本地 /root/workspace/nccl）"
  - "[NCCL GitHub](https://github.com/NVIDIA/nccl)"
  - "[NCCL 官方文档](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)"
---

# NCCL 学习教程 — NVIDIA 集合通信库

> 这是一套**从 0 开始、基于真实源码**的 NCCL 深度学习教程。读完你应当能回答:多卡训练里"梯度同步"那一步,在硬件和代码层面究竟发生了什么;为什么 Ring AllReduce 能做到带宽最优;一个 `ncclAllReduce()` 调用,怎么一路走到 GPU 上的 CUDA kernel,再走到网卡。
>
> 全程以 **NVIDIA/nccl v2.30.7** 源码(本地 `/root/workspace/nccl`)为锚。每个关键断言都标注**源码确认**(给出文件/函数)或**推断**;难点配**图解**。
>
> 风格沿用本 wiki 的面试导向:每章末尾有 **🎯 面试官会追问** 盒子,帮你把"看懂了"变成"讲得出"。

---

## 这套文档怎么读

教程按**自顶向下、由浅入深**编号。建议顺序通读;赶时间可只读 ⭐ 标注的核心章。

| # | 文档 | 讲什么 | 难度 |
|---|------|--------|------|
| 00 | [概览:NCCL 是什么、为什么需要它](<./00-overview.md>) | 在 AI 训练里的位置、与 MPI/Gloo 对比、心智模型 | ★ |
| 01 | [核心概念与 API](<./01-concepts-and-api.md>) | communicator/rank、7 个集合原语语义、stream/group | ★ |
| 02 | [整体架构与代码地图](<./02-architecture-codemap.md>) | 控制面 vs 数据面、目录职责、核心数据结构 | ★★ |
| 03 | [通信器初始化与 Bootstrap](<./03-init-and-bootstrap.md>) | uniqueId、bootstrap all-gather、ncclComm 构建 | ★★ |
| 04 | [拓扑探测与图搜索](<./04-topology-and-graph-search.md>) | XML 拓扑、PCI/NVLink、求 Ring/Tree、channel | ★★★ |
| 05 | ⭐ [Ring AllReduce 算法深入](<./05-ring-allreduce.md>) | reduce-scatter + all-gather 两阶段、为什么带宽最优 | ★★★ |
| 06 | [Tree 及其他算法](<./06-tree-and-other-algos.md>) | double-binary tree、CollNet、NVLS;延迟 vs 带宽 | ★★★ |
| 07 | [Transport 传输层](<./07-transport.md>) | P2P(NVLink/PCIe)、SHM、NET(IB/socket) | ★★★ |
| 08 | [Enqueue 与 Kernel 启动](<./08-enqueue-and-launch.md>) | API→plan→task→kernel 参数、channel 分配 | ★★★ |
| 09 | ⭐ [Device 端 Kernel 内部](<./09-device-kernels.md>) | primitives、Simple/LL/LL128 协议、FIFO 同步 | ★★★★ |
| 10 | [Proxy 线程与网络推进](<./10-proxy-and-net-progress.md>) | proxy progress 循环、网络异步收发 | ★★★ |
| 11 | [调优与性能模型](<./11-tuning-and-perf.md>) | algo/protocol 选择、NCCL_* 环境变量、调试 | ★★ |
| 12 | [附录:术语表 / FAQ / 环境变量 / 阅读路线](<./12-appendix.md>) | 速查与索引 | ★ |

---

## 一句话心智模型(读之前先记住)

> **NCCL = 一个"知道你的 GPU 怎么连在一起、并据此把集合通信编译成最优收发计划、再用 CUDA kernel 直接在 GPU 上跑通信"的库。**

拆成三件事,正好对应本教程三大块:

1. **它先搞清拓扑**(谁和谁之间是 NVLink、谁要走 PCIe、跨机走哪张网卡)→ 第 03–04 章
2. **据此算出"环 / 树"和分块计划**(把数据切块,排好谁先发给谁)→ 第 05–06 章
3. **用 GPU 上的 kernel 把数据真正搬过去、边搬边算**(不回 host、不经 CPU 拷贝)→ 第 07–09 章

剩下的是工程:初始化握手(03)、传输通道(07)、网络后台线程(10)、性能调参(11)。

---

## 源码阅读路线图(配合教程边读边查)

本地源码:`/root/workspace/nccl`(v2.30.7)。第一次读源码,按这个顺序最不容易迷路:

```
src/nccl.h.in        # ① 公开 API:先看库对外长什么样
src/collectives.cc   # ② 每个集合原语的入口(都收敛到 ncclEnqueueCheck)
src/init.cc          # ③ 通信器是怎么建起来的(ncclCommInitRank)
src/bootstrap.cc     # ④ 多进程怎么互相找到对方
src/graph/           # ⑤ 拓扑探测 + 求环/树(topo/paths/search/rings/trees)
src/transport/       # ⑥ 数据到底怎么从 A 搬到 B(p2p/shm/net)
src/enqueue.cc       # ⑦ 一次调用怎么变成 kernel 启动
src/device/          # ⑧ GPU 上真正干活的 kernel(primitives、协议)
src/proxy.cc         # ⑨ 网络收发的后台推进线程
```

> ⚠️ 版本提示:v2.30.7 的 `src/` 比老版本多了 `gin/`、`nccl_device/`、`scheduler/`、`rma/` 等新子目录(对称内核、设备侧 API、RMA 等)。本教程聚焦经典集合通信主干,新子目录在第 12 章附录里简述定位。

---

## 相关 wiki

- 芯片栈端到端类比:[[saxpy-kernel-end-to-end|一个 Kernel 从 .cu 到硬件执行]] —— NCCL 的 kernel launch 思路与之同源(用户态把命令送上 GPU)
- 多卡互联背景:见 `wiki/grace` 专区的互联相关讨论
- [NCCL 教程学习问答记录](<./qa-log.md>) —— 用户在读本教程过程中提出的真实问题(区别于各章末尾预设的"面试官会追问"),按时间追加
