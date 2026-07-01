---
type: entity
title: "Prefill 与 Decode"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, llm-inference, concept]
status: active
source:
  - "知乎专栏第29-30篇｜https://zhuanlan.zhihu.com/p/1973174452696134562"
---

# Prefill 与 Decode

> LLM 推理的两个阶段：**Prefill**（预填充，处理输入 prompt 生成 KV Cache）+ **Decode**（解码，逐 token 生成）。前者计算密集，后者访存密集。

## 两个阶段

| 阶段 | 干什么 | 特征 | 瓶颈 |
|---|---|---|---|
| Prefill | 处理整个输入 prompt，算出每层 KV Cache | 计算密集 Compute-Bound | 算力 |
| Decode | 逐 token 生成，复用已算 KV Cache | 访存密集 Memory-Bound | 显存带宽 |

**给应届生**：第一次回答问题要"读懂整段输入"（Prefill，重活，算力为主）；之后每个字都是"基于已读内容往外蹦"（Decode，轻活但要不停读 KV Cache，带宽为主）。这就是为什么推理服务要分别优化——Prefill 优化算子，Decode 优化显存访问（PagedAttention 就是）。

## 详见
- [[PD分离推理]] / [[PD-分离]] — 两阶段拆到不同集群
- [[vLLM]] — PagedAttention 优化 Decode 访存
