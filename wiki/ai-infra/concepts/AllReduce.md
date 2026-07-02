---
type: concept
title: "AllReduce"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, collective-comms, concept]
status: active
source:
  - "知乎专栏《大模型训练、推理与AI云平台》第3篇｜作者常平｜https://zhuanlan.zhihu.com/p/493092647"
---

# AllReduce

> **多对多规约原语**：所有卡的输入数据规约（如 SUM 求和）后，**每张卡都拿到同一份结果**。数据并行第⑤步的灵魂——把各卡梯度加成全局梯度。

## 记忆口诀

**"加完再发，人人一份"**——AllReduce = 先把所有卡的输入规约（如求和）成一个结果，再让每张卡都拿到这份结果。数据并行第⑤步就是把各卡梯度 AllReduce 成全局梯度。

两种实现（Reduce+Broadcast vs ReduceScatter+AllGather）的性能对比与数据流向图，详见 [[集合通信原语]]；工业级高效实现见 [[Ring-AllReduce]]。

## 详见

- [[集合通信原语]] — 两种实现的对比与数据流向图（详细）
- [[Ring-AllReduce]] — 高效实现（ScatterReduce+AllGather）
- [[训练拓扑与服务框架]] — 在拓扑中的位置
