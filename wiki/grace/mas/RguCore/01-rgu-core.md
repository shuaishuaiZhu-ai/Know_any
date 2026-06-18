---
type: learning-guide
title: "01 RguCore 计算核"
created: 2026-05-14
updated: 2026-06-18
tags: [mas, rgu, core]
status: active
---

# 01 RguCore 计算核

## 职责

RguCore 负责 AI 计算执行：从 GCtrl 接收任务，从外存读取指令和数据，解析执行后把结果写回外存。它是 RGU 系统的 SIMT 计算核。

## 关键能力

- 支持 SIMT 编程框架。
- 支持图灵完备指令集，包括分支、跳转、循环、同步、原子、ALU、Tensor Core、Uniform、同步/异步访存等。
- 支持多核调度。
- 支持异常检测和程序调试。

## 设计参数

核心规模：

- 4 个 subcore。
- 每个 subcore 处理 16 个 warp，总计 64 warp。
- CPart 处理多个 subcore 间共享逻辑，包括访存通路、任务分发、同步机制。
- SharedMem + L1 总规模 256KB，L1 可为 32/64/128KB。
- ICache 32KB，CCache 8KB。
- UDP：`4 subcore * 2`。
- URF：`4 subcore * 2 * 2KB`。
- TensorCore：`8*8*8 MAC @ FP16`。
- LSU：`4 subcore * 16`，单核带宽约 256GB/s。
- AXI Master/Slave：128B/clk。
- SHM：512B/clk。
- TMA：128B/clk。
- Outstanding：512。

## SubCore 与 UCore

每个 UCore 维护 8 个 warp，负责：

- 每个 warp 一组 IBuffer，当前设置为 8 条指令。
- PC 生成、取指、指令 decode。
- 标量/控制类指令处理。
- 向量指令预处理并发给后端。
- 维护 SIMT 执行所需的 tmask、stack、依赖和资源冲突信息。

## 发射与依赖

RguCore 的发射和依赖要点：

- 优先级函数可抽象为 `F(blk_age, warp_id, unit, usr, rr)`。
- SFU/LSU 延时不一致时，只考虑历史冲突。
- 当前设计分为奇偶 warp 两组，可双发射。
- 寄存器交织到 4 个 bank：`bank_id = (reg_id + warp_id) % 4`。
- warp 间数据共享以及 uniform/ctrl 单元交互时，要特别注意前后拍。

## 访存抽象

访存分为 Load、Store、AsyncCopy、TMA：

- Load：`SHM2REG`、`GLB2REG`。
- Store：`REG2SHM`、`REG2GLB`。
- AsyncCopy：`SHM2GLB`、`GLB2SHM`。
- TMA：`GLB2SHM`、`SHM2GLB`、`GLB2GLB`。

整体抽象为：

- Master：LSU/TMA，处理指令级特性。
- InterConnect：连接路径和仲裁。
- Slave：SHM-RW/GLB-RW，处理地址空间下的访存拆分与合并。

## SHM 地址映射

文档给出按物理 warp 分配空间的地址公式：

```text
phy_addr = core_base
         + hw_warp_id * warp_step
         + local_addr / 4 * addr_step
         + lane_id * 4
         + local_addr % 4
```

这说明 SHM/local memory 的软件可见地址需要同时考虑 warp、lane 和局部地址交织。

## Kernel 生命周期

文档列出三类 kernel 事件：

- kernel 初始化。
- kernel 结束。
- kernel early stop。

结束行为包括：

- 所有 warp 执行 `EXIT`。
- 如果 SIMT stack 有残留，会逐步弹出。
- 返回 `warp_done`。
- kernel 切换时等待所有 warp 完成，flush 非 local memory cache，invalid local memory cache。

## 同步与保序

需要关注的保序关系：

- block 切换时，前一个 block 对 SHM 的异步访问必须在后一个 block 的 SHM 访问前完成。
- LSU 保证按顺序发给下游模块。
- 同步到 TMA 的保序要特别处理。
- CCTL 指令应返回响应，软件或控制逻辑才能判断 flush/invalid 是否真正完成。

## 风险点拓展

- TMA/AsyncCopy 如果没有足够读 buffer，读写路径可能互相等待。
- `ACPY/TMA` 访问 SHM/GLB 时，最好拆成独立 R/W 接口，避免读数据堆积导致写路径无法前进。
- 多 block 穿插执行提高效率，但会放大 SHM、cache、TMA 的一致性和完成条件复杂度。
