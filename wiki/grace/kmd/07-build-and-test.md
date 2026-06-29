---
type: note
title: "07 构建与测试"
created: 2026-06-13
updated: 2026-06-29
tags:
  - kmd
  - build
  - test
  - ci
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd"
---

# 07 构建与测试

> **这章解决什么问题**：怎么把 `aigc.ko` 编出来（含 NVIDIA 式 conftest）、有哪些编译开关和模块参数、怎么用
> 用户态测试套和 CI 矩阵跑测试、有哪些独立工具，以及 GitLab 上端到端 CI 是怎么在 QEMU 里跑通的。这章把
> 「源码」和「能跑起来」连上。涉及 `kmd/Makefile`、`aigc.Kbuild`、`kernel_test.sh`、`kmd/test/*`、
> `kmd/scripts/kmd_test.sh`、`.gitlab-ci.yml` 等（旧 `env.md` 的内容并入此章）。

## 构建

### 快速上手
```sh
cd kmd && make FALLBACK_ENABLE=y -j      # 在 kmd/ 产出 aigc.ko
sudo ./kmd_install.sh                    # 一键：装头文件、编 thunk+kmd、insmod
# 或手动：
sudo insmod kmd/aigc.ko cluster_num=4
```
构建成功会把 `aigc.ko` 复制到 `kmd/` 目录。

### Makefile 分层
- **`kmd/Makefile`**：薄包装。`all: kmd` 递归进 `aigc/`，并把三个 `y`-flag 翻成 `EXTRA_CFLAGS` 宏：
  `-DFALLBACK_ENABLE=1`、`-DPARTIAL_GOOD=1`、`-DSAME_PA=1`。
- **`kmd/aigc/Makefile`**：真正的树外 kbuild Makefile（两趟）。定位内核构建目录（`KERNELDIR`，否则
  `/lib/modules/$(uname -r)/build`），用 `-C $(KERNEL_SOURCES) M=$(CURDIR)` 调内核 kbuild；成功后删掉生成的
  `kerneltest/` 并把 `aigc.ko` 复制到 `kmd/`。
- **`kmd/aigc/Kbuild`**：公共编译 flag（include 路径、`-Wall -g -Wno-error -fno-strict-aliasing
  -fno-stack-protector`，x86_64 上 `-mno-red-zone -mcmodel=kernel`）+ conftest 管线；include `aigc.Kbuild`。
- **`kmd/aigc/aigc.Kbuild`**：`obj-m += aigc.o`；`aigc-y` 列开放 C 对象（`aigc_drv.c`、`aigc_ioctl.c`、
  `os_interface.c`、kmdlib 核心 …）**外加预编译二进制 blob `aigc_kernel.o`**（封闭 GPU「kernel」对象）；注册所有
  conftest 特性测试并让每个对象依赖生成的 conftest 头。
- **`kmd/aigc/cfg.mk`**：默认值 `PG_MODE ?= 2M`（GPU 页表页粒度，64M/2M/64K/4K 之一）、`MEM_CHECK ?= 0`、
  `KMD_BACKEND ?= 1`（0=cmodel, 1=emulator, 2=chip）、`CC ?= gcc`。
- **`kmd/aigc/version.mk`**：生成 `version.h`（git HEAD SHA + `AIGC_DRV_VERSION "0.0.1"`）。

### conftest（`kmd/aigc/kernel_test.sh`）
这是让驱动跨内核版本可移植的 NVIDIA 式 **conftest**，由 `aigc.Kbuild` 调用。第 5 个位置参数选命令
（`build_cflags`、`compile_tests`、`test_kernel_headers` …）。每个 `compile_test` 用一小段代码片对目标内核
**编译探测**，发出 `#define AIGC_<FEATURE>_PRESENT`（或 `#undef`），结果汇进 `kerneltest/` 下的生成头
（`headers.h`、`functions.h`、`symbols.h`、`types.h` …），umbrella `kerneltest.h` 把它们 include 进来，C 源
就能对「实际存在的内核 API」编译。构建后 `kerneltest/` 被删除。
> 👉 如果某次构建莫名「看不见」某内核符号，先怀疑 conftest 头过期/缺失，而不是 C 代码写错。

