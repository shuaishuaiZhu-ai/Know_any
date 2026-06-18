---
type: topic
title: "Grace HAL 硬件后端"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - hal
  - grace
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_hal.c"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/hal/grace"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/regs"
---

# Grace HAL 硬件后端

**文件**: `kmd/aigc/kmdlib/aigc_hal.c`、`kmdlib/hal/grace/*.{c,h}`、`kmdlib/regs/*`
**关联**: [[wiki/grace/kmd/hal/index|Grace HAL]] | [[wiki/grace/kmd/arch/layered-architecture]]

> 这页讲后端怎么绑定、每个硬件块做什么，并诚实标注哪些是真寄存器驱动、哪些是本 build 的 bring-up 占位。

---

## 后端怎么绑定

`aigc_hal.c` 是薄转发层：每个入口经 `lib_dev->hal` 上的函数指针走（`hal_cp.ops.*`、`hal_imc.ops.*` 及 arch
钩子）。**目前没有运行时后端选择**——`aigc_hal_init()` 无条件调 Grace 后端，多后端派发留作 TODO：

```c
int aigc_hal_init(struct aigc_lib_device *lib_dev)
{
	/*TODO: FIXME in the future*/
	//if (lib_dev == GRACE)
	return grace_hal_init(lib_dev);
}
```

有序 bring-up 在 `hal/grace/grace_state.c`（`grace_hal_init`/`deinit`）：

1. `grace_imc_init()` 然后 `grace_cp_init()`；
2. 若 `aigc_mparam_fw_boot_stage()` 置位，提前返回（只 IMC+CP）；
3. 否则 `grace_arch_init()`，且在硬件后端（`#if KMD_BACKEND == 1`）`grace_tcu_init()`；
4. arch-init 失败时回滚 CP 和 IMC。

> **link 层不从 `grace_state.c` 拉起**：C2C/D2D/link 有自己的入口（`grace_link_hal_init` 等），由上层 link 驱动调。

`KMD_BACKEND` 取值选访问路径：`0`=cmodel，`1`=emulator（默认），`2`=chip。

## 硬件块（真 vs 桩）

