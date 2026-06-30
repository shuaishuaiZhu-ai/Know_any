---
type: topic
title: "tiny-kmd 对照 ajthunk 的缺口"
created: 2026-06-13
updated: 2026-06-13
tags:
  - tiny-kmd
  - kmd
  - porting
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:/data3/shuaishuai.zhu/tiny_kmd"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd"
---

# tiny-kmd 对照 ajthunk 的缺口

**关联**: [[wiki/grace/tiny-kmd/index|tiny-kmd 知识库]] | [[wiki/grace/kmd/index|ajthunk KMD 知识库]]

> 这是 tiny-kmd 与移植工作之间的**桥接页**：把 tiny-kmd 现状对照 ajthunk 核心，列清楚「缺什么、从哪接入」。
> 详细的移植顺序与重构步骤在代码仓 `aigc-kmd-modular/docs/` 里（移植指南 + tiny-kmd 重构指南）。

---

## 子系统对照表

| 子系统 | tiny-kmd | ajthunk | 移植难度 |
|---|---|---|---|
| PCI probe / BAR | ✅ 已实现 | ✅ | 已有，复用 tiny-kmd |
| misc 设备 + ioctl | ✅ 6 个（magic `'A'`） | ✅ 30 个（`0x81`） | 收口层，最后做 |
| **IPC（ringbuffer）** | ✅ 显式独立一层 | ⚪ 隐式在子系统里 | tiny-kmd 更清晰，作对接底座 |
| MSI-X 中断 | 🟡 分配 OK，enable/disable 是桩 | ✅ 完整向量表 + 上/下半部 | 中 |
| DMA 内存 | ✅ `dma_alloc_coherent`（每 fd 一块） | ✅ 堆/NUMA/UMA/DSMEM | — |
| **OS 抽象层** | ❌ 无（直接 Linux API） | ✅ `os_interface.c` 缝隙 | **先决条件** |
| **HAL / 寄存器抽象** | ❌ 无（直接 `iowrite32`） | ✅ 函数指针 ops 表 | **先决条件** |
| **页表 / MMU** | ❌ 无（直接 DMA 物理地址） | ✅ 4 级页表 [[aigc_page_table]] | 高 |
| **命令队列 / 环** | ❌ 无 | ✅ MCQD/CP ring [[wiki/grace/kmd/05-submission-events-interrupts]] | 高 |
| **调度器** | ❌ 无 | ✅ kthread + 默认调度 [[aigc_sched]] | 中 |
| **fence / 事件同步** | ❌ 无（只有 IPC 订阅） | ✅ TS buffer + 完成中断 [[aigc_kmd_fence]] | 中 |
| **context / vdev 虚拟化** | ❌ 单设备 | ✅ [[aigc_ctx]]/[[aigc_vdev]] | 中 |
| 固件更新 | ❌ 无（IPC 里有 `FW_UPDATE` 命令 ID） | ✅ `aigc_fw_update.c` | 低-中 |

✅=有 🟡=部分 ⚪=隐式 ❌=无

## 两个必须先补的「先决条件」

ajthunk 的可移植性建立在两道缝隙上，tiny-kmd 都没有，**移植任何核心模块前必须先补**：

1. **OS 抽象层（`os_*`）**：ajthunk kmdlib 从不直接调 Linux，全部经 `os_interface.h` 的 `os_*` 包装（见
   [[os_interface]]）。tiny-kmd 要先有一套 `os_*`（哪怕薄封装现有的直接调用），ajthunk 模块才能原样搬入。
2. **HAL 函数指针表（`hal/hal.h`）**：ajthunk 的硬件访问全走 `pte_ops`/`dm_ops`/`hal.*` 函数指针。tiny-kmd 现在
   直接 `iowrite32`，要先建一层 ops 表把寄存器访问收口，ajthunk 的 mem/页表/队列才能对接。

## 已经现成的对接点

- **IPC 命令 ID 已预留**：`CREATE/DESTORY_CONTEXT`(160/161)、`CREATE/DESTORY_STREAM`(163/164)、
  `CREATE/DESTORY_EVENT`(166/167)（[[wiki/grace/tiny-kmd/ipc]]）——天然对应 ajthunk 的 context/queue/event 概念。
- **共享内存 + ringbuffer**：可作为 ajthunk CP/IMC IPC 的传输层。
- **MSI-X 框架**：补全 enable/disable 后即可承接 ajthunk 的中断/fence。

## 推荐移植顺序（详见代码仓移植指南）

```mermaid
flowchart LR
  OS["① 加 os_* 抽象"] --> HAL["② 加 HAL ops 表"]
  HAL --> MEM["③ mem (最干净)"]
  MEM --> PGT["④ 页表/MMU"]
  PGT --> CTX["⑤ ctx/vm"]
  CTX --> Q["⑥ 队列/环"]
  Q --> SCH["⑦ 调度"]
  SCH --> INT["⑧ 中断/fence"]
  INT --> IOC["⑨ ioctl 收口"]
```

## 延伸

- [[wiki/grace/kmd/index|ajthunk KMD 知识库]]：每个待移植模块的详解。
- 代码仓 `aigc-kmd-modular/`：抽取的模块树 + `docs/01-porting-...` 移植指南 + `docs/02-tiny-kmd-refactor-guide`。
- [[wiki/grace/kmd/01-architecture]]：三层架构（移植要照着补）。
