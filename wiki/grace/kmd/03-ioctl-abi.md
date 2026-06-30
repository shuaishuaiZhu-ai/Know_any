---
type: note
title: "03 ioctl 接口与 ABI"
created: 2026-06-13
updated: 2026-06-29
tags:
  - kmd
  - ioctl
  - abi
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/common"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc"
---

# 03 ioctl 接口与 ABI

> **这章解决什么问题**：用户态和 `aigc.ko` 之间所有的控制流量，都从 `/dev/aigcN` 的**一个** `ioctl()`
> 入口走。本章讲清楚：这套 ABI 由哪几个头文件定义、命令是怎么编码的、一条命令如何经「两级派发」找到
> 处理函数、一共有哪些操作，以及为什么「改一个字段就是破坏性 ABI 变更」。

## ABI 由三个共享头定义

这套 ABI 完全由仓库根目录 `common/` 下的三个头文件定义，**内核驱动和用户态 thunk 逐字共享**：

| 头文件 | 作用 |
|---|---|
| `common/aip_ioctl_nr.h` | `enum AIP_IOCTL` 操作编号（`AIP_*`，0..34）。 |
| `common/aip_ioctl.h` | 用 `_IOWR`/`_IOW`/`_IOR` 编码出的 ioctl 命令宏。 |
| `common/aip_common_ioctl.h` | 按指针传递的 `struct ioctl_*_args` 参数结构体。 |

### 魔数与命令编码
每条命令都用 ioctl 魔数 `0x81`。`common/aip_ioctl.h` 为每个操作编一个命令宏，方向反映数据如何在
用户态和内核之间流动：
- `_IOWR` — 参数结构体既被用户态写、又被内核回填（多数操作）。
- `_IOW` — 只写（内核只读参数）。
- `_IOR` — 只读（内核只填参数）。

宏的第三个参数是 `struct ioctl_*_args` 类型，它**固定了 `_IOC_SIZE(cmd)`**。例如：
```c
#define AIP_MEM_CREATE_IOCTL      _IOWR(0x81, AIP_MEM_CREATE,  struct ioctl_mem_create_args)
#define AIP_MEM_DESTROY_IOCTL     _IOW (0x81, AIP_MEM_DESTROY, struct ioctl_mem_destroy_args)
#define AIP_GET_DEVICE_TIME_IOCTL _IOR (0x81, AIP_GET_DEVICE_TIME, struct ioctl_get_current_device_time_args)
```

每个 `struct ioctl_*_args` 包着一个或多个 `THUNKIF_*` 描述符（定义在共享的 `thunk.h`）。约定：`input`
成员携带请求参数，其它成员（如 `hAllocation`、`address`、`output`）由内核回填，`_IOWR`/`_IOR` 操作再拷回
用户态。

## 两级派发

一条命令到达处理函数前，要穿过两张表。这正是 [01 整体架构](<./01-architecture.md>) 里那张请求路径图：

![ioctl 两级派发](../../../_attachments/grace/kmd/diagrams/03-ioctl-path.png)

> 图解源文件：[`03-ioctl-path.svg`](../../../_attachments/grace/kmd/diagrams/03-ioctl-path.svg)。

### 第一级 — Linux fops 层（`kmd/aigc/aigc_ioctl.c`）
`aigc_ioctl()` 挂在 `/dev/aigcN` 的 `file_operations.unlocked_ioctl` 上，**只做校验**：
1. 解出 `nr = _IOC_NR(cmd)` 和 `param_size = _IOC_SIZE(cmd)`。
2. 若 `nr` 越出 `aigc_ioctl_tbl[]` 范围，**或**表项的 `.cmd` 与传入 `cmd` 不精确相等 → `-EINVAL`。
   「精确相等」意味着：编号对但方向/大小编码错的请求，也会被拒。
3. 把 `private_data`、`nr`、`param_size`、用户缓冲指针打包进 `struct aigc_ioctrl_params`，调
   `aigc_lib_ioctl()`。

这里的 `aigc_ioctl_tbl[]` 是**名字/校验表**：包含 `common/include/aigc_ioctl_tab.h` 时把
`AIGC_IOCTL_DESC` 定义成「在 `_IOC_NR(name)` 处放 `{ .name="AIP_…", .cmd=name_IOCTL }`」。

