---
type: note
title: "附录 · 术语表"
created: 2026-06-29
updated: 2026-06-29
tags:
  - kmd
  - glossary
status: active
---

# 附录 · 术语表

> kmd 知识库里出现的缩写和名词，按主题分组。第一次读到陌生词回这里查；带 `→` 的指向讲它的章节。

## 总体 / 软件栈
| 术语 | 含义 |
|---|---|
| **kmd** | AIGCIC Grace GPU 的 Linux 内核态驱动，产物 `aigc.ko`。本知识库主角。 |
| **UMD** | User-Mode Driver，用户态驱动 / 运行时，kmd 的「客户」。 |
| **thunk / ajthunk** | 用户态库，暴露稳定 `Thunk_*` C API，每个调用最终是一次 `/dev/aigc` 的 ioctl。 |
| **fw** | 跑在 GPU 片上微控制器（IMC / CP master）的固件，姊妹项目；kmd 经 CP/IMC IPC 环和它对话。 |
| **kmdlib** | 可移植核心（`kmd/aigc/kmdlib/*`），OS 无关，不直接调 Linux API。→ [01](<../01-architecture.md>) |
| **HAL** | Hardware Abstraction Layer，硬件抽象层，把「做什么」翻成「碰哪个寄存器/发哪条 IPC」。→ [06](<../06-hal-grace.md>) |

## 接口 / ABI
| 术语 | 含义 |
|---|---|
| **`/dev/aigcN`** | kmd 暴露给用户态的字符设备节点，`N` = 第几张卡。 |
| **ioctl** | "I/O control"，用户态给驱动下达带参数命令的系统调用。→ [03](<../03-ioctl-abi.md>) |
| **`AIP_*`** | 每种操作的编号（`common/aip_ioctl_nr.h`，0..34）。 |
| **X-macro** | 用同一份宏列表（`aigc_ioctl_tab.h`）展开出多张表的技巧；kmd 用它生成校验表 + 派发表，二者永不漂移。 |
| **fail-closed** | 默认拒绝：畸形/版本不匹配的请求返回 `-EINVAL` 而非破坏内存。 |
| **THUNK_IF_VERSION** | thunk 与 kmd 共享 ABI 的版本号，改 ABI 必须同步移动。 |

## 数据结构
| 术语 | 含义 |
|---|---|
| **IDR** | Linux 内核的 id→对象 映射结构；kmd 用句柄经 IDR 还原内核对象。 |
| **handle（句柄）** | 打包了 id 的整数（如 `(minor, ctx_id, mem_id)`），跨进程安全。→ [02](<../02-data-structures.md>) |
| **kref** | 内核引用计数；归零才释放对象。 |
| **vdev / ctx / mem_handle / vm** | 见 [02 核心数据结构](<../02-data-structures.md>)。 |

## 内存 / 页表
| 术语 | 含义 |
|---|---|
| **VMID** | GPU 地址空间编号；每个 context 一个，区分各自页表（对应 MMU 上下文槽 / TTBA）。 |
| **VA / dva / PA / DPA** | 虚拟地址 / GPU 虚拟地址 / 物理地址 / 设备物理地址。 |
| **PDE / PTE** | 页目录项 / 页表项；kmd 用 4 级页表（PL0..PL3）。→ [04](<../04-memory-and-pagetables.md>) |
| **TTBA** | Translation Table Base Address，页表根基址（PL0 / PD3）。 |
| **TLB** | 地址翻译的硬件缓存；改页表后必须失效（invalidate），否则用到旧映射。 |
| **TCU / TBU / SMMU** | 翻译控制单元 / 翻译缓冲单元 / 系统 MMU；GPU 的地址翻译硬件。 |
| **NUMA / UMA** | 设备内存绑定单节点 / 跨节点条带交织。 |
| **DSMEM** | 分布式共享内存：一块设备寻址另一块设备的本地内存。 |
| **heap** | 分配的后端来源：`MH_HOST` / `MH_DEVICE` / `MH_OTHER_DEVICE`。 |
| **gen_pool / genalloc** | 内核通用内存池分配器；kmd 用它管设备显存。 |

## 提交 / 队列 / 中断
| 术语 | 含义 |
|---|---|
| **CP** | Command Processor，命令处理器，GPU 上消费命令的硬件单元。 |
| **doorbell（门铃）** | MMIO 寄存器；写 wptr 进去就是告诉 GPU「有新命令了」。 |
| **CP ring** | CP 命令环；`wptr`=软件生产者偏移，`rptr`=硬件消费者偏移，留一空槽区分满/空。→ [05](<../05-submission-events-interrupts.md>) |
| **MCQD / HCQD** | 软件队列描述符（逻辑队列，可多）/ 硬件队列槽（物理有限）。 |
| **HWS / NO_HWS** | 硬件调度（默认，固件绑 HCQD）/ 直接绑定。 |
| **IB** | Indirect Buffer，间接命令缓冲；CP 跳到 IB 执行其内容。 |
| **MSI-X** | PCIe 消息中断；kmd 用不同向量区分来源（如向量 40 = CP 完成）。 |
| **上半部 / 下半部** | 硬中断里只读清+标记（快）/ 工作队列里干重活（drain 事件环、唤醒）。 |
| **fence** | 完成信号：CP 把递增时间戳写进 TS 缓冲，用户态比大小即知完成。 |
| **event tracker** | 把中断/错误事件投递给用户态工具的共享内存队列。 |

## 构建 / 平台
| 术语 | 含义 |
|---|---|
| **conftest** | NVIDIA 式内核 API 编译探测，生成 `kerneltest/*.h`，让驱动跨内核版本可移植。→ [07](<../07-build-and-test.md>) |
| **KMD_BACKEND** | 选 HAL 访问路径：0=cmodel, 1=emulator（默认）, 2=chip。 |
| **PG_MODE** | GPU 页表页粒度（64M/2M/64K/4K），默认 2M。 |
| **FALLBACK_ENABLE / PARTIAL_GOOD / SAME_PA** | 编译开关，见 [07](<../07-build-and-test.md>)。 |
| **bring-up 桩** | 尚未接真硬件的占位实现（log/返合成值）；本知识库逐处标注。 |
| **`aigc_kernel.o_binary`** | 封闭 GPU「kernel」逻辑的预编译 x86-64 ELF blob，链进 `aigc.ko`；**不是**跑在 GPU 上的计算 kernel。 |

## 返回
- [KMD 知识库入口](<../index.md>) · [面试向深入问答](<./interview-qa.md>) · [代码评审记录](<./code-review.md>)
