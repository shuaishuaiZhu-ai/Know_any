---
type: entity
title: "mem_handle"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - concepts
  - memory
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_mem_handle.h"
---

# mem_handle

> `struct mem_handle` 是驱动里**一次分配的中心描述符**。它拥有一块物理内存区、被引用计数，同时记录这块
> 分配的用户态 VA 和 GPU VA。几乎所有 `AIP_MEM_*` ioctl 操作的都是它。

**文件**: `kmd/aigc/kmdlib/aigc_mem_handle.h`
**关联**: [[aigc_ctx]] | [[aigc_vm]] | [[aigc_page_table]] | [[wiki/kmd/memory/index|内存与页表]]

## 关键字段

- `id` / `hdl_type` — IDR id 与类型（`AIGC_MHT_MEM` / `_IB` / `_PTE` / `_FENCE` / `_DSMEM`）。
- `sys_va_addr` — 用户态 VA；`dva` — GPU VA；`size`。
- `heap`（`MH_HOST` / `MH_DEVICE` / `MH_OTHER_DEVICE`）、`flags`（`AIGC_MF_*` 属性位）、`loc`（`AIGC_ML_IN_SYS` / `_IN_DEV`）、`numa_mode` / `numa_node`。
- `pma`（`struct aigc_vm_pma`）— 后备物理内存区（host 页 / 每 NUMA 的显存 gen-pool 分配 / 远端 DPA），**独立引用计数**。
- `active_vma` / `xfer` — 当前 VMA 与 DMA/传输上下文。
- `ctx` / `ctx_node` — 拥有它的上下文及其在 `ctx->mem_head` 的链节点。
- `ref`（UMD 锁计数）、`refcount`（对象生命周期 kref）、`export_refcount`（共享句柄）。
- `source` — 导入句柄时指向原始；`target_gpu_id` / `target_die_id` / `ds_node` — DSMEM（分布式共享内存）目标。

## 生命周期（一句话记住）

> **alloc → back（sys-pin 或 dev-alloc）→ PTE-map → use → unmap → free**

详细每一步对应哪个 ioctl/函数，见 [[wiki/kmd/memory/index|内存与页表]]。注意「描述符 `mem_handle`」和
「物理后备 `aigc_vm_pma`」是**两个独立的引用计数对象**：句柄 kref 归零时才释放 pma（`vm_pma_free`）。

## 所有权与句柄编码

链入拥有它的 `aigc_ctx->mem_head`，在 `vdev->mem_idr` 登记。分配句柄打包 `(minor, ctx_id, mem_id)`。

## 延伸

- [[wiki/kmd/memory/index|内存与页表]]：堆、NUMA/UMA、DSMEM、生命周期细节。
- [[aigc_page_table]]：把 `dva` 映成物理页的页表遍历。
- [[aigc_ctx]]：拥有 mem_handle 的上下文。
