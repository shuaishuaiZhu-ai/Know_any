---
type: index
title: "FW 调试索引"
created: 2026-05-14
updated: 2026-06-18
tags: [fw, debug, index]
status: active
---

# FW 调试索引

这里放问题排查、bring-up、bug scan、调试经验。

- [CP 平台 bring-up 复盘合集](<./CP 平台 bring-up 复盘合集.md>)：合并原 SDMA copy / PCIe bring-up / aigc_sdk Bug 扫描三篇，按时间线串起 V9 SDMA copy、PCIe/KO 加载、静态扫描风险模式（含待补证据标注）。
- [CP ringbuffer IPC 与 queue create 调试](<./CP ringbuffer IPC 与 queue create 调试.md>)：IPC shared RB、CLI 本地 RB、`is_ipc_rb` 地址转换、IPC 发送/接收和 queue create 调试流程，已生成 SVG/PNG 图解。
- [Git fetch known_hosts 与 Docker 共享 SSH 排查](<./Git fetch known_hosts 与 Docker 共享 SSH 排查.md>)：`git fetch` 报 `known_hosts: Permission denied` 的根因——`claude-code` 容器以 root 共享 `~/.ssh`，把 `known_hosts` 属主写成 root；宿主改用独立 `known_hosts.local` + 仓库级 `core.sshCommand`，容器不受影响。

## 相关入口

- [FW 流程索引](<../flows/index.md>)
- [FW 概念索引](<../concepts/index.md>)