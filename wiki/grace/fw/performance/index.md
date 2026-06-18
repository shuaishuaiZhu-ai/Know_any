---
type: index
title: "FW 性能索引"
created: 2026-05-14
updated: 2026-05-22
tags: [fw, performance, index]
status: active
---

# FW 性能索引

这里放 hot path、分支布局、cache、预取、调度开销相关页面。

- [CP cmd_entry 热路径与分支布局优化](<./CP cmd_entry 热路径与分支布局优化.md>)：candidate peek hot loop + 分支预取/wrong-path fetch + goto 布局。
- [GPGPU FW DVFS 学习文档](<./dvfs-gpgpu-fw.md>)：OPP/VF 频点、状态机、timing、面试问题。

## 相关入口

- [cmd_entry — CP User 调度器](<../cp-user/cmd_entry.md>)
- [cmd_entry branch layout](<../cp-user/cmd_entry-branch-layout.md>)
- [agc_shell CLI 输入输出路径与 cp master 卡顿分析](<../cli/agc_shell-cli-path.md>)