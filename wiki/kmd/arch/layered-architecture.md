---
type: topic
title: "三层架构与 OS 抽象规则"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - arch
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc"
---

# 三层架构与 OS 抽象规则

**文件**: `kmd/aigc/*.c`（入口层）、`kmd/aigc/kmdlib/*`（核心层）、`kmd/aigc/kmdlib/hal/grace/*`（HAL）
**关联**: [[wiki/kmd/arch/request-path]] | [[os_interface]] | [[wiki/kmd/index|KMD 知识库]]

> kmd 编成一个可加载模块 `aigc.ko`，绑定 GPU 的 PCI function，创建 `/dev/aigcN`，把用户态 ioctl 变成
> Grace 硬件操作。代码按三层组织，**外层贴 OS、中层可移植、内层贴硬件**。

---

## 为什么要分三层？（讲给应届生）

一个内核驱动同时要面对两个「易变」的东西：

1. **Linux 内核 API 易变**——不同内核版本，函数签名、宏、结构体字段都可能变。
2. **硬件易变**——同一套软件以后可能要支持别的芯片、或在 cmodel/emulator/真芯片之间切换。

把这两类「易变」各自关进一层，中间夹一层「只讲业务、不碰易变」的可移植核心，就能让大改动局限在边界层。
这就是 kmd 三层划分的初衷，也是 NVIDIA 等成熟 GPU 驱动的通用做法。

---

## ① Linux / PCI 驱动入口层 — `kmd/aigc/*.c`

**唯一允许直接调用 Linux 内核 API 的一层。** 负责模块生命周期和对外可见的「面」：

| 文件 | 职责 |
|---|---|
| `aigc_drv.c` / `aigc_drv.h` | PCI 驱动注册、每设备 probe/remove：映射 MEM/REG/CFG BAR、设 DMA mask、配 PCIe iATU、resize 显存 BAR、申请 MSI-X、初始化内嵌的 kmdlib 句柄、创建 `/dev/aigcN`。定义驱动私有对象 [[aigc]]（`struct aigc`）。把硬件中断路由到 kmdlib 的上半部 + workqueue 下半部。 |
| `aigc_ioctl.c` | `/dev/aigcN` 的 `file_operations`（open/release/ioctl/mmap/poll）和 ioctl 校验，转发进核心层（见 [[wiki/kmd/arch/request-path]]）。 |
| `aigc_pcie.c` / `aigc_sysfs.c` / `aigc_link*.c` / `aigc_dma.c` / `aigc_p2p.c` | PCIe 配置助手、sysfs 属性、跨 GPU link 驱动、DMA、P2P。 |
| `os_interface.c` | **OS 抽象缝隙**（见下）。整个驱动里**唯一**替核心层 `#include <linux/...>` 的翻译单元。 |

## ② 可移植核心 — `kmd/aigc/kmdlib/*`

实现每一个用户可见操作的 OS 无关逻辑。**它从不直接调 Linux**，所有 OS 原语都走 `os_*` 包装。

- **ioctl 处理中枢** — `aigc_fops.c`：`aigc_lib_ioctl()` 把每个请求派发到一个 `aigc_ioctl_*` 处理函数；这里也放 VMID 池和 vdev/ctx 生命周期助手。
- **上下文与设备** — `aigc_lib_dev.c`、`aigc_ctx.c`、`aigc_devm.c`。
- **内存与页表** — `aigc_mem_handle.c`、`aigc_page_table.c`、`aigc_memrw.c`、`genalloc.c`。
- **队列/环/命令** — `aigc_cmd.c`、`aigc_cp_ring.c`、`aigc_cp_cmd_pkt.c`、`aigc_queue_manager.c`。
- **调度** — `aigc_sched.c`、`aigc_default_scheduler.c`。
- **中断与 fence** — `aigc_interrupt.c`、`aigc_interrupt_ring.c`、`aigc_kmd_fence.c`。
- **固件更新** — `aigc_fw_update.c`。

## ③ Grace HAL — `kmd/aigc/kmdlib/hal/grace/*` + `kmd/aigc/kmdlib/regs/*`

Grace 芯片的硬件后端，只能通过 `hal/hal.h` 里的函数指针表访问（`struct aigc_lib_hal` 聚合每个硬件块一个子 HAL）。
详见 [[wiki/kmd/hal/index|Grace HAL]]。主要块：CP（命令处理器）、arch（拓扑/cluster）、IMC（片上 MCU 邮箱）、
L2C、TCU（翻译/MMU）、C2C/D2D/link（互联）。寄存器布局在 `regs/grace_reg_define.h`、`regs/grace_reg_cluster.h`。

---

## OS 抽象规则（最重要的一条纪律）

> **kmdlib 不准直接调用 Linux 内核 API。**

`os_interface.c` 之上的一切——HAL、调度器、内存管理、命令与 fence——只用
`common/include/os_interface.h` 里声明的 `os_*`（和少量 `aigc_*`）包装。`os_interface.c` 是**唯一**
`#include <linux/...>` 的翻译单元；它用真内核实现这些包装，并把不透明的 `void *` 句柄「洗」回具体的内核
结构体类型。

这样做的好处：

- **内核版本漂移被关进一个文件**——升级内核大多只动 `os_interface.c`（配合 conftest，见 [[os_interface]]）。
- **核心可移植**——同一套 kmdlib 既能编进内核模块，也能编进 host 测试环境。

> 踩坑提示：在 kmdlib 里看到要调内核函数时，先去 `os_interface.h` 找有没有对应 `os_*` 包装；没有就该在
> `os_interface.c` 里加一个，而不是在核心层直接 `#include <linux/...>`——否则就破坏了可移植性。

## 延伸

- [[wiki/kmd/arch/request-path]]：把这三层用一次真实请求串起来。
- [[os_interface]]：缝隙层 + conftest 细节。
- [[wiki/kmd/hal/index|Grace HAL]]
