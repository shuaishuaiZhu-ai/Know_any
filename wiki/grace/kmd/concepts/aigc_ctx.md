---
type: entity
title: "aigc_ctx"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - concepts
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_ctx.h"
---

# aigc_ctx

> `struct aigc_ctx` 是 vdev 之下的**一个 GPU 执行上下文**。它拥有一个 VM（地址翻译/VMID）、一个队列 id 池、
> 该上下文的命令队列和事件。可以把它理解为「GPU 上的一个进程地址空间」。

**文件**: `kmd/aigc/kmdlib/aigc_ctx.h`
**关联**: [[aigc_vdev]] | [[aigc_vm]] | [[mem_handle]] | [[wiki/grace/kmd/queue/index|命令队列与调度]]

## 关键字段

- `type`（`KERNEL_CONTEXT` / `COMPUTE_CONTEXT`）、`id`、`node`（在 `vdev->ctx_head` 的链节点）、`vdev`（拥有者）。
- `vm` — 这个上下文的 VM（页表/VMID，见 [[aigc_vm]]）；`db_base` — 该 VMID 映射进来的 doorbell 窗口。
- `qid_pool` — 每上下文队列 id 的位图分配器（`MAX_QID_PCTX`）。
- `queue_idr` / `queue_lock` — id 索引的命令队列；`cq_head` / `cq_lock` — 已绑定调度的队列；`hw_bitmap` — 已绑定的硬件队列。
- `mem_head` / `mem_mutex` — 在此处拥有的内存句柄（[[mem_handle]]）。
- `evt_head` / `evt_mutex` — 这个上下文的事件（`struct aigc_evt`）。
- `mcqd_base` / `total_mem_size` / `gslab` / `ds_mem_list` — 队列描述符基址、分配统计、scratch slab。
- `refcount` — 只要还有队列/命令引用就保活。

## 所有权与句柄编码

链入 `vdev->ctx_head`；在 `lib_dev->ctx_handles` 里登记。

> 句柄是「打包整数」：上下文句柄打包 `(node_id, minor, ctx_id)`，事件句柄打包 `(minor, ctx_id, evt_id)`
> ——见 `mk_ctx_handle` / `mk_evt_handle` 助手。**给应届生**：用户态拿到的「句柄」不是指针，而是几段 id
> 拼成的整数，内核侧再拆开去 IDR 里查对象，这样跨进程传递也安全。

## 延伸

- [[aigc_vm]]：ctx 的地址空间与页表。
- [[mem_handle]]：ctx 拥有的分配。
- [[wiki/grace/kmd/queue/index|命令队列与调度]]：`queue_idr` / `cq_head` 怎么提交命令。
