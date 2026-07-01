---
type: entity
title: "Ring AllReduce"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, topology, concept]
status: active
source:
  - "知乎专栏第4篇｜https://zhuanlan.zhihu.com/p/496105041"
---

# Ring AllReduce

> **Ring 拓扑上的 [[AllReduce]]**，组合策略 = **ScatterReduce + AllGather**。每个节点只向右发、从左收，无中心瓶颈。

## 为什么高效
- 大梯度拆 N 小块（N=ring 节点数），减计算与带宽压力。
- 边算边传，通信时间藏进计算时间（[[通信隐藏]]）。
- 每卡收发均衡，无单点瓶颈。

## 局限
- ring 太大时跳数高（N 卡跳 N-1 次），时延增加。
- 异构网络（如主机间仅 1 网卡）不适合 → 用 2D-Ring/2D-Torus。

## 详见
- [[训练拓扑与服务框架]] — ScatterReduce/AllGather 两阶段图解
- [[NCCL拓扑算法]] — 工业实现
