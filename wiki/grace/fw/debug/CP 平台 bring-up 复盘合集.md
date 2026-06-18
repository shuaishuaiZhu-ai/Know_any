---
type: topic
title: "CP 平台 bring-up 复盘合集"
created: 2026-05-09
updated: 2026-06-18
tags: [cp, bring-up, pcie, sdma, bug-scan, debug, v9, emu, palladium, loader]
status: active
source:
  - "[[语雀工作笔记索引]]"
  - ".raw/local-md/C-home-shuaishuai.zhu/fw/aigc_sdk_bug_report.md"
  - ".raw/local-md/C-home-shuaishuai.zhu/fw/aigc_sdk_check_report.md"
---

# CP 平台 bring-up 复盘合集

> 本页合并原「CP SDMA copy 与 kernel command 调试」「CP 平台 bring-up 与 PCIe 调试」「aigc_sdk Bug 扫描与修复优先级」三篇稀薄调试页，用一条时间线串起 SDMA copy、PCIe/KO 加载、aigc_sdk 静态扫描三类问题。三篇原文都只有"事件清单 + 调试顺序"骨架，缺波形/diff/代码引用；本页保留骨架并标注待补证据，后续拿到证据再回填。

## 时间线（2025-08 → 2026-05）

- **2025-08**：多 CP user 启动时，第二个 user 可能在第一个 reset 未完成前访问 NOC，引发 bus err；通过 delay 组合定位 reset 时序。
- **2025-10**：PCIe speed bridge 上 t4/t5/t6 同时占用会影响启动，t28 不受影响；bootrom/服务器 reset 顺序也有影响。同月 DM1.4 下 kernel test fence 不返回，但同代码在 DM1.1 可返回。
- **2025-11**：4cls 2pe 版本冒烟中 CP master 起不来，怀疑 CP user 代码路径；cls bitmap 只有 cls0 写入。
- **2025-12 → 2026-01**：loader/多 CLS/PE、RTOS init、多 context、HCQD global id 调试；Palladium 上 reset PCIe 不足以恢复，可能需要重启整个平台。
- **2026-02**：PZ1 KO 加载与 mutex 相关，使用 PCIe remove/rescan 流程做恢复实验。
- **2026-05**：V9 emu 上 SDMA copy 后 host/device memory 的 kernel cmd 对比失败（第 202 个 index 稳定失败，前面 copy 正常）；其他 emu 未复现。

## 主题一：CP SDMA copy 与 kernel command 调试

### 结论

2026-05 的 V9 SDMA copy 问题体现了一个典型调试框架：先确认 command packet 本身是否正确，再区分 UMD/KMD、host/device memory、SDMA 执行和版本差异。

### 关键事实

- 问题表现：UMD 的第一个 copy kernel cmd 出错；SDMA copy 后，host 和 device memory 上的 kernel cmd 对比失败。
- 特征点：第 202 个 index 对比未通过，前面 copy 正常。
- 版本相关：只在 V9 emu 上出现，其他 emu 没有复现。
- packet 检查：operator 确认为 SDMA，body 字段看起来没有明显异常。

### 调试顺序

1. 检查 UMD 组包和 packet header/body。
2. 检查 host/device memory 地址、size、对齐和边界。
3. 检查 SDMA 收到的 command 是否与 UMD 下发一致。
4. 比较 V9 与其他 emu 的差异。
5. 用 index 202 的稳定失败点反推 size、burst、边界或 cache/同步问题。

> 待补证据：V9 emu 的 SDMA 波形、index 202 处的 host/device memory dump、V9 与其他 emu 的 diff。

## 主题二：CP 平台 bring-up 与 PCIe 调试

### 排查方法

- 先区分平台问题、boot 顺序问题、驱动问题和 CP firmware 问题。
- 使用最小配置回归：1cls1pe、内部 SDMA/kernel、老 loader、老打包工具。
- 保存 `kern.log`、`dmesg`、UMD log 和波形，避免只凭现象判断。
- 对 fence 不返回类问题，确认 CP 是否已执行完 cmd，再查 host/KMD 是否收到完成信号。
- Palladium 上 reset PCIe 不足以恢复时，考虑重启整个平台。

> 待补证据：各平台（PZ1/PZ3/Palladium/EMU）的 reset 时序波形、KO 加载失败时的 `dmesg`、PCIe remove/rescan 的恢复验证记录。

## 主题三：aigc_sdk Bug 扫描与修复优先级

整合 `aigc_sdk_bug_report.md` 与 `aigc_sdk_check_report.md`。两份报告都不是最终修复证明，而是风险清单和排查入口。

### 高优先级模式

- 缺少 return 或未覆盖返回路径：会造成未定义行为，优先确认函数签名和调用方依赖。
- 未初始化变量：典型位置包括 ISR、IPC、boot_info、event_info 等硬件/消息路径。
- malloc/rt_malloc 返回值未检查：release 模式下 RT_ASSERT 不一定保护运行时。
- 无超时等待：寄存器轮询、IRQ full、wait_host 类路径都可能导致永久阻塞。
- 边界检查错误：handler register、ringbuffer length 等要重点看数组上限和 wrap 逻辑。

> 待补证据：每个风险模式对应的具体 bug 实例、修复 commit、与上游报告的差异。

## 关联

- [[CP-Command-Packet]] / [[iDMA]] — SDMA copy 的 packet 与 dispatch 路径。
- [[CP command processing flow]] — 无超时等待和 wait_host 风险。
- [[CP stop flush 与 queue 切换]] — stop/flush ISR 与竞态。
- [[CP ringbuffer IPC 与 queue create 调试]] — IPC/ringbuffer 越界和可见性问题。
- [[面试用工作笔记总结]] — 上述问题的面试讲述视角。
