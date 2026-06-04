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

1. [cmd_entry — CP User 调度器](<./cmd_entry.md>)
2. [CP User Interaction Buffer](<./ib.md>)
3. [CP cmd_entry Candidate V7 调度设计](<./CP cmd_entry Candidate V7 调度设计.md>)
4. [CP stop flush 与 queue 切换](<./CP stop flush 与 queue 切换.md>)
5. [CP queue scheduling stop flush](<./CP queue scheduling stop flush.md>)
6. [cmd_entry branch layout](<./cmd_entry-branch-layout.md>)

## 相关交叉入口

- [CP candidate peek 热路径优化](<../performance/CP candidate peek 热路径优化.md>)
- [CP 分支预取与 cmd_entry 布局优化](<../performance/CP 分支预取与 cmd_entry 布局优化.md>)
- [CP event atomic wait host handling](<../flows/CP event atomic wait host handling.md>)
- [Interaction Buffer](<../concepts/Interaction-Buffer.md>)
- [iDMA](<../concepts/iDMA.md>)