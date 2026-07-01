---
type: entity
title: "NVLink"
created: 2026-06-30
updated: 2026-06-30
tags: [ai-infra, gpu, interconnect, concept]
status: active
source:
  - "知乎专栏第106篇｜https://zhuanlan.zhihu.com/p/1987297824543627187"
---

# NVLink

> NVIDIA 的高速 GPU 互联协议，带宽远超 PCIe（NVLink >600GB/s vs PCIe ~64GB/s）。是主机内多卡高速通信的物理基础，[[Ring-AllReduce]] 等拓扑算法的"快车道"。

## 与 PCIe 对比
- **带宽层次**：NVLink（片间） >> PCIe Switch >> QPI/UPI（CPU 间）。
- **用途**：主机内 8 卡组环（Ring），承载高带宽集合通信。

**给应届生**：为什么不用 PCIe 连 8 卡？PCIe 带宽不够，AllReduce 梯度传不动。NVLink 是 NVIDIA 专门给 GPU 之间设计的高速公路，带宽是 PCIe 的近 10 倍。集合通信库（NCCL）会优先用 NVLink 走主机内环。

## 变体
- **NVLink-C2C**：下沉到芯片/裸片级（Chiplet），支撑 Grace Hopper 超级芯片。见 [[NVLink-C2C与GPU统一内存]]。
- **MNNVL**：跨物理节点的 NVLink Fabric。

## 详见
- [[NVLink-C2C与GPU统一内存]] — C2C 与 UVA/UVM
- [[训练拓扑与服务框架]] — NVLink 组 Ring 拓扑
- [[Fabric-Manager与NVLink]] — NVLink/NVSwitch 管理
