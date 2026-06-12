---
type: index
title: "CP Master 索引"
created: 2026-05-14
updated: 2026-05-22
tags: [fw, cp-master, index]
status: active
---

# CP Master 索引

CP Master 负责把 Host/IMC 侧的 context、stream、MCQD 转换成 HCQD 绑定关系，让 CP User 能从 Interaction Buffer 执行命令。

## 阅读顺序

1. [CP Master 架构总览](<./overview.md>)
2. [IPC CMD 控制面](<./ipc_cmd.md>)
3. [QDMA 查询与入队](<./qdma.md>)
4. [BDMA 绑定与 HCQD 生命周期](<./bdma.md>)
5. [CP Master top_reg 寄存器封装](<./top_reg.md>)
6. [CP Master 与 CP User 交互](<./master-user-interaction.md>)

## 相关交叉入口

- [CP command processing flow](<../flows/CP command processing flow.md>)（含多队列/多上下文 HCQD-MCQD bring-up）
- [agc_shell CLI 输入输出路径与 cp master 卡顿分析](<../cli/agc_shell-cli-path.md>)