---
type: note
title: "tiny-kmd 环境与构建"
created: 2026-06-13
updated: 2026-06-13
tags:
  - tiny-kmd
  - env
  - build
status: active
---

# tiny-kmd 环境与构建

**关联**: [[wiki/grace/tiny-kmd/index|tiny-kmd 知识库]] | [[wiki/grace/kmd/env|ajthunk KMD 环境]]

## 仓库与路径

| 项 | 值 |
|----|---|
| 远端路径 | `/data3/shuaishuai.zhu/tiny_kmd`（服务器 `192.168.80.116`，用户 `shuaishuai.zhu`） |
| Git 远程 | `git@192.168.90.119:fw/tiny_kmd.git`（GitLab，与 fw 同组） |
| 分支 | `dev`（另有 `main`） |
| 源码目录 | `tinykmd/`（9 个 `.c` + 10 个 `.h`，约 2600 行） |
| 产物 | `aigc.ko`（misc 设备 `/dev/aigc`） |

## 构建

`tinykmd/Makefile`（标准 out-of-tree 内核模块）：

```bash
cd /data3/shuaishuai.zhu/tiny_kmd/tinykmd
make          # = make ARCH=x86 -C /lib/modules/$(uname -r)/build M=$(pwd) modules
make clean
```

`obj-m += aigc.o`，对象列表：`aigc_drv` `aigc_device` `aigc_ipc` `aigc_ringbuffer` `aigc_irq` `aigc_misc`
`subscribe_list` `aigc_pcie_atu` `aigc_passive_boot`（`Makefile:10`）。

## PCI 身份

`aigc_drv.h:9`：`AIGC_VENDOR_ID=0x20da`、`AIGC_DEVICE_ID=0x0100`（对应 ajthunk 的 EMU/Grace 变体 `0x20da`）。

## 延伸

- [[wiki/grace/tiny-kmd/architecture]]
- [[wiki/grace/kmd/env|ajthunk KMD 环境]]：移植目标侧（ajthunk）的构建。
