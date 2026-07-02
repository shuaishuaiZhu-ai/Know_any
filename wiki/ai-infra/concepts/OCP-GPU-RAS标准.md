---
type: concept
title: "OCP GPU RAS 标准"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, gpu-ras, standard, concept]
status: active
source:
  - "知乎专栏《大模型训练、推理与AI云平台》第109篇｜作者常平｜https://zhuanlan.zhihu.com/p/1988008157331600229"
---

# OCP GPU RAS 标准

> 《OCP GPU & ACCELERATOR RAS REQUIREMENTS V1.0》——由 Google、Microsoft、NVIDIA 等企业联合制定的标准，**统一 GPU/加速器的 RAS（可靠性/可用性/可维护性）需求**，解决多厂商 RAS 接口不统一的问题。

## 三大标准化方向

1. **固件更新标准化**：统一 GPU 固件更新接口与流程，实现跨厂商固件管理。
2. **RAS 需求标准化**：定义 GPU RAS 核心指标、错误分类规范。
3. **管理接口标准化**：统一 GPU RAS 状态查询、错误上报的接口形式。

## 关键指标与规范

遵循 ACPI、UEFI 行业规范（如 BERT 启动错误记录表、CPER 通用平台错误记录格式），通过厂商合规工具验证 RAS 实现一致性。

**给应届生**：为什么需要这个标准？因为 NVIDIA 和 AMD 的 RAS 接口各搞各的（NVIDIA 是 NCCL RAS 子系统+端口，AMD 是 sysfs 文件+echo 注入），混部集群没法统一管。OCP 标准就是让所有 GPU 的"故障怎么报、怎么查"说同一种话，这样一套运维系统能管所有厂商的卡。

## 详见
- [[GPU-RAS体系]] — 标准化是全栈 RAS 的第四层
- [[AMD-GPU-RAS]] — AMD 的 RAS 实现（标准化前的现状）
- 专栏原文：[知乎 · 第109篇 OCP GPU RAS标准](https://zhuanlan.zhihu.com/p/1988008157331600229)
