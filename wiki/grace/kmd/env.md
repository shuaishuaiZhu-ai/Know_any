---
type: note
title: "KMD 服务器环境与构建"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - env
  - build
status: active
---

# KMD 服务器环境与构建

**关联**: [[wiki/grace/kmd/index|KMD 内核驱动知识库]] | [[wiki/grace/fw/env|FW 服务器环境]]

> kmd 的源码只在远端测试服务器上，本页给出访问、构建、加载所需的全部命令。**测试套件不在本知识库范围**，
> 这里只覆盖「把驱动编出来、装上去」。

---

## 服务器

| 项 | 值 |
|----|---|
| 地址 | `192.168.80.116` |
| 用户 | `shuaishuai.zhu` |
| 工作目录 | `~/ajthunk` → `/data3/shuaishuai.zhu/ajthunk` |
| Git 远程 | `git@192.168.90.119:aigc_toolchain/ajthunk.git`，默认分支 `main` |
| 内核驱动源码 | `~/ajthunk/kmd/aigc/`（入口层）、`~/ajthunk/kmd/aigc/kmdlib/`（可移植核心） |

读代码用 SSH + `sed -n`/`grep`；改代码用「读取 → 唯一匹配断言 → 替换 → `git diff` 确认」的 here-doc 流程。

## 两个半边：thunk 与 kmd

ajthunk 仓库有两半，改了哪半就编哪半：

- **thunk**（用户态库，`Ajthunk` 共享库）——给 UMD 调用的 `Thunk_*` C API。
- **kmd**（内核模块，`aigc.ko`）——本知识库的主题。

```bash
# 1) 装 thunk（默认 kmt 后端，给真硬件 / QEMU 用）
cd ~/ajthunk/thunk
sudo ./release.sh kmt /usr/local/aica

# 2) 编 kmd
cd ~/ajthunk/kmd
sudo make clean && sudo make -j        # 产物 kmd/aigc.ko

# 3) 加载（可带模块参数）
sudo rmmod aigc 2>/dev/null
sudo insmod kmd/aigc.ko cluster_num=4
```

一键安装：仓库根目录 `./kmd_install.sh`（装内核头、装 thunk、编 kmd、insmod 一条龙）。

## 编译期开关

`make FLAG=y` 传入，转成 `-D` 宏（详见 [[wiki/grace/kmd/memory/index|内存与页表]]）：

| 开关 | 作用 |
|---|---|
| `FALLBACK_ENABLE=y` | DPA 在目标 NUMA 节点 OOM 时回退到别的节点，而不是直接报错。 |
| `PARTIAL_GOOD=y` | 部分良die 场景；新增 `pg_offset`/`pg_size` 参数，把缺陷子区间预占，不再分出去。 |
| `SAME_PA=y` | 仅测试：让不同 ctx 的 VA 映射到同一 PA（别名测试）。 |

构建配置默认值（`kmd/aigc/cfg.mk`）：`PG_MODE ?= 2M`、`KMD_BACKEND ?= 1`（0=cmodel，1=emulator，2=chip）、`CC ?= gcc`。

## 常用模块参数（节选）

声明在 `aigc_drv.c`（`PARTIAL_GOOD` 的两个在 `os_interface.c`）：

| 参数 | 默认 | 含义 |
|---|---|---|
| `cluster_num` | 1 | cluster 数量（影响每 cluster 的显存池）。 |
| `interleave_gran` | 0 | UMA 交织粒度：0=512B,1=1KB,2=2KB,3=4KB。 |
| `tbu_hash_mode` | 0 | TBU 地址哈希模式 0..3。 |
| `cluster_hash_en` | 0 | 是否开 cluster 哈希。 |
| `fw_boot_stage` | 0 | 固件更新引导模式（HAL bring-up 停在 IMC+CP）。 |

> 提示：构建/VCS 忽略的产物（`*.ko`/`*.o`/`*.mod`/`kmd/build/*` 等）不要手改、不算改动的一部分。

## 延伸

- [[wiki/grace/kmd/index|KMD 内核驱动知识库]]
- [[wiki/grace/kmd/hal/index|Grace HAL]]：`KMD_BACKEND` 怎么选硬件路径。
- [[wiki/grace/kmd/memory/index|内存与页表]]：`interleave_gran`/`PG_MODE` 怎么影响页表。
