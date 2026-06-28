---
type: note
title: "UMD 开发维护：访问、代码结构与构建"
created: 2026-06-28
updated: 2026-06-28
tags:
  - grace
  - umd
  - dev
  - access
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/aigc-driver（源码确认 2026-06-28）"
---

# UMD 开发维护：访问、代码结构与构建

本页面向 **aigc-driver（UMD / CLR）的日常开发维护**：怎么连上 80.116、源码在哪、目录结构、怎么编译跑单测。
架构原理（ROCm 血缘、直发 doorbell、API→底层动作）见 [[wiki/grace/umd/index|UMD 用户态运行时（aigc-driver）]]，本页不重复。

## 1. 如何访问 80.116 上的 aigc-driver 代码

代码**不在任何本地 checkout**，在远程主机上，通过 SSH 操作。

| 项 | 值 |
|---|---|
| 主机 | `192.168.80.116`（“80.116”） |
| 账号 | `shuaishuai.zhu` |
| 源码路径 | `~/aigc-driver`（`/home/shuaishuai.zhu/aigc-driver`） |
| 登录密码 | 见 [[wiki/ai/secrets/server-passwords|Server Passwords]] “Grace/FW/KMD remote”一行；**不要回显到对话、不要提交到 GitHub 版本** |

```bash
sshpass -p '<password-from-secrets-page>' ssh shuaishuai.zhu@192.168.80.116
cd ~/aigc-driver
```

> ⚠️ 同一台 80.116 上还有 `fw/`（CP 固件）、`aigc-kmd-modular`、`tiny_kmd` 等；本任务只负责 `~/aigc-driver`（UMD）。

### Git（远端仓库）

- origin：`git@192.168.90.119:aigc_toolchain/aigc-driver.git`（GitLab 在 90.119）
- 分支：`develop`（默认开发分支）/ `main` / `dev_func` / `blocking_dev` / `emu_dev`
- 子模块：`3rdparty/ajthunk` ← `http://192.168.90.119:8080/aigc_toolchain/ajthunk.git`（thunk 层，多为空/闭源）

## 2. 代码结构

CLR（Compute Language Runtime）= GraceC GPGPU 的 UMD，编出 `libaicart.so`。

```text
aigc-driver/
├── build_ex.sh            # 统一构建脚本（CMake + ajthunk + 单测，见第 3 节）
├── CMakeLists.txt
├── README.md              # CLR Repo Readme（构建/日志/覆盖率说明）
├── include/               # 对外发布头文件（libaicart 的 API 面）
│   ├── aica_runtime_api.h   aica_driver_api.h   aica_test_api.h
│   ├── aica_packet_def.h    # aica_kernel_dispatch_packet_t，AICA_PACKET_TYPE_KERNEL_DISPATCH=0x10
│   ├── driver_types.h       aica_types.hpp      icd_structs.h ...
├── src/                   # CLR 源码
│   ├── aica_runtime.cpp     # aica* 运行时 API 入口（launch / stream / 配置）
│   ├── aica_platform.cpp    # 平台状态、fatbin 注册、设备初始化
│   ├── aica_memory.cpp      # 显存分配 / aicaMemcpy / 拷贝命令
│   ├── aica_device.cpp  aica_stream.cpp  aica_event.cpp  aica_module.cpp
│   ├── aica_graph.cpp   aica_context.cpp aica_mempool*.cpp aica_fatbin.cpp ...
│   ├── device/grace/        # GraceC 芯片后端
│   │   ├── gracevirtualgpu.cpp  # kernel 直发核心：dispatchCommandPacket→sendPacket→敲 doorbell
│   │   ├── gracedevice/kernel/program/signal/printf/settings/appprofile.*
│   ├── platform/            # HSA 式平台层：agent / commandqueue / command / signal /
│   │                        #   kernel / memory / topology / blit_kernel / thunk_manager / aigc_queue
│   ├── elf/                 # ELF / code object 装载（elfio）
│   ├── rtc/                 # 运行时编译（COMGR helper）
│   ├── os/                  # POSIX 抽象（alloc / os_posix）
│   ├── thread/              # thread / monitor / semaphore
│   └── utils/               # config / options（OPTIONS.def）/ debug / timer / yaml
├── kernel_module/         # aigcic gpgpu 驱动相关代码
├── multimedia/            # video runtime 源码
├── python/                # CLR 对外 Python 接口
├── tools/                 # aica_profiler.py 等
├── unitest/               # 分类单测
│   ├── 01test_runtime_api    02test_basic_function   03test_operators
│   ├── 04test_cudalike_feature 05test_stress  06test_elf  07test_multidev  utils
├── ci/                    # GitLab CI 脚本与用例 list（ci_compiler_cases_*.list 等）
├── cmake/                 # AICAclr.cmake / FindYaml.cmake / config.cmake / aicart
├── 3rdparty/ajthunk/      # thunk 子模块（用户态→内核态，封装 ioctl；多为空/闭源）
└── output/                # 对外发布产物：include / lib / tools / haps_env.sh / unitest 产物
```

## 3. 构建与测试

入口 `build_ex.sh`（在 `~/aigc-driver` 下执行）：

```bash
bash build_ex.sh -cb            # clean build（Debug，完整重建 .so）
bash build_ex.sh -br            # build release
bash build_ex.sh -bt xx.cu      # 只编指定单测，如 -bt sub_i32.cu（产物在 output/unitest/sub_i32.out）
bash build_ex.sh -rt            # 运行单测
bash build_ex.sh -ut            # 更新 ajthunk 子模块
bash build_ex.sh -cf            # clang-format（提交前）
bash build_ex.sh -cc -rg        # 代码覆盖率 .so + gcovr 统计
bash build_ex.sh -i             # install UMD 组件
bash build_ex.sh -h             # 完整参数
```

跑单个测试例：

```bash
AICA_LOG_LEVEL=5 ./output/unitest/test_saxpy_op.out
# CModel：先 export LD_LIBRARY_PATH=/usr/local/aica/lib:$LD_LIBRARY_PATH
```

- 日志：`AICA_LOG_LEVEL`（0–5）+ `AICA_LOG_MASK`（按模块位掩码，如 `LOG_API=0x1`/`LOG_AQL=0x8`，按位或；枚举见源码 `LogMask`）。
- 依赖：`libyaml`（`libyaml-dev` / `libyaml-devel`）。
- 开发容器：`umd_dev_workspace:latest`。HAPS 受限内存先 `source ./output/haps_env.sh`。

## 延伸

- [[wiki/grace/umd/index|UMD 用户态运行时（aigc-driver）]]（架构 / ROCm 血缘 / API→底层动作 / 源码地图）
- [[saxpy-kernel-end-to-end|Kernel 端到端全流程长文]]（以 `add1` 贯穿 UMD→KMD→CP）
- [[wiki/grace/kmd/index|KMD 内核驱动知识库]] · [[wiki/grace/fw/index|FW 技术知识库]]
- [[wiki/ai/secrets/server-passwords|Server Passwords]]（80.116 / 90.119 登录信息）
