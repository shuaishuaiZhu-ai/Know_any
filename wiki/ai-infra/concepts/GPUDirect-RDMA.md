---
type: concept
title: "GPUDirect RDMA"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, gpu, rdma, concept]
status: active
source:
  - "知乎专栏《大模型训练、推理与AI云平台》第74篇｜作者常平｜https://zhuanlan.zhihu.com/p/1981507594146305320"
---

# GPUDirect RDMA

> **GDR**：让网卡直接 DMA 访问 GPU 显存，数据从一块卡的 HBM 直达另一台机器卡的 HBM，**绕过 CPU 和 OS 内核**。主机间高速通信的关键技术。

## 传统 vs GDR 路径
```
传统 TCP/IP: GPU内存 → CPU拷贝 → 内核Socket → 网卡DMA → 网线（高CPU开销）
GDR 零拷贝:  GPU内存 --- RDMA Write 直达 --- 对端GPU内存（绕过CPU/OS内核）
```

**给应届生**：传统网络传输 GPU 数据要"先搬到 CPU 内存再发"，CPU 成搬运工累死还慢。GDR 让网卡直接读 GPU 显存发出去，CPU 完全不参与——这就是"零拷贝"。主机间 AllReduce 跨节点传输就靠它。

## 关键配置
- **Pinned Memory**（锁页内存）：注册固定物理页，避免换页，DMA 才能直传。
- **QP 数量**：过多内存消耗大，过少并发不足。

## 详见
- [[千卡训练性能优化]] — RDMA 零拷贝是网络优化核心
- [[训练拓扑与服务框架]] — 主机间 RDMA 组环
- [[wiki/ai-infra/nccl/NCCL传输层|NCCL 传输层]] — NCCL 的 NET 传输用 GDR
