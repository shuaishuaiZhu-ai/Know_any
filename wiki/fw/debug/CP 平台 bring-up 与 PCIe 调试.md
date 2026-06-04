---
type: topic
title: "CP 平台 bring-up 与 PCIe 调试"
created: 2026-05-09
updated: 2026-05-09
tags: [cp, bring-up, pcie, emu, palladium, loader]
status: active
source:
  - "[[语雀工作笔记索引]]"
---

# CP 平台 bring-up 与 PCIe 调试

## 结论

2025-08 到 2026-02 的工作笔记体现了平台 bring-up 的主线：CP loader、multi CP user reset、PCIe server、PZ1/PZ3/Palladium、KMD KO 加载和 fence 返回。这些问题通常跨硬件平台、bootrom、驱动、firmware 和测试工具。

## 关键事件

- 2025-08：多 CP user 启动时，第二个 user 可能在第一个 reset 未完成前访问 NOC，引发 bus err；通过 delay 组合定位 reset 时序。
- 2025-10：PCIe speed bridge 上 t4/t5/t6 同时占用会影响启动，t28 不受影响；还观察到 bootrom/服务器 reset 顺序影响。
- 2025-10：DM1.4 下 kernel test fence 不返回，但同代码在 DM1.1 可返回。
- 2025-11：4cls 2pe 版本冒烟中，CP master 起不来，最终怀疑 CP user 代码路径；cls bitmap 只有 cls0 写入。
- 2026-01：Palladium 上 reset PCIe 不足以恢复，可能需要重启整个平台。
- 2026-02：PZ1 KO 加载与 mutex 相关，使用 PCIe remove/rescan 流程做恢复实验。

## 排查方法

- 先区分平台问题、boot 顺序问题、驱动问题和 CP firmware 问题。
- 使用最小配置回归：1cls1pe、内部 SDMA/kernel、老 loader、老打包工具。
- 保存 `kern.log`、`dmesg`、UMD log 和波形，避免只凭现象判断。
- 对 fence 不返回类问题，确认 CP 是否已执行完 cmd，再查 host/KMD 是否收到完成信号。

## 关联

- [[CP SDMA copy 与 kernel command 调试]]
- [[CP ringbuffer IPC 与 queue create 调试]]
- [[CP 多队列多上下文与 HCQD MCQD]]
