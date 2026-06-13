---
type: index
title: "KMD OS 抽象层"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - os
  - index
status: active
---

# KMD OS 抽象层

> kmdlib 核心要「OS 无关」，靠的就是这一层缝隙：`os_interface.c` 是唯一 `#include <linux/...>` 的文件，
> 把所有内核调用收口成 `os_*` 包装；conftest 则负责跨内核版本的兼容探测。

## 本区页面

- [[os_interface]]：OS 抽象缝隙的职责 + NVIDIA 式 conftest。

## 延伸

- [[wiki/kmd/arch/layered-architecture]]：为什么要这条缝隙。
- [[wiki/kmd/index|KMD 内核驱动知识库]]
