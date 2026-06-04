---
type: note
title: "服务器环境 & 构建"
created: 2026-05-09
updated: 2026-05-09
tags:
  - fw
  - env
  - build
status: active
last_verified: 2026-05-07
---

# 服务器环境 & 构建

**关联**: [[wiki/fw/index|FW 技术知识库]]

---

## 服务器

| 项 | 值 |
|----|---|
| 地址 | `192.168.80.116` |
| 用户 | `shuaishuai.zhu` |
| SSH Key | `~/.ssh/id_ed25519` |
| 工作目录 | `/home/shuaishuai.zhu/` |

## 项目路径

| 项目 | 路径 |
|------|------|
| fw（CP User 固件） | `/home/shuaishuai.zhu/fw/` |
| CP User 核心源码 | `fw/aigc_sdk/grace/applications/cp/user/` |
| CP Master 源码 | `fw/aigc_sdk/grace/applications/cp/master/` |
| 内核驱动 | `/home/shuaishuai.zhu/ajthunk/kmd/aigc/` |
| 打包工具 | `/home/shuaishuai.zhu/image_tool/grace/` |

## 构建命令

```bash
./gpu_fw_build.sh -p grace -b debug -f cp_user -t gcc -l backdoor -m 3d-dram -d 1-die
```

## 文件访问规则

- **读**：SSH + cat/sed/grep（`C:\home\shuaishuai.zhu\*` 网络映射不稳定）
- **写**：Write 工具写本地 Temp → SCP 传输（SSH heredoc 遇 C 代码单引号报 unexpected EOF）

```bash
# 读
ssh 192.168.80.116 "cat -n /home/shuaishuai.zhu/fw/<path>"

# 写
scp /c/Users/18355/AppData/Local/Temp/<file> \
    192.168.80.116:/home/shuaishuai.zhu/fw/<target>
```

## understand-anything 产物

位置：`/home/shuaishuai.zhu/fw/.understand-anything/`

| 文件 | 说明 |
|------|------|
| `knowledge-graph.json` | 知识图（1 MB，708 文件） |
| `fingerprints.json` | 文件指纹（增量扫描用） |
| `meta.json` | 扫描元信息（时间、commit、文件数） |

上次扫描：2026-05-07，commit `c333676`，**CP Master 未单独成 layer**（在 aigc-sdk-platform 内）。
