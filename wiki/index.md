---
type: meta
title: "Wiki 总索引"
created: 2026-05-09
updated: 2026-06-26
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
├── grace/            # GraceC 芯片软硬件栈（产品栈层）
│   ├── index.md      # 芯片栈统一入口（MAS→FW→KMD 栈图）
│   ├── mas/          # MAS 设计规格（RguCore/RGU/L2C）
│   ├── fw/           # FW 片上固件
│   ├── kmd/          # KMD 主机内核驱动
│   └── tiny-kmd/     # tiny-kmd 最小骨架驱动
├── synthesis/        # 跨源综合、面试、工作笔记
├── sources/          # 原始/镜像材料索引和证据（查证层，非首读）
├── tools/            # non-AI tool notes
├── ai/               # AI agent tools, bugs, reflections, templates, secrets
├── canvases/         # Obsidian canvas
└── meta/             # 维护规则和审计
```

## 入口优先级

1. [GraceC 芯片软硬件栈](<./grace/index.md>)：芯片相关内容（MAS 设计规格、FW 片上固件、KMD 主机驱动、tiny-kmd）的统一入口，含 MAS→FW→KMD 栈图。**芯片栈主题先从这里进。**
1. [一个 Kernel 从 .cu 源码到硬件执行的全流程](<./grace/overview/saxpy-kernel-end-to-end.md>)：跨 UMD→KMD→CP→硬件 的端到端长文，以 `test_saxpy_op.cu`（`add1`）为例，10 张手绘 SVG/Graphviz 图、严谨技术风、面试盒子（源码确认 2026-06-26）。**完全没碰过这套栈、想先建立整体地图的，从这篇进。** 配套：[stream/MCQD/HCQD 与命令下发](<./grace/overview/stream-mcqd-hcqd-and-command-submission.md>)、[kernel cmd→CP job cmd 字段映射](<./grace/overview/kernel-cmd-to-cp-job-cmd.md>)。
1. [UMD 用户态运行时（aigc-driver）](<./grace/umd/index.md>)：应用直接链接的那层——类 CUDA API、ROCm 血缘、kernel 直发 doorbell、源码地图。已系统化通读全代码：总览页含「整体架构」+「子系统导航」，下设 8 个分子系统页（初始化/设备模型、kernel launch、stream/event/signal、code object 与注册、命令模型与队列、dispatch packet 与 doorbell、显存模型、thunk 与同步）+ 开发维护页，共 ~19 张 Graphviz/SVG 图。
1. [FW 技术知识库](<./grace/fw/index.md>)：GraceC CP MAS、IMC、CP firmware、CLI、RT-Thread、调度、性能与调试。配套 [CP 固件面试向深入](<./grace/fw/fw-cp-interview-deep-dive.md>)。
1. [KMD 内核驱动知识库](<./grace/kmd/index.md>)：`aigc.ko` 内核态驱动——线性 8 章（架构、数据结构、ioctl/ABI、内存与页表、提交/中断、Grace HAL、构建测试、saxpy 端到端）+ 附录，每章配飞书白板风渲染图。含 [面试向深入问答](<./grace/kmd/appendix/interview-qa.md>)。
1. [tiny-kmd 架构知识库](<./grace/tiny-kmd/index.md>)：最小骨架驱动（ringbuffer IPC + DMA + misc ioctl），以及把 ajthunk 核心移植进来的缺口对照。
2. [面试用工作笔记总结](<./synthesis/面试用工作笔记总结.md>)：面试复盘和项目表达。
3. [语雀工作笔记知识图谱](<./synthesis/语雀工作笔记知识图谱.md>)：工作笔记主线。
4. [本地 Markdown 知识图谱](<./synthesis/C-home-shuaishuai-zhu Markdown 知识图谱.md>)：历史本地材料总览。
5. [工具链知识库](<./tools/index.md>)：image_tool、claude-code-proxy、Codex Skills（含技术图解与普通生图选择）、跨机器共享 skills 仓库(all_skills)、钉钉到飞书迁移、AI 协作、登录环境等工具经验。
6. [MAS 文档知识库](<./grace/mas/index.md>)：RguCore/RGU 设计文档、GCtrl 两级调度学习、模块关系、控制流与调试问答。
7. [Source 索引](<./sources/本地 Markdown 文件索引.md>)：查证原始材料时使用。

## FW 快速入口

| 分类 | 入口 | 适合解决的问题 |
|---|---|---|
| 总览 | [FW 技术知识库](<./grace/fw/index.md>) | 不知道从哪里开始看 FW。 |
| IMC | [IMC 索引](<./grace/fw/imc/index.md>) | IMC 启动汇编、RT-Thread startup、board init、main、IPC 服务。 |
| CP Master | [CP Master 索引](<./grace/fw/cp-master/index.md>) | QDMA、BDMA、IPC、top_reg、MCQD 到 HCQD 绑定。 |
| CP User | [CP User 索引](<./grace/fw/cp-user/index.md>) | cmd_entry、IB、stop/flush、candidate 调度。 |
| CLI | [CLI 索引](<./grace/fw/cli/index.md>) | agc_shell、USART/UART、CP USART/IMC 初始化、shell 卡顿、console 路径、输入 ringbuffer 与行编辑。 |
| RT-Thread | [RT-Thread 索引](<./grace/fw/rt-thread/index.md>) | yield、delay、ready queue、线程调度。 |
| 概念 | [FW 概念索引](<./grace/fw/concepts/index.md>) | HCQD、MCQD、IB、iDMA、Event Table、Command Packet。 |
| 流程 | [FW 流程索引](<./grace/fw/flows/index.md>) | Host 到 FW 命令链路、多队列、多 context。 |
| 性能 | [FW 性能索引](<./grace/fw/performance/index.md>) | candidate peek、cmd_entry 热路径、[GPGPU DVFS](<./grace/fw/performance/dvfs-gpgpu-fw.md>)、OPP/VF、timing。 |
| 互联 | [FW Interconnect 索引](<./grace/fw/interconnect/index.md>) | **C2C 学习路线 + MAS v0.8 权威层**（[Interconnect 索引](<./grace/fw/interconnect/index.md>) / [架构总览](<./grace/fw/interconnect/c2c-ss-architecture-overview.md>)/[帧格式](<./grace/fw/interconnect/c2c-frame-format-oisa-l2.md>)/[Adapter 内部](<./grace/fw/interconnect/c2c-adapter-internals.md>)/[时钟复位初始化](<./grace/fw/interconnect/c2c-clock-reset-init.md>)/[接口信号 RAS](<./grace/fw/interconnect/c2c-interface-signals-and-ras.md>)）+ AXI5、OISA、topo discovery、[portmap 路由表](<./grace/fw/interconnect/portmap-routing-table.md>)、[近端/远端环回](<./grace/fw/interconnect/c2c-loopback-near-far.md>)。⚠️ 本目录本地专属（gitignore，不上 GitHub）。 |
| 调试 | [FW 调试索引](<./grace/fw/debug/index.md>) | PCIe bring-up 复盘合集、ringbuffer IPC/CLI 地址转换图解、SDMA、aigc_sdk 扫描。 |
| 来源映射 | [GraceC CP MAS v1.4 code knowledge map](<./grace/fw/GraceC CP MAS v1.4 code knowledge map.md>) | MAS 文档与代码知识图谱、源材料对应关系。 |

## KMD 快速入口

> 已重构为**线性编号 8 章 + 附录**（替换原扁平 10 区），建议从前往后顺序读；每章配飞书白板风渲染图。

| 章 | 入口 | 适合解决的问题 |
|---|---|---|
| 入口 | [KMD 内核驱动知识库](<./grace/kmd/index.md>) | 不知道从哪开始看 `aigc.ko`；阅读路线 + 全景图 + 术语速查。 |
| 00 | [大局观：一次请求的一生](<./grace/kmd/00-big-picture.md>) | 先用一个故事建立整体印象。 |
| 01 | [整体架构](<./grace/kmd/01-architecture.md>) | 三层架构、一次 ioctl 的端到端路径、子系统地图、OS 抽象/conftest。 |
| 02 | [核心数据结构](<./grace/kmd/02-data-structures.md>) | aigc/lib_device/vdev/ctx/vm/mem_handle 与所有权树。 |
| 03 | [ioctl 接口与 ABI](<./grace/kmd/03-ioctl-abi.md>) | `AIP_*` 操作集、X-macro 两级派发、ABI 稳定性。 |
| 04 | [内存与页表](<./grace/kmd/04-memory-and-pagetables.md>) | 堆/NUMA/UMA/DSMEM、mem_handle 生命周期、4 级页表、TLB 失效。 |
| 05 | [提交、事件与中断](<./grace/kmd/05-submission-events-interrupts.md>) | ctx→queue→CP ring→doorbell、调度 kthread、MSI-X、事件环、fence。 |
| 06 | [Grace HAL](<./grace/kmd/06-hal-grace.md>) | CP/arch/IMC/L2C/TCU/互联 真驱动 vs bring-up 桩、寄存器映射。 |
| 07 | [构建与测试](<./grace/kmd/07-build-and-test.md>) | Kbuild + conftest、模块参数、kmd_test 套、QEMU CI。 |
| 08 | [端到端：一次 saxpy 的全程](<./grace/kmd/08-end-to-end-saxpy.md>) | 把所有子系统串成一条时间线。 |
| 附录 | [术语表](<./grace/kmd/appendix/glossary.md>) · [面试问答](<./grace/kmd/appendix/interview-qa.md>) · [代码评审](<./grace/kmd/appendix/code-review.md>) | 速查 / 面试 / 评审。 |

## tiny-kmd 快速入口

| 分类 | 入口 | 适合解决的问题 |
|---|---|---|
| 总览 | [tiny-kmd 架构知识库](<./grace/tiny-kmd/index.md>) | 不知道从哪开始看这个最小驱动；与 ajthunk 的关系。 |
| 架构 | [架构总览](<./grace/tiny-kmd/architecture.md>) | probe 序列、`aigc_device` 根结构、请求路径。 |
| IPC | [IPC 消息环](<./grace/tiny-kmd/ipc.md>) | ringbuffer 双镜像、消息头位域、host↔IMC/CP_Master、同步/异步、订阅。 |
| 设备 | [设备与内存](<./grace/tiny-kmd/device.md>) | BAR 映射、IMC 共享内存区、PCIe ATU、DMA 分配。 |
| ioctl | [misc 设备与 ioctl](<./grace/tiny-kmd/ioctl.md>) | 6 个 ioctl、file_ops、订阅机制。 |
| 中断 | [中断](<./grace/tiny-kmd/interrupt.md>) | MSI-X 分配、IPC 向量 108-111、enable/disable 桩。 |
| 缺口 | [对照 ajthunk 的缺口](<./grace/tiny-kmd/gap-vs-ajthunk.md>) | 缺页表/队列/调度/fence/HAL/OS 抽象；移植顺序与接入点。 |
| 环境 | [环境与构建](<./grace/tiny-kmd/env.md>) | 路径、GitLab 远程、make。 |

## 非 FW 内容

| 分类 | 入口 | 用途 |
|---|---|---|
| 语雀工作笔记 | [语雀工作笔记知识图谱](<./synthesis/语雀工作笔记知识图谱.md>) | 工作经历、问题链路、复盘材料。 |
| 面试材料 | [面试用工作笔记总结](<./synthesis/面试用工作笔记总结.md>) | 面试讲述用的项目总结。 |
| 硬件基础 | [硬件基础 RAM ROM Flash](<./synthesis/硬件基础 RAM ROM Flash.md>) | RAM/ROM/Flash 基础概念，面试讲 boot/firmware/存储介质的背景。 |
| AI 协作经验 | [AI 协作远程编辑经验](<ai/workflows/AI 协作远程编辑经验.md>) | SSH、远程编辑、协作注意事项，含浏览器/飞书/SSH PATH 登录环境经验。 |
| 工具链 | [tools](<./tools/index.md>) | image_tool、Codex Skills（含 technical-diagram-generator 与 imagegen）、跨机器共享 skills 仓库(all_skills)、钉钉到飞书迁移、AI 协作等工具说明。 |
| Codex 反思 | [Codex 反思与进化](<ai/reflections/codex/index.md>) | Codex 工作流复盘、技能规则演进和操作事故复盘。 |
| MAS 文档 | [MAS 文档知识库](<./grace/mas/index.md>) | RGU/RguCore 设计文档、模块关系、调度、SHM、UCore。 |

工具链新增入口：[AI 使用飞书 lark-cli 创建文档：从零安装、授权到验证](<ai/tools/lark-cli-ai-document-guide.md>)，供其他 AI Agent 从空环境完成安装、授权、创建和回读验证。

## 证据层

`sources/` 是查证层，不是首读层。默认阅读整理页；需要确认原文时再看这里。

- [GraceC CP MAS v1.4 摘要](<./sources/GraceC CP MAS v1.4.md>)
- [fw CP user firmware code summary](<./sources/fw CP user firmware code summary.md>)
- [语雀工作笔记索引](<./sources/语雀工作笔记索引.md>)
- [本地 Markdown 文件索引](<./sources/本地 Markdown 文件索引.md>)

## 维护规则

- 最近整理记录：[2026-06-02 Wiki 与 Memory 整理记录](<./meta/2026-06-02-wiki-memory-maintenance.md>)

- 新增任何分析页、技术文档、调试结论页，必须同步更新本页和对应专区索引。
- 芯片栈相关页面放在 `wiki/grace/` 下：MAS→`grace/mas/`，FW→`grace/fw/`（子目录 `imc`/`cp-master`/`cp-user`/`cli`/`rt-thread`/`concepts`/`flows`/`performance`/`interconnect`/`debug`），KMD→`grace/kmd/`，tiny-kmd→`grace/tiny-kmd/`。详见 [GraceC 芯片软硬件栈](<./grace/index.md>)。
- 原始材料、镜像、导出的语雀/本地 Markdown 放 `wiki/sources/` 或 `.raw/`，不要混入阅读层。
- 重大整理后更新 [Hot Cache](<./hot.md>) 和 [Wiki Log](<./log.md>)。
- 详细规则见 [Wiki 维护规则](<./meta/wiki-maintenance-rules.md>)。
