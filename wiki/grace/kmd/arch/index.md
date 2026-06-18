---
type: index
title: "KMD 架构总览"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - arch
  - index
status: active
---

# KMD 架构总览

> kmd 按「离操作系统近 → 离硬件近」分三层：**Linux/PCI 驱动入口层**（唯一能直接调内核 API）、
> **可移植核心 kmdlib**（实现所有用户可见操作、不碰内核 API）、**Grace HAL**（芯片相关后端）。

## 本区页面

- [[wiki/grace/kmd/arch/layered-architecture|三层架构与 OS 抽象规则]]：每层各做什么、目录怎么对应、为什么这么分。
- [[wiki/grace/kmd/arch/request-path|一次 ioctl 的端到端路径]]：从 `open()` 到处理函数再到硬件，逐步走一遍。

## 一眼看懂的分层

```mermaid
flowchart TD
  subgraph L1["① Linux/PCI 驱动入口层 — kmd/aigc/*.c"]
    drv["aigc_drv.c (PCI probe/中断)"]
    ioc["aigc_ioctl.c (fops/校验)"]
    osi["os_interface.c (唯一碰 linux/*)"]
  end
  subgraph L2["② 可移植核心 — kmd/aigc/kmdlib/*"]
    fops["aigc_fops.c (ioctl 派发)"]
    sub["ctx / 内存 / 页表 / 队列 / 调度 / 中断 / fence"]
  end
  subgraph L3["③ Grace HAL — kmdlib/hal/grace/*"]
    hal["CP / arch / IMC / L2C / TCU / 互联"]
  end
  L1 --> L2 --> L3 --> HW["Grace GPU 硬件"]
  L2 -. 只能经 os_* .-> osi
```

## 延伸

- [[wiki/grace/kmd/index|KMD 内核驱动知识库]]
- [[wiki/grace/kmd/concepts/index|核心数据结构]]
- [[wiki/grace/kmd/ioctl/index|ioctl 接口与 ABI]]
