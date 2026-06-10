---
type: index
title: "FW Interconnect 索引"
created: 2026-05-25
updated: 2026-06-08
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

| [C2C transaction routing 与 OISA/L2 封装](<./c2c-transaction-routing-and-encapsulation.md>) | 详细解释 GPU/SDMA/TMA memory transaction 如何经过 NoC、AMT/top/mesh_router、portmap、C2C adapter、OISA MAC，并在 switch 模式下套 C2C L2 外壳。 |

| [C2C 子系统结构图拆解](<./c2c-macphy-wrapper-subsystem.md>) | 拆解用户提供的 MACPHY_WRAPPER / MACPHY_WRAPPER_X4 高分辨率结构图，补足 Adapter、LLRMAC、Hss112GX4Wrapper、x2/x4 port 和调试分层知识。 |
| [AXI5 协议详解与 C2C 中 AXI 的作用](<./axi5-protocol-and-c2c-role.md>) | 系统学习 AXI5 五通道、VALID/READY、burst、ID、atomic、AXI5 vs AXI4，并解释 AXI 在 C2C adapter/monitor/NoC 边界中的作用。 |


## 相关入口

- [FW 技术知识库](<../index.md>)
- [Wiki 总索引](<../../index.md>)
- [Hot Cache](<../../hot.md>)