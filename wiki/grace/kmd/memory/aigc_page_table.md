---
type: note
title: "aigc_page_table — 4 级页表"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - memory
  - pagetable
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_page_table.c"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_vm.h"
---

# aigc_page_table — 4 级页表

**文件**: `kmd/aigc/kmdlib/aigc_page_table.c`（实现）、`aigc_vm.h`（软件模型）
**关联**: [[aigc_vm]] | [[mem_handle]] | [[wiki/grace/kmd/memory/index|内存与页表]]

> 设备每个 VM 用一棵 **4 级**页表（建在 Grace TCU/MMU 上）。这页讲清楚 VA 怎么逐级索引、页表内存从哪来、
> 节点怎么引用计数、改完 PTE 怎么刷 TLB。

---

## 结构：PDE / PTE 级

级别是 `AIGC_VM_PTL0..PTL3`：PTL0 是根（PD3/TTBA），PTL3 是叶 PTE 级。软件视图：

- 每个节点 = `struct aigc_vm_pde_entry`（一个影子数组，镜像一张硬件表页，kref 计数，带 `parent`/`entries` 链）。
- 每个叶 = `union aigc_vm_pte_entry` 影子记录（`valid`、`pg_mode`、`mem_handle`）。
- 硬件 PTE/PDE 位布局是 `aigc_common_def.h` 里的 `union aigc_grace_mmu_pte` / `union aigc_grace_mmu_pde`。

一个 [[aigc_vm]] 拥有一个地址空间：`vmid`（MMU 上下文槽/TTBA 寄存器组）、op 向量 `aigc_vm_pt_ops`、多级
`struct aigc_vm_pg_table`（`pgd` 根基址、`root_entry`、串行化遍历的 `entry_mutex`、后备内存池）。两套几何
模板：`pgt_sys_attr`（host 映射）、`pgt_dev_attr`（设备映射），按映射的 `aip_va_range` 保护标志逐次选用。

## VA 怎么索引每一级

VA 是 48 位（`AIGC_GRACE_VA_BITS = 48`）。每级用 9 位索引（`mask = 0x1ff`），由
`__pde_index()` / `__pte_index()` 算成 `(addr >> page_shift) & mask`：

```mermaid
flowchart LR
  VA["48 位 GPU VA"] --> P0["PL0 shift 39<br/>bits 47-39"]
  P0 --> P1["PL1 shift 30<br/>bits 38-30"]
  P1 --> P2["PL2 shift 21<br/>bits 29-21"]
  P2 --> P3["PL3 叶 shift=页位移<br/>4K=12/16K=14/64K=16/2M=21"]
  P3 --> PA["物理页"]
```

逐级几何（shift/mask/entry 数/页模式）由 `GRACE_PGT_ATTRS_INIT_COMMON` 宏族填进
`struct aigc_vm_pgt_plx_attr`，每种页大小一套。

## 页大小与 block mapping（大页）

支持 4K/16K/64K/2M（`AIGC_PG_SZ_*`）。设备活动页模式在 `aigc_grace_pgt_attrs_init()` 里由编译期
`AIGC_PG_MODE` 选；host（系统）属性集则跟内核的 `OS_PAGE_SHIFT` 走。当 `attr->blk_mapping` 置位（如 2M 模式），
遍历**停在 PL2**，在那里写一个大页 *block* 叶（`mk_pl2_pte`），而不是再下到 PL3 的 PTE 表——这就是大页路径。

## 位图后备的页表内存池

每张硬件表页都从一个全局显存池 `struct aigc_vm_pgt_mem_pool` 分配（`aigc_grace_pgt_attrs_init()` 建：
8 槽，`chunk_size = 16 × 2M`，`chunk_align = 4K`）。一个 chunk（`aigc_vm_pgt_mem_chunk`）是一大块设备分配，
切成固定大小子槽，用 `bitmap` 跟踪（一位一槽，置位=占用）。`grace_vm_pgt_mem_pool_alloc()` 找有空槽的 chunk
（没有就 `chunk_mo_create` 按需建），`grace_vm_pgt_mem_pool_free()` 清位、可能销毁全空 chunk。每次分配产出一个
`struct aigc_vm_pgt_mem_object`（`start_addr` = 它的 DPA、`size`）。

## 引用计数

页表节点 kref 计数：每个 `aigc_vm_pde_entry.refcount` 跟踪它活着的子节点/PTE，归零时释放
（`vm_pgt_entry_release`），把后备内存还给池。根节点首次使用时创建并写 TTBA
（`__vm_pgt_root_entry_get` → `init_pgt_root_entry`），遍历期间对它取一个引用。

## TLB 失效

改完 PTE 后，`aigc_mmu_invalid_tlb()` 在 `mmu_spinlock` 下派发到后端 `invalid_tlb` op
（`__grace_mmu_invalid_tlb`）。它把 `[start, end)` 转成页帧号（`>> 12`），对 CP 和每个活动 cluster TCU 编程
range-invalidate 寄存器（`REG_TCU_MMU_CTXT_INDEX` = `vmid`、`RANGE_INV_*_ADDR_*` 对、`REG_TCU_MMU_CTXT_INV_CFG`），
然后在 `REG_TCU_MMU_CTXT_INV_STATUS` 上自旋直到 TBU/软件握手完成（状态 `2`=TBU 完成，`3`=软件已确认）。

## Dump 路径

`aigc_vm_dump_pgtable()` 从 `root_entry` 走活动表，读每个裸硬件项，把已填充的 PDE/PTE 记进
`struct aigc_vm_pgtable_dump`（在 `entry_capacity` 内统计 `entries`/`pde_entries`/`pte_entries`）。
经 `AIP_DUMP_PGT` ioctl（`aigc_ioctl_dump_pgt`）从用户态触达，把统计拷回调用方。

## 延伸

- [[aigc_vm]]：页表所属的地址空间对象。
- [[mem_handle]]：被映射的分配。
- [[wiki/grace/kmd/memory/index|内存与页表]]：堆/NUMA/DSMEM 模型。