### 第二级 — 可移植核心（`kmd/aigc/kmdlib/aigc_fops.c`）
`aigc_lib_ioctl()` 是 Linux 层唯一调用的入口。它用 `ctrl_params->cmd`（即 `AIP_*` 编号）索引一张
**处理函数表**，遇到空槽返回 `-EINVAL`，否则把 `(private_data, buf)` 转给匹配的 `aigc_ioctl_*` 处理函数。
这里 `private_data` 是每-fd 的 `struct aigc_vdev`，`buf` 是用户参数指针；处理函数用
`os_memcpy_from_user` / `os_memcpy_to_user` 拷入/拷出。

这张表由**同一个** `aigc_ioctl_tab.h` 生成，只是把 `AIGC_IOCTL_DESC(_ioctrl, _func)` 展开成
`[_ioctrl] = _func`。**用同一份 X-macro 清单生成两张表，名字、编号、处理函数三者永远锁步同步。**

## 操作总表

下表来自 `common/include/aigc_ioctl_tab.h`（必须与 `aip_ioctl_nr.h` 的 `enum AIP_IOCTL` 同步）。
所有处理函数都在 `kmd/aigc/kmdlib/aigc_fops.c`。**共 30 个操作被派发。**

| # | `AIP_*` 操作 | 内核处理函数 | 说明 |
|---|---|---|---|
| 0 | `AIP_CONTEXT_CREATE` | `aigc_ioctl_context_create` | 创建 GPU 上下文（及其 VM），返回打包的上下文句柄。 |
| 1 | `AIP_CONTEXT_DESTROY` | `aigc_ioctl_context_destroy` | 按句柄销毁上下文。 |
| 2 | `AIP_QUEUE_CREATE` | `aigc_ioctl_queue_create` | 在上下文里建命令/提交队列，返回句柄和 doorbell 地址。 |
| 3 | `AIP_QUEUE_DESTROY` | `aigc_ioctl_queue_destroy` | 销毁命令队列。 |
| 4 | `AIP_MEM_OPEN` | `aigc_ioctl_mem_open` | 导入别的上下文/设备导出的分配（MAP 模式句柄）。 |
| 5 | `AIP_MEM_CREATE` | `aigc_ioctl_mem_create` | 分配 GPU 内存（设备或主机），建好页表，返回句柄/VA。 |
| 6 | `AIP_MEM_DESTROY` | `aigc_ioctl_mem_destroy` | 释放一块内存分配。 |
| 7 | `AIP_MEM_LOCK` | `aigc_ioctl_mem_lock` | 锁定（pin）一块分配，返回主机指针。 |
| 8 | `AIP_MEM_UNLOCK` | `aigc_ioctl_mem_unlock` | 解锁先前锁定的分配。 |
| 9 | `AIP_QUEUE_SUBMIT` | `aigc_ioctl_queue_submit` | 向队列提交命令缓冲（见下方注意）。 |
| 15 | `AIP_EVENT_CREATE` | `aigc_ioctl_event_create` | 在上下文里建同步事件，返回事件 id/句柄。 |
| 16 | `AIP_EVENT_DESTROY` | `aigc_ioctl_event_destroy` | 按句柄销毁事件。 |
| 17 | `AIP_GET_PROP` | `aigc_ioctl_get_prop` | 把设备属性（HW 拓扑/内存计数）报给用户态。 |
| 18 | `AIP_CREATE_SHMEM` | `aigc_ioctl_create_shmem` | 创建对另一上下文分配的共享映射（跨进程 IPC）。 |
| 19 | `AIP_INIT_EVENT_TRACKER` | `aigc_ioctl_init_event_tracker` | 建立每-vdev 的事件跟踪环（一次性、非线程安全）。 |
| 20 | `AIP_DESTROY_EVENT_TRACKER` | `aigc_ioctl_destroy_event_tracker` | 销毁 vdev 的事件跟踪器。 |
| 21 | `AIP_SEND_EVENT_TEST` | `aigc_ioctl_send_event_test` | 往事件跟踪队列注入一个测试事件（调试/测试路径）。 |
| 22 | `AIP_PMEM_CREATE` | `aigc_ioctl_pmem_create` | 分配设备物理内存，返回裸 GPU 设备物理地址（DPA）。 |
| 23 | `AIP_PMEM_RELEASE` | `aigc_ioctl_pmem_release` | 释放 pmem 分配（校验传入的 DPA）。 |
| 24 | `AIP_MEM_ADDR_RESERVE` | `aigc_ioctl_mem_addr_reserve` | 预留一段对齐的 GPU VA 区间（设备堆）而不落实后端。 |
| 25 | `AIP_MEM_ADDR_FREE` | `aigc_ioctl_mem_addr_free` | 释放先前预留的 GPU VA 区间。 |
| 26 | `AIP_MEM_MAP` | `aigc_ioctl_mem_map` | 在调用者给的 VA 处映射一块分配的 PTE。 |
| 27 | `AIP_MEM_UNMAP` | `aigc_ioctl_mem_unmap` | 清除一块分配的页表项。 |
| 28 | `AIP_MEM_SET_ACCESS` | `aigc_ioctl_mem_set_access` | 改一块分配某子区间的访问保护。 |
| 29 | `AIP_DUMP_PGT` | `aigc_ioctl_dump_pgt` | 把一个上下文的页表 dump 进用户提供的缓冲。 |
| 30 | `AIP_FW_UPDATE` | `aigc_ioctl_fw_update` | 触发固件镜像更新。 |
| 31 | `AIP_FW_UPDATE_STATE` | `aigc_ioctl_get_fw_update_state` | 查询固件更新进度/状态。 |
| 32 | `AIP_FW_PW_UPDATE` | `aigc_ioctl_fw_pw_update` | 修改固件密码。 |
| 33 | `AIP_FW_PW_STATE` | `aigc_ioctl_get_fw_pw_update_state` | 查询固件密码更新状态。 |
| 34 | `AIP_IMC_START_STAGE` | `aigc_ioctl_get_imc_start_stage` | 查询 IMC start-stage 状态。 |

