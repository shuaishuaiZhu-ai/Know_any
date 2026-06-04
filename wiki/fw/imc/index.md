---
type: index
title: "IMC 索引"
created: 2026-05-19
updated: 2026-06-02
tags:
  - fw
  - imc
  - index
status: active
---

# IMC 索引

IMC 相关页面统一放在这里。阅读时先看启动链路，再看 IPC 和 CLI 交互。

## 推荐阅读

1. [IMC 启动到 main 流程](<./startup-to-main.md>)：从 `_start`、RT-Thread startup、board init 到 `main()` 和 IPC 服务建立。
2. [agc_shell CLI 输入输出路径与 cp master 卡顿分析](<../cli/agc_shell-cli-path.md>)：理解 IMC/CP CLI 的 UART、shell 线程和 RT-Thread 调度路径。
3. [RT-Thread rt_thread_yield 实现与使用风险](<../rt-thread/rt_thread_yield.md>)：补齐 scheduler、yield、delay 的行为基础。

## 核心源码入口

| 主题 | 远端源码路径 |
|---|---|
| 链接入口和内存布局 | `/home/shuaishuai.zhu/fw/aigc_sdk/grace/board/imc/linker_scripts/link.lds` |
| 汇编启动 | `/home/shuaishuai.zhu/fw/aigc_sdk/grace/board/lib/start.S` |
| RT-Thread entry/startup | `/home/shuaishuai.zhu/fw/rtthread/src/components.c` |
| IMC board init | `/home/shuaishuai.zhu/fw/aigc_sdk/grace/board/imc/src/board.c` |
| C main | `/home/shuaishuai.zhu/fw/aigc_sdk/grace/applications/sys/main.c` |
| IPC message | `/home/shuaishuai.zhu/fw/aigc_sdk/grace/applications/ipc/ipc_msg.c` |
| IMC IPC command | `/home/shuaishuai.zhu/fw/aigc_sdk/grace/applications/imc/ipc_cmd/ipc_cmd.c` |
| AGC shell | `/home/shuaishuai.zhu/fw/test/framework/shell/agc_shell.c` |

## 当前结论

- IMC 不是从 C `main()` 直接启动，而是 `_start -> entry -> rtthread_startup -> scheduler -> main_thread_entry -> main()`。
- `rt_hw_board_init()` 在 scheduler 启动前完成 UART、console、heap、driver 和 shell 线程对象创建。
- `main()` 当前只调用 `rt_hw_board_pos_init()`，IMC 的 IPC message 线程和 IPC command 中断注册在这里建立。
- Host/CP Master 到 IMC 的 IPC 中断只做轻量唤醒，真正命令处理在线程上下文中完成。
