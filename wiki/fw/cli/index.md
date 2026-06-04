---
type: index
title: "CLI 索引"
created: 2026-05-14
updated: 2026-06-04
tags: [fw, cli, agc-shell, index]
status: active
---

# CLI 索引

CLI 相关页面统一放在这里，不再归到 CP Master 目录下面。因为 CLI 卡顿问题同时涉及 UART、agc_shell、RT-Thread 调度、CP Master 后台线程和 console 输出路径。

## 当前页面

- [agc_shell CLI 输入输出路径与 cp master 卡顿分析](<./agc_shell-cli-path.md>)：包含输入 ringbuffer、Backspace/Delete 行编辑、`this_line` 字符串维护、argv 组装和 CLI 卡顿路径。：包含输入 ringbuffer、Backspace/Delete 行编辑、`this_line` 字符串维护、argv 组装和 CLI 卡顿路径。
- [Grace USART、RT-Thread console 与 agc_shell 完整链路](<./grace-usart-console-cli.md>)：USART 硬件、driver、RT-Thread device、console、shell 输入中断和本地 ringbuffer 的完整说明，包含按图解 skill 生成的 SVG/PNG 图解。

## 必须记住的路径

```text
UART interrupt
  -> rx_indicate
  -> rt_sem_release
  -> rt_schedule
  -> agc_shell parse 1 char
  -> rt_kprintf echo/write
```

## USART 速查

- 地址映射、初始化职责、device/console/shell 链路、SVG/PNG 图解：[Grace USART、RT-Thread console 与 agc_shell 完整链路](<./grace-usart-console-cli.md>)
- CLI 输入输出体感问题、删除键处理、当前行 buffer 维护：[agc_shell CLI 输入输出路径与 cp master 卡顿分析](<./agc_shell-cli-path.md>)
- IPC/CLI ringbuffer 区分：[CP ringbuffer IPC 与 queue create 调试](<../debug/CP ringbuffer IPC 与 queue create 调试.md>)

## 相关入口

- [RT-Thread rt_thread_yield 实现与使用风险](<../rt-thread/rt_thread_yield.md>)
- [CP Master 索引](<../cp-master/index.md>)
- [FW 调试索引](<../debug/index.md>)
