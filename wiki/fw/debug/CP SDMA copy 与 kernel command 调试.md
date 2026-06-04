---
type: topic
title: "CP SDMA copy 与 kernel command 调试"
created: 2026-05-09
updated: 2026-05-09
tags: [cp, sdma, kernel, debug, v9]
status: active
source:
  - "[[语雀工作笔记索引]]"
---

# CP SDMA copy 与 kernel command 调试

## 结论

2026-05 的 V9 SDMA copy 问题体现了一个典型调试框架：先确认 command packet 本身是否正确，再区分 UMD/KMD、host/device memory、SDMA 执行和版本差异。

## 关键事实

- 问题表现：UMD 的第一个 copy kernel cmd 出错；SDMA copy 后，host 和 device memory 上的 kernel cmd 对比失败。
- 特征点：第 202 个 index 对比未通过，前面 copy 正常。
- 版本相关：只在 V9 emu 上出现，其他 emu 没有复现。
- packet 检查：operator 确认为 SDMA，body 字段看起来没有明显异常。

## 调试顺序

1. 检查 UMD 组包和 packet header/body。
2. 检查 host/device memory 地址、size、对齐和边界。
3. 检查 SDMA 收到的 command 是否与 UMD 下发一致。
4. 比较 V9 与其他 emu 的差异。
5. 用 index 202 的稳定失败点反推 size、burst、边界或 cache/同步问题。

## 关联

- [[CP-Command-Packet]]
- [[iDMA]]
- [[CP 平台 bring-up 与 PCIe 调试]]
- [[面试用工作笔记总结]]
