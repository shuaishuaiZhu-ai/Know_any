---
type: meta
title: "Wiki 总索引"
created: 2026-05-09
updated: 2026-06-12
tags:
  - meta
  - index
status: active
---

# Wiki 总索引

这是当前知识库的唯一总入口。不要从文件夹树随机翻文件，先从这里进入，再进入对应专区索引。

## 当前结构

```text
wiki/
├── index.md          # 唯一总索引（本页）
├── hot.md            # 近期上下文
├── log.md            # 维护日志
├── fw/               # FW 技术知识库
├── kmd/              # KMD 内核驱动知识库
├── synthesis/        # 跨源综合、面试、工作笔记
├── sources/          # 原始/镜像材料索引和证据（查证层，非首读）
├── tools/            # 工具链知识
├── canvases/         # Obsidian canvas
└── meta/             # 维护规则和审计
```

## 入口优先级

1. [FW 技术知识库](<./fw/index.md>)：GraceC CP MAS、IMC、CP firmware、CLI、RT-Thread、调度、性能与调试。
1. [KMD 内核驱动知识库](<./kmd/index.md>)：`aigc.ko` 内核态驱动——ioctl/ABI、内存与页表、命令队列与调度、中断与 fence、Grace HAL。
2. [面试用工作笔记总结](<./synthesis/面试用工作笔记总结.md>)：面试复盘和项目表达。
3. [语雀工作笔记知识图谱](<./synthesis/语雀工作笔记知识图谱.md>)：工作笔记主线。
4. [本地 Markdown 知识图谱](<./synthesis/C-home-shuaishuai-zhu Markdown 知识图谱.md>)：历史本地材料总览。
5. [工具链知识库](<./tools/index.md>)：image_tool、claude-code-proxy、Codex Skills、钉钉到飞书迁移、AI 协作、登录环境等工具经验。
6. [MAS 文档知识库](<./mas/index.md>)：RguCore/RGU 设计文档、GCtrl 两级调度学习、模块关系、控制流与调试问答。
7. [Source 索引](<./sources/本地 Markdown 文件索引.md>)：查证原始材料时使用。

## FW 快速入口

| 分类 | 入口 | 适合解决的问题 |
|---|---|---|
| 总览 | [FW 技术知识库](<./fw/index.md>) | 不知道从哪里开始看 FW。 |
| IMC | [IMC 索引](<./fw/imc/index.md>) | IMC 启动汇编、RT-Thread startup、board init、main、IPC 服务。 |
| CP Master | [CP Master 索引](<./fw/cp-master/index.md>) | QDMA、BDMA、IPC、top_reg、MCQD 到 HCQD 绑定。 |
| CP User | [CP User 索引](<./fw/cp-user/index.md>) | cmd_entry、IB、stop/flush、candidate 调度。 |
| CLI | [CLI 索引](<./fw/cli/index.md>) | agc_shell、USART/UART、CP USART/IMC 初始化、shell 卡顿、console 路径、输入 ringbuffer 与行编辑。 |
| RT-Thread | [RT-Thread 索引](<./fw/rt-thread/index.md>) | yield、delay、ready queue、线程调度。 |
| 概念 | [FW 概念索引](<./fw/concepts/index.md>) | HCQD、MCQD、IB、iDMA、Event Table、Command Packet。 |
| 流程 | [FW 流程索引](<./fw/flows/index.md>) | Host 到 FW 命令链路、多队列、多 context。 |
| 性能 | [FW 性能索引](<./fw/performance/index.md>) | candidate peek、cmd_entry 热路径、[GPGPU DVFS](<./fw/performance/dvfs-gpgpu-fw.md>)、OPP/VF、timing。 |
| 互联 | [FW Interconnect 索引](<./fw/interconnect/index.md>) | C2C、AXI5、OISA、PCIe/HWJ 对比、topo discovery、AMT route、[portmap 路由表](<./fw/interconnect/portmap-routing-table.md>)、[近端/远端环回](<./fw/interconnect/c2c-loopback-near-far.md>)、loopback/RAS。 |
| 调试 | [FW 调试索引](<./fw/debug/index.md>) | PCIe bring-up、ringbuffer IPC/CLI 地址转换图解、SDMA、aigc_sdk 扫描。 |
| 来源映射 | [FW 来源映射](<./fw/source-maps/index.md>) | MAS 文档与代码知识图谱、源材料对应关系。 |

