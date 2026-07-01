---
type: meta
title: "ai-infra 专区主题图与页面规划"
created: 2026-06-30
updated: 2026-06-30
tags: [meta, ai-infra, topic-map, planning]
status: active
---

# ai-infra 专区主题图与页面规划

> 来源：知乎专栏『大模型训练、推理与AI云平台』（作者常平，134 篇）→ 原始材料见 `.raw/zhihu/`。
> 用户决策：**全部深写**（9 集群全覆盖，约 30 页）。本文件是重写施工蓝图。

## 9 集群 → 页面规划

### 集群1 分布式训练基础（第1–5篇）→ `distributed-training/`
- 什么是分布式训练.md（第1章 id=487945343）
- 分布式训练评价指标.md（第2篇 492667659）
- 集合通信原语.md（第3篇 493092647）— 同时是 concepts 锚点
- 训练拓扑与服务框架.md（第4–5篇 496105041/500101861）

### 集群2 NCCL（第9–22,61–69,74–105篇 ~56篇）→ `nccl/`
- NCCL架构总览.md（9–13）
- NCCL性能优化.md（14–15）
- NCCL国产化需求.md（16–17）
- NCCL拓扑算法.md（18,20,61–69,81）
- NCCL传输层.md（75–80,83,84）
- NCCL核心模块.md（85–92,98–105）
- NCCL协议与机制.md（19,21,22,74,82,94–97）
- NCCL未来演进.md（93）

### 集群3 其他通信库（23–25,49–51,70–72,73,117–119,121,131）→ `comm-libs/`
- NVSHMEM.md（23–25）
- UCX.md（70–72）
- FlagCX与FlagScale.md（73,117–119,121）
- TorchComms.md（49–51）
- Gloo.md（131）

### 集群4 LLM推理与缓存（8,26–37,43–46,29–30）→ `llm-inference/`
- LMCache.md（8,26–28）
- vLLM.md（43–44）
- Mooncake与NIXL.md（31–34）
- DeepEP.md（35–37）
- PD分离推理.md（29–30）
- UCM.md（45–46）

### 集群5 训练框架与算子（7,38–48,110–111,120）→ `training-framework/`
- Megatron与张量并行.md（7,42）
- FlashAttention.md（38–40）
- TransformerEngine与TorchTitan.md（41,47–48）
- Google-Highway向量化.md（110–111,120）

### 集群6 AI云/K8s运维（52–60,122–126）→ `ai-cloud/`
- NVIDIA-AI-Cloud栈.md（52）
- K8s-GPU调度与运行时.md（53,54,57,122–125）
- GPU监控与运维.md（55,56,58–60,126）

### 集群7 GPU RAS与故障管理（21,108–109,112–116,127–130）→ `gpu-ras/`
- GPU-RAS体系.md（108–109）
- Fabric-Manager与NVLink.md（112–113）
- DCGM与监控.md（114–115）
- NVSentinel韧性系统.md（116）
- AMD-GPU-RAS.md（127–130）

### 集群9 调试与性能工具（132–134）→ `debug-tools/`
- msprobe精度调试.md（134）
- compare_tools性能比对.md（133）
- 千卡训练性能优化.md（132）

### 集群8 GPU内存与互联（106,107）→ 并入 `distributed-training/`
- NVLink-C2C与GPU统一内存.md（106,107）

## concepts/ 概念锚点页（跨集群共享）
AllReduce.md · Ring-AllReduce.md · Collective-Communications.md · RAS.md · PD-分离.md · Prefill-Decode.md · NVLink.md · GPUDirect-RDMA.md

## 风格约定（应届生重写标准）
- frontmatter: type/title/created/updated/tags/status/source(知乎出处+篇号)
- `[[wikilink]]` 互联；概念原子页保持 ASCII 短名
- 内联 mermaid 画图为主（Obsidian 原生渲染）
- 「**给应届生**：」内联注解（用 =/≈/「…」给具象心智模型），参照 wiki/grace/tiny-kmd/
- 每页顶部一句话 block-quote TL;DR
- 不搬运知乎原图，难点一律自绘
