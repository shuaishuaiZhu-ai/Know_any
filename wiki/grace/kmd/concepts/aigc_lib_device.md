---
type: entity
title: "aigc_lib_device"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - concepts
  - device
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_lib_dev.h"
---

# aigc_lib_device

> `struct aigc_lib_device` 是**可移植核心的根对象**——一颗物理 GPU 在 kmdlib 里需要的一切。
> 它被内嵌在驱动侧的 `struct aigc`（见 [[aigc]]）里，通过 `lib_device_*` 访问器互通。

**文件**: `kmd/aigc/kmdlib/aigc_lib_dev.h`
**关联**: [[aigc]] | [[aigc_vdev]] | [[wiki/grace/kmd/concepts/index|核心数据结构]]

## 一颗 GPU 为什么有两个「根」？

一颗物理 GPU 有**两个**根对象：驱动侧的 `struct aigc`（PCI 胶水、属于 OS 那一半）和核心侧的
`struct aigc_lib_device`（可移植逻辑）。前者把后者**内联**存放（`aigc.lib_dev_handle[]` 这个 8 字节对齐的
柔性数组）。这正是 [[wiki/grace/kmd/arch/layered-architecture|三层架构]] 在数据结构上的体现：OS 侧和可移植侧各
持一个根，靠 `void *` 句柄解耦。

## 关键字段

- `working_mem_size` — 可用显存（可能被压到物理容量以下）。
- `pdev` / `membase` / `regbase` / `cfgbase` — 不透明 OS 设备句柄 + 三个 BAR 基址（镜像自 `struct aigc`）；所有 MMIO 都从这里偏移。
- `all_vdevs` / `inact_vdev_head` / `inact_ctx_head`（各带锁）— 活跃/非活跃 vdev/ctx 链表；`ctx_handles` 是 id→ctx 的 IDR。
- `vmid_pool` — 设备级 VMID 分配器；`vm` / `vm_refcount` — 共享地址空间。
- `cmd_sched` / `current_scheduler` / `sched_policy` — 命令调度状态。
- `sdma_engine` / `intr_ring` / `irq_table` / `irq_thread` — DMA 与中断管道。
- `text_pool` / `data_pool` / `gpu_va_pool` / `numa_node[][]` — 显存与 GPU-VA 分配器（按 die、按 cluster 的 NUMA gen-pool）。
- `hw_engines[]` / `ring_base` / `ring_end` — 每引擎描述符与 CP/codec 环窗口。
- `dm_ops`（显存 MMIO ops）/ `pte_ops`（页表 ops）/ `hal`（Grace HAL 聚合）/ `aqm`（队列管理器）。
- `dev_prv` — 芯片私有 ops 表（hw/sw init/reset、run-state 钩子、`hw_ver`、`cmd_engine_num`）。
- `k_vdev` — 内核自己的 vdev（驱动内部上下文）。
- `refcount` / `open_count` — 生命周期管理。

## 所有权

内嵌在 `struct aigc.lib_dev_handle[]` 中；一颗绑定的 PCI function 一个。

## 延伸

- [[aigc_vdev]]：挂在 `all_vdevs` 上的每 fd 对象。
- [[wiki/grace/kmd/hal/index|Grace HAL]]：`hal` 字段背后的硬件后端。
- [[wiki/grace/kmd/memory/index|内存与页表]]：`numa_node[][]` / `gpu_va_pool` 怎么用。
