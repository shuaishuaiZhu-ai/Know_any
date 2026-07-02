---
type: index
title: "概念锚点 索引"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, concepts, index]
status: active
source:
  - "知乎专栏《大模型训练、推理与AI云平台》跨集群共享概念（散见各篇）｜作者常平｜https://www.zhihu.com/column/c_1491039346714746880"
---

# 概念锚点

> 跨集群共享的原子概念页，是 `[[wikilink]]` 的高频锚点。短而聚焦，一个概念一页。

## 通信类
- [[AllReduce]] — 数据并行的核心规约原语
- [[Ring-AllReduce]] — Ring 拓扑上的高效 AllReduce
- [[集合通信原语]] — Broadcast/Scatter/Reduce 等全家桶
- [[通信隐藏]] — 计算通信并行，把通信藏进计算

## 硬件/互联类
- [[NVLink]] — NVIDIA 高速 GPU 互联协议
- [[GPUDirect-RDMA]] — 网卡直接 DMA GPU 显存，绕过 CPU
- [[NVLink-C2C与GPU统一内存]] — C2C + UVA/UVM

## 推理类
- [[PD-分离]] — Prefill/Decode 拆到不同实例
- [[Prefill-Decode]] — LLM 推理两阶段
- [[KV-Cache]] — Attention 的 Key/Value 缓存

## 可靠性类
- [[OCP-GPU-RAS标准]] — 跨厂商 RAS 接口标准化

## 延伸
- [[wiki/ai-infra/index|ai-infra 专区首页]]