## KMD 快速入口

| 分类 | 入口 | 适合解决的问题 |
|---|---|---|
| 总览 | [KMD 内核驱动知识库](<./kmd/index.md>) | 不知道从哪里开始看 `aigc.ko` 内核驱动。 |
| 架构 | [架构总览](<./kmd/arch/index.md>) | 三层架构、一次 ioctl 的端到端路径、OS 抽象规则。 |
| 数据结构 | [核心数据结构](<./kmd/concepts/index.md>) | aigc_lib_device/vdev/ctx/vm/mem_handle 的职责与所有权树。 |
| ioctl | [ioctl 接口与 ABI](<./kmd/ioctl/index.md>) | `AIP_*` 操作集、两级派发、ABI 稳定性。 |
| 内存 | [内存与页表](<./kmd/memory/index.md>) | 堆/NUMA/UMA/DSMEM、mem_handle 生命周期、4 级页表、TLB 失效。 |
| 队列调度 | [命令队列与调度](<./kmd/queue/index.md>) | MCQD/HQD、CP ring/doorbell、调度 kthread。 |
| 中断 | [中断与 Fence](<./kmd/interrupt/index.md>) | MSI-X 向量、上/下半部、事件环、fence 完成模型。 |
| OS 抽象 | [OS 抽象层](<./kmd/os/index.md>) | os_interface 缝隙 + NVIDIA 式 conftest。 |
| HAL | [Grace HAL](<./kmd/hal/index.md>) | CP/arch/IMC/L2C/TCU/互联 bring-up 状态、寄存器映射。 |
| 流程 | [端到端流程](<./kmd/flows/index.md>) | 从 `Thunk_*` 到硬件完成的 saxpy 全链路。 |
| 评审 | [代码评审意见](<./kmd/review/index.md>) | kmd 代码评审记录与注释改进项。 |
| 环境 | [服务器环境与构建](<./kmd/env.md>) | 远端源码路径、构建/加载命令。 |

## 非 FW 内容

| 分类 | 入口 | 用途 |
|---|---|---|
| 语雀工作笔记 | [语雀工作笔记知识图谱](<./synthesis/语雀工作笔记知识图谱.md>) | 工作经历、问题链路、复盘材料。 |
| 面试材料 | [面试用工作笔记总结](<./synthesis/面试用工作笔记总结.md>) | 面试讲述用的项目总结。 |
| AI 协作经验 | [AI 协作远程编辑经验](<./synthesis/AI 协作远程编辑经验.md>) | SSH、远程编辑、协作注意事项，含浏览器/飞书/SSH PATH 登录环境经验。 |
| 工具链 | [tools](<./tools/index.md>) | image_tool、Codex Skills、钉钉到飞书迁移、AI 协作等工具说明。 |
| MAS 文档 | [MAS 文档知识库](<./mas/index.md>) | RGU/RguCore 设计文档、模块关系、调度、SHM、UCore。 |

## 证据层

`sources/` 是查证层，不是首读层。默认阅读整理页；需要确认原文时再看这里。

- [GraceC CP MAS v1.4 摘要](<./sources/GraceC CP MAS v1.4.md>)
- [fw CP user firmware code summary](<./sources/fw CP user firmware code summary.md>)
- [语雀工作笔记索引](<./sources/语雀工作笔记索引.md>)
- [本地 Markdown 文件索引](<./sources/本地 Markdown 文件索引.md>)

## 维护规则

- 最近整理记录：[2026-06-02 Wiki 与 Memory 整理记录](<./meta/2026-06-02-wiki-memory-maintenance.md>)

- 新增任何分析页、技术文档、调试结论页，必须同步更新本页和对应专区索引。
- FW 相关分析默认放在 `wiki/fw/` 下，并选择 `imc`、`cp-master`、`cp-user`、`cli`、`rt-thread`、`concepts`、`flows`、`performance`、`interconnect`、`debug`、`source-maps` 之一。
- 原始材料、镜像、导出的语雀/本地 Markdown 放 `wiki/sources/` 或 `.raw/`，不要混入阅读层。
- 重大整理后更新 [Hot Cache](<./hot.md>) 和 [Wiki Log](<./log.md>)。
- 详细规则见 [Wiki 维护规则](<./meta/wiki-maintenance-rules.md>)。
