---
type: topic
title: L2C 编程说明
source: C:\work\reg_table\L2C 编程说明_v0.1.pdf
updated: 2026-05-17
tags:
  - mas
  - l2c
  - reg-table
---

# L2C 编程说明

本页来自 `C:\work\reg_table\L2C 编程说明_v0.1.pdf` 的文本抽取和整理。PDF 共 45 页，主题是 GraceC L2C 的寄存器表、初始化阶段配置、remapping、cache operator、bypass 和硬件实现注意点。

解析方式：已安装并使用 `pdf` skill 推荐的 `pdfplumber` 做正文抽取，同时用 `pypdfium2` 渲染 remapping 相关页图做视觉核验。第 38-42 页的 REMAPPING 段落、地址映射图、hash 公式和寄存器配置已人工对照页图确认。

## 入口

- [L2C Remapping 机制](<./remapping.md>)

## 地址空间

GraceC 有 4 个 cluster，每个 cluster 内有 8 个 LLCS，每个 LLCS 内有 2 个 L2C。

cluster 基地址：

| Cluster | 地址范围 | 大小 |
|---|---:|---:|
| Cluster0 | `0x0480_0000` - `0x048F_FFFF` | 1MB |
| Cluster1 | `0x0490_0000` - `0x049F_FFFF` | 1MB |
| Cluster2 | `0x04A0_0000` - `0x04AF_FFFF` | 1MB |
| Cluster3 | `0x04B0_0000` - `0x04BF_FFFF` | 1MB |

每个 cluster 内 16 个 L2C，每个 L2C 4KB，偏移从 `0x0009_0000` 开始，每个 L2C 增加 `0x1000`。

## 配置阶段

文档把流程分为 BIST、BOOT、WORK 三类阶段：

- BIST 阶段：配置 TSV 冗余，必要时关闭 remapping，并把 Cacheop 强覆盖为 bypass。
- BOOT 阶段：配置总线地址到物理地址的映射关系，典型配置由 `REMAP_LUT_TABLE` 和 `REMAPPING_ADDR*` 完成。实际硬件过程由 BIST 算法根据坏块信息自动生成表项。
- WORK 阶段：主要是 flush、中断处理、IDLE 查询和性能统计。

## Remapping 快速结论

remapping 的作用是把软件/总线看到的地址映射到真实物理资源，包括 `dram_channel`、`bank`、`part`、`axi_channel`。它不是单纯地址位拼接，而是通过 `REMAPPING_ADDR*` 选取总线地址位，再用 hash 生成 `REMAP_LUT_TABLE` 索引，最后由表项给出物理目的地。

默认应开启 `PA_CFG.remapping_en`。关闭后地址透传，文档明确说该模式仅用于 debug 和 LTC 访问；透传地址送到 PBM 会发生错误地址。

## 关键寄存器

| 寄存器 | 作用 |
|---|---|
| `PA_CFG.remapping_en` | remapping 使能，默认 1。关闭后地址透传。 |
| `PA_CFG.remapping_error_int_en` | remapping error 中断使能。 |
| `REMAPPING_ERROR.remapping_error_flag` | 访问错误物理地址映射表索引时置位。 |
| `REMAPPING_ERROR_CLEAN.remapping_error_clean` | 清除 remapping error 状态。 |
| `REMAP_CFG.remapping_bypass_addr_lshift2` | remapping 关闭时，总线地址左移 2 bit。 |
| `REMAP_CFG.remapping_dchannel_hash_en` | dram channel hash 使能。 |
| `REMAP_CFG.remapping_dchannel_hash_cfg` | 低 3bit hash 或低 4bit hash 选择。 |
| `REMAP_LUT_TABLE*` | 地址映射查找表，表项保存 valid/axi_channel/part/bank/dram_channel。 |
| `REMAPPING_ADDR*` | 选择 bus address 的哪些 bit 作为 remapping_addr、col、row。 |

## 后续提问建议

- “为什么 `remapping_en` 默认要打开？”
- “`REMAP_LUT_TABLE.idx` 是怎么从 bus address 算出来的？”
- “低 3bit hash 和低 4bit hash 的差别是什么？”
- “关闭 remapping 为什么 PBM 会收到错误地址？”
- “L2C remapping 和 cache/bypass 配置有什么关系？”