### 安装脚本
- **`kmd_install.sh`**（仓库根）：全量 provisioning——确保装了 `linux-headers-$(uname -r)`、编用户态 thunk
  （`thunk/release.sh kmt /usr/local/aica`）、`cd kmd && make clean && make -j`、最后 `rmmod aigc; insmod`。
- **`kmd/install.sh`**：把 `aigc.ko` 复制进 `/lib/modules/.../kernel/drivers/`，`depmod -a`，并经
  `/etc/modules-load.d/aigc.conf` 注册自动加载。

## 编译期开关
都是 `make FLAG=y` 形式、翻成 `-D` 宏：

| 开关 | 作用 |
|---|---|
| `FALLBACK_ENABLE` | 请求的 NUMA 节点 DPA 分配 OOM 时回退到另一节点；不开则直接报 OOM。 |
| `PARTIAL_GOOD` | 「部分良品」（部分缺陷 die）支持。在 `os_interface.c` 声明 `pg_offset`/`pg_size` 参数，并在 `os_devm_gen_pool_create` 把缺陷子区间预标为已分配，永不发出。 |
| `SAME_PA` | 测试场景：两个不同上下文的 VA 映到同一物理地址（用于别名测试），在 `aigc_mem_handle.c`。 |

## 模块参数
声明在 `kmd/aigc/aigc_drv.c`（`PARTIAL_GOOD` 专属两个在 `os_interface.c`）：

| 参数 | 类型 | 默认 | 含义 |
|---|---|---|---|
| `interleave_gran` | ulong | 0 | UMA 交织粒度：0=512B, 1=1KB, 2=2KB, 3=4KB。 |
| `tbu_hash_mode` | ulong | 0 | TBU 哈希模式（0..3）。 |
| `cluster_hash_en` | int | 0 | 启用 cluster 哈希（0/1）。 |
| `enable_l2_flush` | int | 0 | 启用 L2 flush（0/1）。 |
| `enable_tsv_int` | int | 1 | 启用 TSV 中断（0/1）。 |
| `cluster_num` | int | 1 | cluster 数量（README 示例用 4）。 |
| `db_per_cluster_mem_size` | int | 0 | 每-cluster doorbell 内存大小（GB）。 |
| `test_va_hint` | ulong | 0 | 设备-VA mmap 的 hint 地址（PL0 边界测试）。 |
| `fw_boot_stage` | int | 0 | boot 阶段固件更新模式（置位时 HAL bring-up 在 IMC+CP 后停）。 |
| `assign_gpu_id` | int | 0 | 在 kmd 里指派 GPU id。 |
| `pg_offset` / `pg_size` | ulong | — | 仅 `PARTIAL_GOOD`：缺陷区相对 `numa[i].start` 的偏移/大小。 |

## 测试

### 用户态测试套（`kmd/test/kmd_test.c`）
由 `kmd/test/Makefile`（纯 gcc）编成 `test`，链接已安装的 Ajthunk 库，`INV_SZ` 默认 512。它驱动
`/dev/aigc<minor>`（minor 取自 `AIGC_MINOR` 环境变量，默认 0）。
```sh
make -C kmd/test                  # 编出 ./test（和 fw_update_tool）
./test                            # 无参 → 打印用例列表
AIGC_MINOR=0 ./test saxpy_test    # 跑一个或多个具名用例
```
派发是一张表 `struct ktest_case { char name[200]; entry_func_t run_test; }`（`case_list[]`），`main()` 按名匹配。
用例覆盖：上下文/队列/事件生命周期、内存拷贝与 DMA（`mem_copy_*`/`mem_dma_*`/`pmem_*`）、页表套（`pgt_*`）、
UMA/哈希（`mem_uma_2m_test`/`mem_uma_4k_test`/`cluster_hash_en_test`）、错误/权限、计算（`saxpy_test`/
`saxpy_test_multi_card`）、IPC/P2P、partial-good/same-PA、PCIe、压力/泄漏。

