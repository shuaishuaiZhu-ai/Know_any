---
type: concept
title: "PD 分离"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, llm-inference, concept]
status: active
source:
  - "知乎专栏《大模型训练、推理与AI云平台》第29-30篇｜作者常平｜https://zhuanlan.zhihu.com/p/1973174452696134562"
---

# PD 分离

> **Prefill-Decode 分离**：把 LLM 推理的 Prefill（预填充）和 Decode（解码）两个阶段拆到不同集群/卡上分别跑。解决"Prefill 计算密集抢 Decode 资源"的矛盾，提升整体吞吐。

## 为什么分离

LLM 推理两阶段计算特征截然不同：
- **Prefill**：处理整个输入 prompt，计算密集（Compute-Bound），生成长 KV Cache。
- **Decode**：逐 token 生成，访存密集（Memory-Bound），复用 KV Cache。

混在一个集群跑，Prefill 的密集计算会挤占 Decode 的访存带宽，互相拖累。

**给应届生**：类比"先读后写"——Prefill 像"通读一遍书做满页笔记"（费脑子费时间，计算密集），Decode 像"看着笔记逐字背出来"（不费脑子但要不停翻笔记，访存密集）。两件事放一起干互相干扰，分开各用专长。

## 详见
- [[PD分离推理]] — vLLM/DeepSeek PD 分离方案
- [[Mooncake与NIXL]] — PD 分离的 KV Cache 传输
- [[Prefill-Decode]] — 两个阶段的概念锚点
