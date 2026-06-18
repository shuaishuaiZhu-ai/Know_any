---
type: topic
title: "ioctl ABI 与操作表"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - ioctl
  - abi
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/common/aip_ioctl_nr.h"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/common/aip_ioctl.h"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/common/aip_common_ioctl.h"
---

# ioctl ABI 与操作表

**文件**: `common/aip_ioctl_nr.h`、`common/aip_ioctl.h`、`common/aip_common_ioctl.h`、`common/include/aigc_ioctl_tab.h`
**关联**: [[wiki/grace/kmd/ioctl/aigc_ioctl]] | [[wiki/grace/kmd/arch/request-path]]

> 这份 ABI 完全由 repo 根 `common/` 里的三个头文件定义，**thunk 用户态库和内核驱动逐字共享**。

## ABI 三件套

| 头文件 | 角色 |
|---|---|
| `common/aip_ioctl_nr.h` | `enum AIP_IOCTL` 操作编号（`AIP_*`）。 |
| `common/aip_ioctl.h` | 用 `_IOWR`/`_IOW`/`_IOR` 编码的 ioctl 命令宏。 |
| `common/aip_common_ioctl.h` | 按指针传递的 `struct ioctl_*_args` 参数结构。 |

### 魔数与命令编码

所有命令用 ioctl 魔数 `0x81`。方向反映数据怎么在用户/内核间流动：

- `_IOWR` — 参数结构既被用户写、又被内核回填（多数操作）。
- `_IOW` — 只写（内核只读参数）。
- `_IOR` — 只读（内核只填参数）。

第三个宏参数是 `struct ioctl_*_args` 类型，它定死 `_IOC_SIZE(cmd)`。例：

```c
#define AIP_MEM_CREATE_IOCTL  _IOWR(0x81, AIP_MEM_CREATE, struct ioctl_mem_create_args)
#define AIP_MEM_DESTROY_IOCTL _IOW (0x81, AIP_MEM_DESTROY, struct ioctl_mem_destroy_args)
#define AIP_GET_DEVICE_TIME_IOCTL _IOR(0x81, AIP_GET_DEVICE_TIME, struct ioctl_get_current_device_time_args)
```

## 操作表（派发清单）

下表来自 `common/include/aigc_ioctl_tab.h`（须与 `aip_ioctl_nr.h` 的 `enum AIP_IOCTL` 同步）。
所有处理函数都在 `kmd/aigc/kmdlib/aigc_fops.c`。**共 30 个操作被派发。**