| 块 | 文件 | 状态 | 说明 |
|---|---|---|---|
| CP 命令处理器 | `grace_cp.c/.h` | **真** | 接 CP ring-ops，管主/响应环，发固件 IPC（create/destroy queue、stop-schedule）并等 ack，把软队列绑到硬队列（编程每 `(pipe,hcqd)` HCQD 寄存器）。一个占位：`grace_pick_hw_queue` 恒返回 0（`TODO`）。 |
| arch 架构/cluster/perf/power | `grace_arch.c/.h` | **真** | 寄存器大户。读 `TOP_CFG` 取 die/GPU id 和封装模式，发现 cluster/core，复位读各类性能计数，arm TSV/remap 错误中断，算 cluster 物理地址（NPA），mask PCIe 中断。零碎占位：`__chip_cfg_init` 是 `#if 0`，`grace_get_die_id` 硬编 0，`core_num=7` 带 FIXME。 |
| IMC 片间内存控制器邮箱 | `grace_imc.c/.h` | **真** | Host↔IMC 固件环缓冲消息。两条 MMIO 环（host→IMC 请求、IMC→host 响应），各是带读/写指针的镜像回绕缓冲（base `REG_IMC_BASE=0x4000000`，buf 大小 `0x400`）。公共 ops（reset、固件更新、固件密码、IMC start-stage 查询）造请求、推、阻塞等 ack（由线程化 IMC 中断释放，见 [[aigc_interrupt]]）。 |
| L2C L2 缓存 + TSV/ECC | `grace_l2c.c/.h` | **真** | 每 cluster 16 个 L2C bank + TSV AXI 路径 + FEC port-agent。真寄存器活：`grace_enable_remapping_err`、TSV/ECC 中断使能、`grace_l2c_flush`（对 16 bank 置 `PBM_FLUSH_OP` 并轮询约 1s 等 `0xffff` 完成位图）。一个占位：`aigc_l2c_pa_dump()` 空体（`TODO: pa port agent`）。 |
| TCU 翻译/SMMU | `grace_tcu.c/.h` | **真**（`KMD_BACKEND==1`） | 驱动 CP 和每 cluster TCU 的 SMMU：`__grace_tcu_init`（sync/check-bit）、上下文（ASID）失效、MMU 翻译故障中断处理（解故障 VA/上下文、dump 页表、清故障、重失效）。受 interleave 粒度和 TBU/cluster hash 模块参数驱动。 |
| C2C 芯片到芯片 | `grace_c2c.c/.h` | **多为桩** | 叶子 ops 是 dummy 桩（无真寄存器）：link mode 恒 `SAFE`、rx_detect 恒 `true`、discovery token 恒 0、SID 合成（tag `0xCC`）。**真的是**纯计算的 port-map builder（3 口×4 vs 6 口×2）和分阶段 bring-up 流。`local_gpuid/dieid` 硬编 0（TODO）。 |
| D2D die 到 die | `grace_d2d.c/.h` | **多为桩** | link training 由固件做，多数叶子 ops 是 dummy 桩（linkup 恒 true、SID 合成、remote_info 全 0…）。**真的是**纯计算 `grace_d2d_get_fixed_topology`（按封装 die 数推每模块对端 die：2-die 线、4-die 2×2 网格、单 die=无、未连标 `0xFF`）；拓扑 = 2 子系统 × 8 UCIe 模块。 |
| link 互联编排 | `grace_link.c/.h` | **编排真，后端桩** | `grace_link_hal_init` 分配 link 设备信息、初始化 2 D2D+1 C2C、统计并缓存 link；`grace_link_discover_hw_info` 拍平每 link 的 SID/邻居数据给上层。编排逻辑真，但操作的是桩后端产出的数据；设备身份硬编 0/2 带 TODO。 |
| link_ipc | `grace_link_ipc.c/.h` | **dummy/桩** | 编译期模式 `AIGC_LINK_IPC_MODE` 默认 `AIGC_LINK_IPC_DUMMY`。每个命令都有 DUMMY 分支（log + 合成数据）；SYNC/ASYNC 分支是显式桩（`[STUB] actual IPC not implemented`）。**当前编出来所有 link IPC 流量都是假的。** |

## 寄存器映射（`kmdlib/regs/`）

两个头，按 die vs cluster 组织：

- **`grace_reg_define.h`** — 中心寄存器映射。`REG_IMC_BASE=0x4000000`。覆盖 IMC eFuse、IMC top（`REG_TOP`/`REG_TOP_CFG`）、
  TCU/MMU 窗口（`REG_TCU_SS=0xA0000`：每 TBU client id、sync/全局失效握手、翻译故障信息、bypass 配置）、CP 子系统
  （环、doorbell、HCQD 硬队列、SDMA、GCTRL、事件表）、IMC↔CP / IMC↔PCIe 中断寄存器。它包含 `grace_reg_cluster.h`。
- **`grace_reg_cluster.h`** — 每 cluster 映射。四个 cluster 基址（`REG_CLUSTER0_BASE=0x4800000`…`0x4b00000`，步长
  `0x100000`）。块：TSV（INTC `0x1000`、FEC port-agent ECC `0x30000`）、16 L2C bank（`REG_L2C_00_BASE=0x90000`，步长
  `0x1000`）、cluster 控制（`0xc0000`）、regbank（`0x81000`）、PE core + perf 计数、每 cluster TCU 窗口。提供
  `REG_CLUSTER_*()` 寻址宏。

> 闭源 GPU「kernel」逻辑以预编译对象 `aigc_kernel.o_binary` 链入；这里描述的是开放的 OS/驱动和 HAL 胶水。

## 延伸

- [[aigc_interrupt]]：IMC/CP ack 的线程化中断。
- [[wiki/grace/kmd/queue/index|命令队列与调度]]：CP HAL 怎么绑队列。
- [[wiki/grace/kmd/env|环境]]：`KMD_BACKEND` 与编译开关。
