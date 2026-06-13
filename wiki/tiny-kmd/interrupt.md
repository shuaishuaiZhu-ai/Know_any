---
type: note
title: "tiny-kmd 中断"
created: 2026-06-13
updated: 2026-06-13
tags:
  - tiny-kmd
  - interrupt
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:/data3/shuaishuai.zhu/tiny_kmd/tinykmd/aigc_irq.c"
---

# tiny-kmd 中断

**文件**: `tinykmd/aigc_irq.{c,h}`
**关联**: [[wiki/tiny-kmd/ipc]] | [[wiki/tiny-kmd/architecture]]

> tiny-kmd 用 **MSI-X**，目前主要服务 IPC：固件往 ringbuffer 放好响应后，用 RX 中断（109/111）通知 Host。
> 注意 **enable/disable 当前是空桩**。

---

## 初始化

`aigc_interrupt_init()`（`aigc_irq.c:84`）在 `aigc_device_common_init` 里被调用：用 `pci_alloc_irq_vectors`
分配 MSI-X 向量（最多 `MAX_MSIX_VECTORS=256`，记录在 `aigc_irq_info_t`），并为需要的向量 `request_irq` 挂处理函数。
`aigc_interrupt_exit()`（`aigc_irq.c:142`）释放。

## IPC 用到的中断号（`aigc_ipc.h:25`）

| 向量 | 方向 |
|---|---|
| 108 | host → IMC（触发） |
| 109 | IMC → host（接收） |
| 110 | host → CP_Master（触发） |
| 111 | CP_Master → host（接收） |

RX 中断处理函数是 `aigc_ipc_irq_handler`（`aigc_ipc.c:325`），只 `schedule_work` 进下半部取消息（见 [[wiki/tiny-kmd/ipc]]）。

## 接口与桩

`aigc_irq.h:27` 声明的接口：
- `aigc_set_interrupt_handler`（`aigc_irq.c:17`）—— 已实现，挂处理函数。
- `aigc_set_interrupt`（`:47`）/ `aigc_clear_interrupt`（`:63`）—— 已实现，通过 `INT_CTRL_*` 寄存器组
  （`aigc_irq.h:9`：INTR2PCIE / INTR2CP / INTR2IMC 的 SET/CLR/EN/MASK 基址）set/clear 中断。
- **`aigc_enable_interrupt`（`:37`）/ `aigc_disable_interrupt`（`:42`）—— 空桩，目前只 `return 0`。** 移植/完善时需补全
  使能/屏蔽逻辑。

## 延伸

- [[wiki/tiny-kmd/ipc]]：中断如何驱动消息收取。
- [[wiki/kmd/interrupt/index|ajthunk 中断与 Fence]]：对照完整的 MSI-X 向量表、上/下半部、fence 完成模型。
- [[wiki/tiny-kmd/gap-vs-ajthunk]]：中断/fence 是要移植的子系统之一。