### CI 矩阵运行器（`kmd/scripts/kmd_test.sh`）
`kmd_test.sh -i [all|case_name] -l [loop]`（默认 all、loop 1）是矩阵运行器。它的 `case_list[]` 每个元素用一个
编码串描述这条用例的构建/加载/测试构建参数：
```
case_name:BUILD@LOAD#TESTBUILD
```
- **`case_name`**（`:` 前）：要跑的 `./test` 用例。
- **`BUILD`**（`:`–`@`）：模块构建参数 `make $BUILD -j`（如 `PG_MODE=4K`）。
- **`LOAD`**（`@`–`#`）：`insmod` 参数 `rmmod aigc; insmod aigc.ko $LOAD`（如 `interleave_gran=1`）。
- **`TESTBUILD`**（`#` 后）：测试套构建参数 `make FALLBACK_ENABLE=y $TESTBUILD`（如 `INV_SZ=1024`）。
用 `awk -F` 按 `:`/`@`/`#` 解析，任意字段可空。例：
```
mem_copy_test_4K_mode:PG_MODE=4K
mem_uma_2m_test:PG_MODE=2M@interleave_gran=1#INV_SZ=1024
cluster_hash_en_test:@cluster_hash_en=1
```
`case_list` 是**经筛选/启用**的集合（注释掉的行是已知 flaky/停用）。

### 独立工具（`kmd/aigc/tool/`）
- **`kmd-reg`**：用户态 PCI 寄存器读写（mmap BAR / 读 config 空间）。`./kmd-reg <BDF> <resourceX|config> <r|w> <offset_hex> [len|value]`。
- **`memrw_tool`**：驱动 `aigc_debug` 的 `memrw_read`/`memrw_write` sysfs 命令；按 GPU VA 自动探 VMID。
- **`kmd_dump_ringbuf`**：mmap `/dev/aigcN` 的调试区，从 base 走到 wptr 解每个活跃队列的命令环，把 0x80 字节命令包
  （Submit_JD、SDMA、原子、事件 signal/wait、NOP、Wait_Host）解码进 `ringbuf_debug_log.txt`。

## 端到端 CI（`.gitlab-ci.yml`）
单阶段 `KMD-QEMU-MAIN`、单 job `kmd_qemu_main`（tag `kmd-cli`，8h 超时，`allow_failure: false`），**只在
target 为 `main` 的 merge request 上触发**，跑一次「SoC 仿真器在环」的完整测试：
1. 杀掉占用 SSH host-forward 端口（2368）的残留 QEMU。
2. 克隆 **`virtual_platform`** SoC 仿真器，编译、配置（`soc_config.py 1 2`）、启动。
3. 编 QEMU host 侧并启 **QEMU**（q35 + KVM，启 Ubuntu 22.04 云镜像），经 `remote-port-aigc-device` 挂两块仿真
   AIGC GPU，连到 virtual_platform 的机器 socket，SSH 转发到 2368。
4. SSH 进 guest：装 aigcgpu 编译器到 `/usr/local/aica`；克隆 `ajthunk`、合 MR 源分支（冲突即 abort）、编 thunk；
   在 `kmd/` 装头文件、`make FALLBACK_ENABLE=y -j -s`、重载模块；跑测试矩阵 `kmd/scripts/kmd_test.sh`；再编跑
   独立的 `aigc-driver` 测试套；最后 `poweroff`。
5. 捕获 guest 内退出码、杀残留 QEMU、传播退出码——所以流水线通过/失败 = guest 内测试结果。

> 一句话：**绿色流水线 = 真实 `aigc.ko` + thunk 驱动一块 QEMU 仿真 AIGC 设备跑完整个 `kmd_test.sh` 矩阵。**
> 要本地复现 CI 失败一般需要 QEMU + virtual_platform；快速迭代纯逻辑可用 thunk 的 `kmt_ucmodel` C-model 后端。

## 下一步
- 上一页：[06 Grace HAL](<./06-hal-grace.md>)
- 下一页：[08 端到端：一次 saxpy 的全程](<./08-end-to-end-saxpy.md>)
