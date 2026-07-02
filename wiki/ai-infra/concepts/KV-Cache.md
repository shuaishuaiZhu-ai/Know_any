---
type: concept
title: "KV Cache"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, llm-inference, concept]
status: active
source:
  - "知乎专栏《大模型训练、推理与AI云平台》第29-30篇｜作者常平｜https://zhuanlan.zhihu.com/p/1973174452696134562"
---

# KV Cache

> **Key/Value 缓存**：Transformer 注意力机制中，每层存下输入 token 的 Key 和 Value，后续生成时复用，避免重算。是 LLM 推理显存占用的大头，也是 [[PD分离推理|PD 分离]]要跨节点传输的核心数据。

## 是什么

Attention 计算时，`Attention = softmax(Q·K^T)·V`。其中 K、V 来自输入。生成第 N 个 token 时，前 N-1 个 token 的 K、V 不变，缓存下来复用，只需算新 token 的 Q 去和缓存的 K 做点积——省掉重复计算。

**给应届生**：KV Cache 像"读书记的笔记"。第一次读一段话（Prefill），逐词记下笔记（生成 KV Cache）；之后每说一个字（Decode），就翻这些笔记找关联，不用把整段话重读一遍。所以输入越长、生成越长，KV Cache 越大越占显存——这也是为什么长上下文推理吃显存。

## 为什么是推理优化核心

- **显存大头**：长上下文下 KV Cache 占用远超模型权重。
- **碎片问题**：变长请求导致显存碎片 → [[vLLM]] 的 PagedAttention 把 KV 按 block 管理消除碎片。
- **跨节点传输**：[[PD分离推理|PD 分离]]时 Prefill 算的 KV 要传给 Decode → [[Mooncake与NIXL]]、[[LMCache]] 解决"怎么存怎么传"。

## 详见
- [[vLLM]] — PagedAttention 优化 KV 显存管理
- [[LMCache]] — KV Cache 多级缓存复用
- [[Mooncake与NIXL]] — KV Cache 跨节点传输
- [[Prefill-Decode]] — Prefill 生成、Decode 复用 KV
