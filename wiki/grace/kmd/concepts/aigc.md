---
type: entity
title: "aigc (struct)"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - concepts
  - device
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/aigc_drv.h"
---

# aigc (struct)

> `struct aigc` 是**驱动侧（PCI/OS 那一半）的每设备私有对象**——一颗绑定的 PCI function 一个。它把可移植
> 核心的根对象 [[aigc_lib_device]] **内联**存放在尾部，二者一起构成「一颗物理 GPU 的两个根」。

**文件**: `kmd/aigc/aigc_drv.h`
**关联**: [[aigc_lib_device]] | [[wiki/grace/kmd/arch/layered-architecture]] | [[wiki/grace/kmd/concepts/index|核心数据结构]]

## 关键字段

- `minor` / `dev_id` — 字符设备 minor（与设备 id 对齐）。
- `chr_dev` / `pdev` / `pdev_dev` — `/dev/aigcN` 节点与背后的 PCI 设备。
- `membase` / `regbase` / `cfgbase` — ioremap 后的 MEM / REG / CFG BAR 基址。
- `msix_vectors` / `msix_num` / `irq` / `irq_type` — MSI-X / IRQ 簿记。
- `irq_wq` / `irq_work` / `irq_work_lock` / `irq_work_pending` — 中断下半部 workqueue；`irq_work_pending` 是 `enum aigc_irq_work_bit` 位图。
- `lib_dev_handle[]` — 尾部 8 字节对齐的柔性数组，**内联**存放不透明的 [[aigc_lib_device]]。

## 给应届生：为什么是「两个根」？

OS 侧的 `struct aigc`（PCI 胶水）和可移植侧的 [[aigc_lib_device]] 分开，靠 `void *` 句柄互通——这是
[[wiki/grace/kmd/arch/layered-architecture|三层架构]]在数据结构上的落地：换内核版本主要动 OS 侧，换芯片主要动核心/HAL，
两者互不污染。

## 所有权

全局 `aigc_devs` 链表持有（`aigc_mutex` 保护）；一颗绑定的 PCI function 一个。

## 延伸

- [[aigc_lib_device]]：被内联的可移植核心根对象。
- [[wiki/grace/kmd/arch/layered-architecture]]
- [[aigc_interrupt]]：`irq_work_*` 怎么驱动下半部。
