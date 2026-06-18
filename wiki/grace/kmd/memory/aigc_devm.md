---
type: note
title: "aigc_devm — 显存堆与 gen_pool"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - memory
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_devm.c"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_devm.h"
---

# aigc_devm — 显存堆与 gen_pool

**文件**: `kmd/aigc/kmdlib/aigc_devm.{c,h}`
**关联**: [[wiki/grace/kmd/memory/index|内存与页表]] | [[mem_handle]] | [[aigc_lib_device]]

> `aigc_devm` 是「设备管理内存」的布局助手：把显存切成按 NUMA 节点、按 cluster 的 gen_pool 块，供
> [[mem_handle]] 的设备分配从中取用。它回答的是「显存这块大蛋糕怎么切、怎么分」。

---

## 它做什么

- **建池**：`aigc_init_basic_mem_layout()` 按 cluster/NUMA 拓扑建立显存 gen_pool（`text_pool`/`data_pool`/
  `gpu_va_pool` 等挂在 [[aigc_lib_device]] 上），把每个 NUMA 节点的物理区间登记进对应池。
- **VM 内存布局**：`aigc_vm_memlayout_init()` / `aigc_vm_memlayout_destroy()` 管理 VM 级的内存布局。
- **系统 UVA 块**：`aigc_sys_uva_blk_get()` / `aigc_sys_uva_blk_put()` 管理系统侧 UVA 块的取/还。
- **保护位换算**：`__heap_to_pte_prot()`（堆→PTE 基位）和 `aigc_calc_pte_prot()`（综合 flags→PTE 保护字），
  是 [[aigc_page_table]] 写 PTE 时用到的「策略表」。

## 给应届生：为什么用 gen_pool？

显存不像内核堆那样可以 `kmalloc`——它是设备上的一段物理地址区间，需要驱动自己当「分配器」。Linux 的
`gen_pool`（通用地址池）正适合这种「我有一段地址范围，请按对齐切给我子块」的场景。kmd 给每个 NUMA 节点
建一个 gen_pool，分配显存就是「向对应节点的 gen_pool 要一块」，释放就是「还回去」。

> 编译期开关 `PARTIAL_GOOD` 会在建池时把缺陷子区间 `[pg_offset, pg_offset+pg_size)` 预先标记为已分配，
> 这样 gen_pool 永远不会把坏块分出去（见 [[wiki/grace/kmd/env|环境]]）。

## 延伸

- [[wiki/grace/kmd/memory/index|内存与页表]]：堆类型、NUMA/UMA 模型。
- [[aigc_page_table]]：页表内存也从显存池分。
- [[mem_handle]]：设备分配的中心描述符。
