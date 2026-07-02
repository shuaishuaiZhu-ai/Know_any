---
type: index
title: "分布式训练基础 索引"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, distributed-training, index]
status: active
source:
  - "知乎专栏《大模型训练、推理与AI云平台》第1-5、106-107篇｜作者常平｜https://www.zhihu.com/column/c_1491039346714746880"
---

# 分布式训练基础

> 知乎专栏第1–5篇重写，应届生入门地基。从这里建立"道/法/术/器"的全局观，再下钻各技术域。

## 推荐阅读顺序

1. [[什么是分布式训练]] — 系统 = 要素×连接+目的+边界，6 步迭代
2. [[分布式训练评价指标]] — 加速比/收敛/曲线拟合 + 可用性/可靠性/韧性
3. [[集合通信原语]] — Broadcast/AllReduce/ReduceScatte 全家桶
4. [[训练拓扑与服务框架]] — Ring/2D-Torus 拓扑 + Horovod 七层架构

## 概念锚点

[[AllReduce]] · [[Ring-AllReduce]] · [[通信隐藏]]

## GPU 内存与互联

[[NVLink-C2C与GPU统一内存]] — NVLink-C2C、UVA/UVM（专栏第106–107篇）

## 延伸

- [[wiki/ai-infra/index|ai-infra 专区首页]]
- [[wiki/ai-infra/nccl/index|NCCL 集合通信库]]
- [[wiki/ai-infra/llm-inference/index|LLM 推理与缓存]]
