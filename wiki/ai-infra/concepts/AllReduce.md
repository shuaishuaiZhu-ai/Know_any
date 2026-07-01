---
type: entity
title: "AllReduce"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, collective-comms, concept]
status: active
source:
  - "知乎专栏第3篇｜https://zhuanlan.zhihu.com/p/493092647"
---

# AllReduce

> **多对多规约原语**：所有卡的输入数据规约（如 SUM 求和）后，**每张卡都拿到同一份结果**。数据并行第⑤步的灵魂——把各卡梯度加成全局梯度。

## 两种等价实现

| 方式 | 过程 | 特点 |
|---|---|---|
| Reduce + Broadcast | 先规约到 master，再广播 | 中心化，master 带宽瓶颈，大集群不用 |
| ReduceScatter + AllGather | 拆块规约 + 全收集 | 去中心化、流水线，Ring/Tree 拓扑用 |

## 详见

- [[集合通信原语]] — 原语全家桶与数据流向图
- [[Ring-AllReduce]] — 高效实现
- [[训练拓扑与服务框架]] — 在拓扑中的位置
