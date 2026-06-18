---
type: topic
title: "硬件基础 RAM ROM Flash"
created: 2026-05-09
updated: 2026-05-09
tags: [hardware, ram, rom, flash, interview]
status: active
source:
  - "[[语雀工作笔记索引]]"
---

# 硬件基础 RAM ROM Flash

## 摘要

“工作笔记”中记录了一组硬件基础概念，可作为面试时解释 boot、firmware 和存储介质的背景材料。

## 核心概念

- RAM：随机访问存储器，断电丢失，访问速度快。
- DRAM：需要刷新，容量大、成本低。
- SRAM：触发器实现，速度快、成本高，常用于 cache。
- ROM：只读存储器，常用于 boot ROM、固件或固定程序。
- Mask ROM：出厂写入。
- PROM：一次写入。
- EPROM/EEPROM：可擦写类型。
- Flash：需要区分 NAND Flash 和 NOR Flash。

## 面试表达

这部分不应孤立背概念，而应和 CP loader、bootrom、firmware 加载、PCIe bring-up 结合表达：不同存储介质的访问方式、启动阶段职责和可修改性，决定了 bring-up 时哪些问题能通过软件更新修复，哪些需要平台或镜像调整。

## 关联

- [[CP 平台 bring-up 复盘合集]]
- [[面试用工作笔记总结]]