### 保留 / 尚未派发的编号
`enum AIP_IOCTL` 里有 **5 个编号没进 `aigc_ioctl_tab.h`**，因此两张表里都没有它们的项：
`AIP_GET_STATE`(10)、`AIP_GET_INFO`(11)、`AIP_WAIT_FENCE`(12)、`AIP_SIGNAL_FENCE`(13)、
`AIP_GET_DEVICE_TIME`(14)。fops 文件里确实有 `aigc_ioctl_get_info`、`aigc_ioctl_wait_fence`、
`aigc_ioctl_signal_fence` 这些 stub，但**没接进表**，所以发这些命令号目前会从 `aigc_lib_ioctl()` 收到
`-EINVAL`。fence 是通过提交/事件路径服务的，没有独立 ioctl（见
[05 提交、事件与中断](<./05-submission-events-interrupts.md>)）。

### 个别处理函数的注意点
- ⚠️ **`aigc_ioctl_queue_submit` 当前在拷完参数后就 `return -EFAULT`**——经此 ioctl 的**直接提交在本构建里
  被禁用**。真正在用的是用户态队列 + doorbell 的直接提交（见 [00 大局观](<./00-big-picture.md>) 与
  [05 提交、事件与中断](<./05-submission-events-interrupts.md>)）。
- `aigc_ioctl_create_shmem` 行为类似 `aigc_ioctl_mem_open`，但支持跨进程 IPC：置位其 flag 时会预分配对齐
  VA、要求设备堆、并取一个 export 引用，使导出方在被导入期间无法释放该分配。

## 这是一份共享 ABI（稳定性）
`thunk.h`（用户态）和上面 `common/` 那几个头是**同一份契约**，用户态 thunk 与 `aigc.ko` 用同一套定义编译。
**改一个 `AIP_*` 编号、重排 `enum AIP_IOCTL`、改 `struct ioctl_*_args`（或它内嵌的任何 `THUNKIF_*`）、或
改一条命令的 `_IOWR`/`_IOW`/`_IOR` 方向，都是破坏性 ABI 变更**，必须连同 `thunk.h` 里的 `THUNK_IF_VERSION`
一起动。好在第一级校验的是**精确编码的 `cmd`**（含方向和结构体大小），所以用户态/内核版本不匹配时会
**fail-closed 报 `-EINVAL`**，而不是悄悄把参数写坏。务必两边一起重编，并保持 `aip_ioctl_nr.h`、
`aip_ioctl.h`、`aip_common_ioctl.h`、`aigc_ioctl_tab.h` 互相一致。

## 下一步
- 上一页：[02 核心数据结构](<./02-data-structures.md>)
- 下一页：[04 内存与页表](<./04-memory-and-pagetables.md>)
