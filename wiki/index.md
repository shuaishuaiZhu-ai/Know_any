---
type: meta
title: "Wiki 总索引"
created: 2026-05-09
updated: 2026-06-04
tags:
  - meta
  - index
status: active
---

# Wiki 总索引

这是当前知识库的唯一总入口。不要从文件夹树随机翻文件，先从这里进入，再进入对应专区索引。

## 入口优先级

1. [FW 技术知识库](<./fw/index.md>)：GraceC CP MAS、IMC、CP firmware、CLI、RT-Thread、调度、性能与调试。
2. [面试用工作笔记总结](<./synthesis/面试用工作笔记总结.md>)：面试复盘和项目表达。
3. [语雀工作笔记知识图谱](<./synthesis/语雀工作笔记知识图谱.md>)：工作笔记主线。
4. [本地 Markdown 知识图谱](<./synthesis/C-home-shuaishuai-zhu Markdown 知识图谱.md>)：历史本地材料总览。
5. [工具链知识库](<./tools/index.md>)：image_tool、claude-code-proxy、Codex Skills、AI 协作、登录环境等工具经验。
6. [MAS 文档知识库](<./mas/index.md>)：RguCore/RGU 设计文档、GCtrl 两级调度学习、模块关系、控制流与调试问答。
7. [Source 索引](<./sources/本地 Markdown 文件索引.md>)：查证原始材料时使用。

## FW 快速入口

| 分类 | 入口 | 适合解决的问题 |
|---|---|---|
| 总览 | [FW 技术知识库](<./fw/index.md>) | 不知道从哪里开始看 FW。 |
| IMC | [IMC 索引](<./fw/imc/index.md>) | IMC 启动汇编、RT-Thread startup、board init、main、IPC 服务。 |
| CP Master | [CP Master 索引](<./fw/cp-master/index.md>) | QDMA、BDMA、IPC、top_reg、MCQD 到 HCQD 绑定。 |
| CP User | [CP User 索引](<./fw/cp-user/index.md>) | cmd_entry、IB、stop/flush、candidate 调度。 |
| CLI | [CLI 索引](<./fw/cli/index.md>) | agc_shell、USART/UART、shell 卡顿、console 路径、输入 ringbuffer 与行编辑。 |
| RT-Thread | [RT-Thread 索引](<./fw/rt-thread/index.md>) | yield、delay、ready queue、线程调度。 |
| 概念 | [FW 概念索引](<./fw/concepts/index.md>) | HCQD、MCQD、IB、iDMA、Event Table、Command Packet。 |
| 流程 | [FW 流程索引](<./fw/flows/index.md>) | Host 到 FW 命令链路、多队列、多 context。 |
| 性能 | [FW 性能索引](<./fw/performance/index.md>) | candidate peek、cmd_entry 热路径、[GPGPU DVFS](<./fw/performance/dvfs-gpgpu-fw.md>)、OPP/VF、timing。 |
| 互联 | [FW Interconnect 索引](<./fw/interconnect/index.md>) | C2C、OISA、PCIe/HWJ 对比、topo discovery、AMT route、[portmap 路由表](<./fw/interconnect/portmap-routing-table.md>)、[近端/远端环回](<./fw/interconnect/c2c-loopback-near-far.md>)、loopback/RAS。 |
| 调试 | [FW 调试索引](<./fw/debug/index.md>) | PCIe bring-up、ringbuffer IPC/CLI 地址转换图解、SDMA、aigc_sdk 扫描。 |
| 来源映射 | [FW 来源映射](<./fw/source-maps/index.md>) | MAS 文档与代码知识图谱、源材料对应关系。 |

## 非 FW 内容

| 分类 | 入口 | 用途 |
|---|---|---|
| 语雀工作笔记 | [语雀工作笔记知识图谱](<./synthesis/语雀工作笔记知识图谱.md>) | 工作经历、问题链路、复盘材料。 |
| 面试材料 | [面试用工作笔记总结](<./synthesis/面试用工作笔记总结.md>) | 面试讲述用的项目总结。 |
| AI 协作经验 | [AI 协作远程编辑经验](<./synthesis/AI 协作远程编辑经验.md>) | SSH、远程编辑、协作注意事项。 |
| 登录与环境 | [工具与登录环境经验](<./synthesis/工具与登录环境经验.md>) | 浏览器、飞书、SSH PATH 等经验。 |
| 工具链 | [tools](<./tools/index.md>) | image_tool、Codex Skills、AI 协作等工具说明。 |
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
