---
type: index
title: "KMD 端到端流程"
created: 2026-06-13
updated: 2026-06-15
tags:
  - kmd
  - flows
  - index
status: active
---

# KMD 端到端流程

> 前面各区是「按子系统」拆开讲；这一区反过来，用一条完整的时间线把它们串起来，看一次真实计算怎么走完全程。
> 总览页给时间线，逐操作页给**函数级调用链**（用已注释的真实函数名/文件，能直接对着读源码）。

## 总览

- [[saxpy-submission-flow]]：从 `Thunk_CreateContext` 到一次 saxpy 计算完成的全链路时间线，并链向下面每一步的代码流程页。

## 逐操作代码流程（函数级调用链）

设备生命周期：

- [[device-probe-flow]]：PCI `aigc_probe()` 把整张卡从无到有建起来。
- [[device-init-flow]]：`aigc_lib_dev_handle_init()`——driver-entry 与 kmdlib 的接缝，建设备模型。

一次计算的资源准备与执行：

- [[context-create-flow]]：`AIP_CONTEXT_CREATE` → `aigc_context_create()`（VMID/页表/队列簿记）。
- [[mem-create-flow]]：`AIP_MEM_CREATE` → `aigc_ioctl_mem_create()`（分物理内存 + 写页表）。
- [[pgtable-mapping-flow]]：`aigc_vm_update_pgtable()` → `__create_ptl0_mapping()` 逐级建 PDE/PTE。
- [[queue-create-flow]]：`AIP_QUEUE_CREATE` → 填 MCQD + 交 CP 固件调度，返回 doorbell。
- [[command-submission-flow]]：提交（入队即返回）与调度 kthread 异步下发（进 CP 环 + 敲门铃）。
- [[completion-interrupt-flow]]：CP 写 fence 时间戳 + 抬 MSI-X → 上/下半部 → 释放等待者。

## 延伸

- [[wiki/grace/kmd/index|KMD 内核驱动知识库]]
- [[wiki/grace/kmd/arch/request-path]]：单次 ioctl 的路径。
