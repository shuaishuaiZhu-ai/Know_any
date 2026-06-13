---
type: entity
title: "aigc_vm"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - concepts
  - pagetable
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_vm.h"
---

# aigc_vm

> `struct aigc_vm` 是**一个 GPU 虚拟地址空间**（一个 VMID/TTBA）加上它的 op 向量和多级页表。
> 一个 [[aigc_ctx]] 拥有一个 VM。

**文件**: `kmd/aigc/kmdlib/aigc_vm.h`
**关联**: [[aigc_ctx]] | [[mem_handle]] | [[aigc_page_table]] | [[wiki/kmd/memory/index|内存与页表]]

## `struct aigc_vm` 关键字段

- `default_ctx` — VM 自己的上下文；`lib_dev` — 拥有者。
- `vmid` — 这个地址空间的硬件 MMU 上下文槽（TTBA 寄存器组的索引）。
- `pgt`（`struct aigc_vm_pg_table`）— 背后的 4 级页表。
- `ops`（`struct aigc_vm_ops`）— init/destroy、mmap/munmap（按页和按段）、VA 分配。
- `addr_space` / `lm_align` / `pasid` / `sva_handle`（SVA 状态）。
- `refcount` — 只要还有映射就保活（经 `aigc_ctx_free_vm` 释放）。

## `struct aigc_vm_pgt_attr`：一种页表「口味」的全套属性

一套用于 system-memory 映射，一套用于 device-memory 映射。它持有逐级几何
`pl0_attr..pl3_attr`（`struct aigc_vm_pgt_plx_attr`：`page_shift`、`entry_num`、`mask`、`base_align`、
page-mode 位），加上 `blk_mapping`（PL2 大页叶）、`interleave_mode`（NUMA VA 交织）、`pg_mode`。

> **级别约定**：一个 VA 被切成四级 `AIGC_VM_PTL0..PTL3`；PTL0 是根（PD3/TTBA），PTL3 是叶 PTE 级。
> 页表本身（`struct aigc_vm_pg_table`）持有 `root_entry`、op 向量 `ops`、system/device 两套属性，
> 以及 `pgt_mem_pool`——给每个硬件表页提供后备存储的显存池。

## 所有权

`aigc_vm.pgt` 持有页表；两套属性从 `lib_dev->pgt_sys_attr` / `lib_dev->pgt_dev_attr` 共享而来。

## 延伸

- [[aigc_page_table]]：4 级遍历、引用计数、TLB 失效的实现。
- [[mem_handle]]：被映射进这个 VM 的分配。
- [[wiki/kmd/memory/index|内存与页表]]
