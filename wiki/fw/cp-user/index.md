---
type: index
title: "CP User 索引"
created: 2026-05-14
updated: 2026-05-22
tags: [fw, cp-user, index]
status: active
---

# CP User 索引

CP User 负责真正执行命令包，核心是 `cmd_entry`、Interaction Buffer、stop/flush、pending 状态和 iDMA fast path。

## 阅读顺序

1. [cmd_entry — CP User 调度器](<./cmd_entry.md>)（含 Candidate V7 设计要点）
2. [CP User Interaction Buffer](<./ib.md>)
3. [CP stop flush 与 queue 切换](<./CP stop flush 与 queue 切换.md>)（含 queue scheduling 调度优先级视角）
4. [cmd_entry branch layout](<./cmd_entry-branch-layout.md>)

## 相关交叉入口

- [CP cmd_entry 热路径与分支布局优化](<../performance/CP cmd_entry 热路径与分支布局优化.md>)
- [CP command processing flow](<../flows/CP command processing flow.md>)（含 event/atomic/wait_host 处理）
- [Interaction Buffer](<../concepts/Interaction-Buffer.md>)
- [iDMA](<../concepts/iDMA.md>)