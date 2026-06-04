---
type: topic
title: "aigc_sdk Bug 扫描与修复优先级"
created: 2026-05-09
updated: 2026-05-09
tags:
  - fw
  - bug-scan
  - review
status: active
---

# aigc_sdk Bug 扫描与修复优先级

本主题整合 igc_sdk_bug_report.md 与 igc_sdk_check_report.md。两份报告都不是最终修复证明，而是风险清单和排查入口。

## 高优先级模式

- 缺少 return 或未覆盖返回路径：会造成未定义行为，优先确认函数签名和调用方依赖。
- 未初始化变量：典型位置包括 ISR、IPC、boot_info、event_info 等硬件/消息路径。
- malloc/rt_malloc 返回值未检查：release 模式下 RT_ASSERT 不一定保护运行时。
- 无超时等待：寄存器轮询、IRQ full、wait_host 类路径都可能导致永久阻塞。
- 边界检查错误：handler register、ringbuffer length 等要重点看数组上限和 wrap 逻辑。

## 与现有图谱关系

- [[CP event atomic wait host handling]]：无超时等待和 wait_host 风险。
- [[CP stop flush 与 queue 切换]]：stop/flush ISR 与竞态。
- [[CP ringbuffer IPC 与 queue create 调试]]：IPC/ringbuffer 越界和可见性问题。

## 来源

- **aigc_sdk Bug 扫描报告** — `.raw/local-md/C-home-shuaishuai.zhu/fw\aigc_sdk_bug_report.md`
- **aigc_sdk 代码检查报告** — `.raw/local-md/C-home-shuaishuai.zhu/fw\aigc_sdk_check_report.md`