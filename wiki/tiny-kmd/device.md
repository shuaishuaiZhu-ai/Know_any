---
type: note
title: "tiny-kmd 设备与内存"
created: 2026-06-13
updated: 2026-06-13
tags:
  - tiny-kmd
  - device
  - pcie
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:/data3/shuaishuai.zhu/tiny_kmd/tinykmd/aigc_device.c"
  - "shuaishuai.zhu@192.168.80.116:/data3/shuaishuai.zhu/tiny_kmd/tinykmd/aigc_pcie_atu.c"
---

# tiny-kmd 设备与内存

**文件**: `tinykmd/aigc_device.{c,h}`、`aigc_pcie_atu.{c,h}`、`aigc_drv.c`
**关联**: [[wiki/tiny-kmd/architecture]] | [[wiki/tiny-kmd/ipc]]

> 这一层负责把 PCI 设备的 BAR 映射进内核、划出几块寄存器/共享内存区、配 PCIe 入站地址翻译（ATU），
> 并给用户态提供 DMA 内存分配。

---

## BAR 与内存区

`aigc.h:16` 定义 BAR 索引：`REG_BAR_INDEX=0`、`MEM_BAR_INDEX=2`、`PCIE_CONFIG_BAR_INDEX=4`。

- **显存 BAR resize**：`aigc_pcie_resize_videomem_bar()`（`aigc_device.c:13`）把 MEM BAR 调到 256G
  （`AIGC_GLOBAL_MEM_BAR_256G=11`，即 2^11 MB 档），对应设备全局内存地址 `AIGC_GLOBAL_MEM_ADDR=0x1000000000`（1TB）。
- **映射助手**：`remap_io_region()`（`aigc_device.c:66`）= `request_pci_io_addr` + `ioremap`，填进一个
  `struct aigc_io_region`；`cleanup_io_region` 反向释放。
- **寄存器/共享内存区**：`request_register_io_region()`（`aigc_device.c:95`）从 PCIe 配置 BAR 里按偏移映射三块
  （`aigc_device.h:9`）：
  - `IMC_SHARE_MEMORY`（偏移 `0x04010000`，大小 `0x8000`）—— IPC ringbuffer 就放这里；
  - `IMC_ILM`（`0x01000000`，`0x40000`）；
  - `IMC_REGBANK`（`0x4000000`，`0x9000`）。
- **设备内存初始化**：`aigc_device_memory_init()`（`aigc_device.c:152`）映射 MEM BAR；
  `aigc_device_common_init()`（`aigc_device.c:189`）= 内存区 + [[wiki/tiny-kmd/interrupt|中断]] + ATU。

## PCIe ATU（入站地址翻译）

`aigc_atu_init()`（`aigc_pcie_atu.c:16`）配置一个**入站（inbound）**ATU 区，把 MEM BAR 的访问翻译到设备全局
内存地址 `AIGC_GLOBAL_MEM_ADDR`。寄存器布局在 `aigc_pcie_atu.h`（`PCIE_ATU_LOWER/UPPER_BASE`、`_TARGET`、
`_REGION_CTRL1/2`、`PCIE_ATU_ENABLE` 等），通过 `atr_reg_writel` 直接写 PCIe 配置区映射出来的寄存器。

> **给应届生**：ATU = PCIe 控制器里的「地址翻译表」，让 Host 通过 BAR 看到的地址，映射到设备内部的真实物理地址。

## DMA 内存分配（给用户态）

用户态通过 `AIGC_MISC_MEMORY_ALLOC` ioctl 申请一块 DMA 内存（见 [[wiki/tiny-kmd/ioctl]]）：
内核用 `dma_alloc_coherent()` 分配，**每个 fd 最多一块**，上限 `AIGC_MISC_MEM_ALLOC_MAX=4MB`（`aigc_misc.h:16`），
再通过 `mmap` 映射给用户态。probe 末尾 `dma_set_mask(48)` 设定 48 位 DMA 寻址。

> 对比 [[wiki/kmd/memory/index|ajthunk 内存与页表]]：tiny-kmd **没有页表/MMU/VA 翻译**，是「直接 DMA 物理地址」，
> 这是移植 ajthunk 内存/页表模块时最大的缺口之一。

## 延伸

- [[wiki/tiny-kmd/architecture]]：probe 序列里这层在哪一步。
- [[wiki/tiny-kmd/ioctl]]：MEMORY_ALLOC/FREE/mmap。
- [[wiki/tiny-kmd/gap-vs-ajthunk]]：缺页表/MMU 的影响。