| # | `AIP_*` 操作 | 内核处理函数 | 说明 |
|---|---|---|---|
| 0 | `AIP_CONTEXT_CREATE` | `aigc_ioctl_context_create` | 创建 GPU 上下文（及其 VM），返回打包的上下文句柄。 |
| 1 | `AIP_CONTEXT_DESTROY` | `aigc_ioctl_context_destroy` | 按句柄销毁上下文。 |
| 2 | `AIP_QUEUE_CREATE` | `aigc_ioctl_queue_create` | 在上下文里创建命令/提交队列，返回句柄和 doorbell 地址。 |
| 3 | `AIP_QUEUE_DESTROY` | `aigc_ioctl_queue_destroy` | 销毁命令队列。 |
| 4 | `AIP_MEM_OPEN` | `aigc_ioctl_mem_open` | 导入另一个上下文/设备导出的分配（MAP 模式句柄）。 |
| 5 | `AIP_MEM_CREATE` | `aigc_ioctl_mem_create` | 分配 GPU 内存（设备或 host），建页表，返回句柄/VA。 |
| 6 | `AIP_MEM_DESTROY` | `aigc_ioctl_mem_destroy` | 释放内存分配。 |
| 7 | `AIP_MEM_LOCK` | `aigc_ioctl_mem_lock` | 锁定（pin）分配，返回 host 指针。 |
| 8 | `AIP_MEM_UNLOCK` | `aigc_ioctl_mem_unlock` | 解锁之前锁定的分配。 |
| 9 | `AIP_QUEUE_SUBMIT` | `aigc_ioctl_queue_submit` | 向队列提交命令缓冲（见下注）。 |
| 15 | `AIP_EVENT_CREATE` | `aigc_ioctl_event_create` | 在上下文里创建同步事件，返回事件 id/句柄。 |
| 16 | `AIP_EVENT_DESTROY` | `aigc_ioctl_event_destroy` | 按句柄销毁事件。 |
| 17 | `AIP_GET_PROP` | `aigc_ioctl_get_prop` | 把设备属性（HW 拓扑/内存计数）报给用户态。 |
| 18 | `AIP_CREATE_SHMEM` | `aigc_ioctl_create_shmem` | 创建对另一个上下文分配的共享映射（跨进程 IPC）。 |
| 19 | `AIP_INIT_EVENT_TRACKER` | `aigc_ioctl_init_event_tracker` | 建立每 vdev 的事件 tracker 环（一次性，非线程安全）。 |
| 20 | `AIP_DESTROY_EVENT_TRACKER` | `aigc_ioctl_destroy_event_tracker` | 销毁 vdev 的事件 tracker。 |
| 21 | `AIP_SEND_EVENT_TEST` | `aigc_ioctl_send_event_test` | 往事件 tracker 队列注入一个测试事件（调试路径）。 |
| 22 | `AIP_PMEM_CREATE` | `aigc_ioctl_pmem_create` | 分配设备物理内存，返回其裸 GPU 物理地址（DPA）。 |
| 23 | `AIP_PMEM_RELEASE` | `aigc_ioctl_pmem_release` | 释放 pmem 分配（校验传入的 DPA）。 |
| 24 | `AIP_MEM_ADDR_RESERVE` | `aigc_ioctl_mem_addr_reserve` | 预留一段对齐的 GPU VA（设备堆），不分配后备。 |
| 25 | `AIP_MEM_ADDR_FREE` | `aigc_ioctl_mem_addr_free` | 释放之前预留的 GPU VA 段。 |
| 26 | `AIP_MEM_MAP` | `aigc_ioctl_mem_map` | 在调用方给定 VA 处映射分配的 PTE。 |
| 27 | `AIP_MEM_UNMAP` | `aigc_ioctl_mem_unmap` | 清除分配的页表项。 |
| 28 | `AIP_MEM_SET_ACCESS` | `aigc_ioctl_mem_set_access` | 改变分配某子区间的访问保护。 |
| 29 | `AIP_DUMP_PGT` | `aigc_ioctl_dump_pgt` | 把上下文页表 dump 进用户提供的缓冲。 |
| 30 | `AIP_FW_UPDATE` | `aigc_ioctl_fw_update` | 触发固件镜像更新。 |
| 31 | `AIP_FW_UPDATE_STATE` | `aigc_ioctl_get_fw_update_state` | 查询固件更新进度/状态。 |
| 32 | `AIP_FW_PW_UPDATE` | `aigc_ioctl_fw_pw_update` | 改固件密码。 |
| 33 | `AIP_FW_PW_STATE` | `aigc_ioctl_get_fw_pw_update_state` | 查询固件密码更新状态。 |
| 34 | `AIP_IMC_START_STAGE` | `aigc_ioctl_get_imc_start_stage` | 查询 IMC start-stage 状态。 |

### 保留 / 暂未派发的编号

`enum AIP_IOCTL` 保留了 5 个**不在** `aigc_ioctl_tab.h` 里、因而两张表都没有项的编号：`AIP_GET_STATE`(10)、
`AIP_GET_INFO`(11)、`AIP_WAIT_FENCE`(12)、`AIP_SIGNAL_FENCE`(13)、`AIP_GET_DEVICE_TIME`(14)。fops 里虽有
`aigc_ioctl_get_info`/`wait_fence`/`signal_fence` 的桩函数，但没接进表，所以发这些命令号目前会从
`aigc_lib_ioctl()` 返回 `-EINVAL`。**Fence 走提交/事件路径而非独立 ioctl**（见 [[wiki/grace/kmd/interrupt/index|中断与 Fence]]）。

### 两个处理函数的特殊点

- `aigc_ioctl_queue_submit` 当前会提前返回 `-EFAULT`——这个 build 里经此 ioctl 的直接提交是关闭的。
- `aigc_ioctl_create_shmem` 行为类似 `aigc_ioctl_mem_open`，但支持跨进程 IPC：置标志后预分配对齐 VA、
  要求设备堆、并取一个 export 引用，使导出方在被导入期间无法释放该分配。

## 稳定性：这是一份共享 ABI

`thunk.h`（用户态）和上面的 `common/` 头文件是**同一份契约**。

> **改一个 `AIP_*` 编号、重排 `enum AIP_IOCTL`、改一个 `struct ioctl_*_args`（或它内嵌的任何 `THUNKIF_*`）、
> 或改一个命令的 `_IOWR`/`_IOW`/`_IOR` 方向，都是破坏性的 ABI 改动。** 两边必须同步重编，并保持
> `aip_ioctl_nr.h`、`aip_ioctl.h`、`aip_common_ioctl.h`、`aigc_ioctl_tab.h` 互相一致；`thunk.h` 里的
> `THUNK_IF_VERSION` 也要一起动。因为第一级校验的是**精确编码的 `cmd`**（含方向和结构大小），用户态/内核
> 不匹配时会 fail closed（`-EINVAL`）而不是悄悄破坏内存。

## 延伸

- [[wiki/grace/kmd/ioctl/aigc_ioctl]]：两级派发的代码细节。
- [[wiki/grace/kmd/memory/index|内存与页表]]：`AIP_MEM_*` 系列对应的内存生命周期。
