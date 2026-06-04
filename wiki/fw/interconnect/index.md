---
type: index
title: "FW Interconnect 索引"
created: 2026-05-25
updated: 2026-06-02
tags:
  - fw
  - interconnect
  - index
status: active
---

# FW Interconnect 索引

这里收 FW 视角的芯片互联、GPU-to-GPU 互联、C2C、D2D、PCIe/HWJ 对比、topology discovery、route table、loopback 和 RAS 学习资料。

## 当前页面

| 页面 | 适合解决的问题 |
|---|---|
| [C2C 互联学习文档](<./c2c-dingtalk-study.md>) | 从 DingTalk 10.C2C 文档学习 LD/ST 互联、AMT route、FW/KMD 分工、topo discovery、MSS/SerDes、loopback/RAS，并查看源图元素裁图。 |
| [C2C PHY 近端环回与远端环回详解](<./c2c-loopback-near-far.md>) | 解释 NEP/NES/NES-ext/FEP/FES/FEP-err 与 Top/Adapter/LLRMAC 环回的层级区别、测试场景和调试选择顺序。 |
| [Portmap 路由表数字图解](<./portmap-routing-table.md>) | 解释 C2C/D2D portmap 表项里的 `00000011`、`00110000`、`0/1` 是如何由拓扑、下一跳策略、serdes/ucie 编码得到的。 |

## 相关入口

- [FW 技术知识库](<../index.md>)
- [Wiki 总索引](<../../index.md>)
- [Hot Cache](<../../hot.md>)