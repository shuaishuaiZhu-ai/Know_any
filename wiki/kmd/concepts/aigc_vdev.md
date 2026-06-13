---
type: entity
title: "aigc_vdev"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - concepts
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_vdev.h"
---

# aigc_vdev

> `struct aigc_vdev` 代表**一个打开的设备 fd**——一个用户进程/客户端。它拥有该客户端的上下文、分配、
> 事件、fence，并把它们绑到拥有它的 task 上。提交链路从这里开始。

**文件**: `kmd/aigc/kmdlib/aigc_vdev.h`
**关联**: [[aigc_lib_device]] | [[aigc_ctx]] | [[wiki/kmd/arch/request-path]]

## 它从哪来、到哪去

`open("/dev/aigcN")` 时由 `aigc_lib_open()` 分配，存进 `file->private_data`，并挂进
`lib_dev->all_vdevs`。fd 完全关闭、`refcount` 归零时由 `aigc_vdev_free` 释放。所以 [[wiki/kmd/arch/request-path|每次 ioctl]]
拿到的 `private_data` 就是这个对象。

## 关键字段

- `lib_dev` — 拥有它的设备（[[aigc_lib_device]]）；`node` — 在 `lib_dev->all_vdevs` 里的链节点。
- `ctx_head` / `ctx_lock` — 这个客户端的 GPU 上下文（[[aigc_ctx]]）。
- `tsk` / `mm` / `file`、`pid` / `tgid`、`process_exit` — 进程绑定与拆除状态。
- `mem_idr` / `mem_lock` — 每 vdev 的内存句柄 id 分配器；`evt_idr` / `evt_mutex` — 每 vdev 的事件 id 分配器。
- `fence`（`struct aigc_kmd_fence_man`）— 跟踪命令完成（见 [[aigc_kmd_fence]]）。
- `as`（`struct vdev_addr_space`）— 设备地址空间窗口。
- `event_tracker` — 把中断/错误事件经共享内存队列送给用户态工具。
- `refcount` — 归零即释放。

## 所有权

`file->private_data` 持有；链入 `lib_dev->all_vdevs`。

## 延伸

- [[aigc_ctx]]：vdev 之下的执行上下文。
- [[aigc_lib_device]]：vdev 的拥有者。
- [[wiki/kmd/interrupt/index|中断与 Fence]]：`event_tracker` / `fence` 怎么把完成送回用户态。
