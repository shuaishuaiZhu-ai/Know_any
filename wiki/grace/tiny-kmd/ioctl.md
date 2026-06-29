---
type: note
title: "tiny-kmd misc 设备与 ioctl"
created: 2026-06-13
updated: 2026-06-13
tags:
  - tiny-kmd
  - ioctl
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:/data3/shuaishuai.zhu/tiny_kmd/tinykmd/aigc_misc.c"
---

# tiny-kmd misc 设备与 ioctl

**文件**: `tinykmd/aigc_misc.{c,h}`、`subscribe_list.{c,h}`
**关联**: [[wiki/grace/tiny-kmd/ipc]] | [[wiki/grace/tiny-kmd/architecture]]

> tiny-kmd 用一个 **misc 字符设备**（`/dev/aigc`）对外暴露能力，比 ajthunk 的完整 ioctl 体系小得多——只有
> 6 个命令，magic 是 `'A'`（注意与 ajthunk 的 `0x81` 不同，**ABI 不互通**）。

---

## 6 个 ioctl（`aigc_misc.h:59`）

| 命令 | 方向 | 作用 |
|---|---|---|
| `AIGC_MISC_IPC_MESSAGE_TRANSMIT` (0x1) | `_IOWR` | 发一条 IPC 消息给固件（见 [[wiki/grace/tiny-kmd/ipc]]），可带响应回填。 |
| `AIGC_MISC_IPC_IOCTR_SUB` (0x2) | `_IOW` | 订阅某个 `event_id` 的异步消息。 |
| `AIGC_MISC_IPC_IOCTR_UNSUB` (0x3) | `_IOW` | 取消订阅。 |
| `AIGC_MISC_MEMORY_ALLOC` (0x4) | `_IOWR` | `dma_alloc_coherent` 分配一块 DMA 内存（每 fd 一块，≤4MB），回填物理地址。 |
| `AIGC_MISC_MEMORY_FREE` (0x5) | `_IOWR` | 释放该 fd 的 DMA 内存。 |
| `AIGC_MISC_PASSIVE_BOOT` (0x6) | `_IOW` | 被动引导（`aigc_passive_boot.c`，当前为最小桩）。 |

派发在 `aigc_misc_ioctl()`（`aigc_misc.c:135`）：一个 `switch(cmd)` 分到
`aigc_ioctl_ipcmsg_transmit`(20) / `aigc_ioctl_memory_alloc`(49) / `aigc_ioctl_memory_free`(107) 等。

## file_operations

`aigc_misc.c` 提供完整 fops：`open`(236) / `release`(373) / `read`(272) / `write`(307) / `ioctl`(135) /
`mmap`(322) / `poll`(350)。

- **每 fd 状态 `task_data`**（`aigc_misc.h:50`）：一个等待队列 `wq`、4 条 `msg_list`（按事件类型分桶）、一块
  `user_buf`（DMA 内存，`buf_lock` 保护）。`open` 时分配，`release` 时释放并取消所有订阅、释放 DMA 内存。
- **read/poll 取异步消息**：固件主动来的消息经 [[wiki/grace/tiny-kmd/ipc|订阅分发]] 进了 `task_data->msg_list` 并唤醒
  `wq`；用户 `poll` 等待、`read` 取走。
- **mmap**：把该 fd 用 `MEMORY_ALLOC` 分配的 DMA 内存映射到用户空间。

## 订阅机制（`subscribe_list`）

`subscribe_list`（`subscribe_list.h:11`）是一张按 `event_id`（0–255）索引的 hlist 表。
`SUB`/`UNSUB` ioctl 调 `subscribe_list_add/del`，IPC 异步回调时 `subscribe_list_foreach_task` 遍历订阅了该事件的
所有 fd，调 `subscribe_task_wakeup`（`aigc_misc.c:420`）把消息塞进各自的 `msg_list` 并唤醒。`release` 时
`subscribe_list_del_all` 清掉该 fd 的全部订阅。

## 延伸

- [[wiki/grace/tiny-kmd/ipc]]：TRANSMIT/订阅背后的消息环。
- [[wiki/grace/tiny-kmd/device]]：MEMORY_ALLOC 的 DMA 来源。
- [[wiki/grace/kmd/03-ioctl-abi|ajthunk ioctl 接口]]：对照完整的 30 个 `AIP_*` 操作。
