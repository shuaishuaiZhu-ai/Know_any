---
type: meta
title: "Hot Cache"
created: 2026-05-09
updated: 2026-06-03
tags:
  - meta
  - hot-cache
status: active
---

- [C2C OISA vs L2 frame format](fw/interconnect/c2c-dingtalk-study.md#13-oisa-格式c2c-l2-格式和-switch-适配)：解释 OISA native frame 和 C2C L2 switch-facing wrapper 的区别，以及为什么两种格式都需要。

# Hot Cache

> 近期上下文缓存。回答问题时先读这里，再进入对应索引页。

## 当前主入口


- Codex 反思与进化：[Codex 反思与进化](<./codex-reflection/index.md>)
- Codex 全局复盘：[全局 Codex 工作流复盘](<./codex-reflection/projects/2026-05-26-global-codex-workflow-review.md>)
- Codex 总结反思：[2026-06-01 Codex 总结反思](<./codex-reflection/projects/2026-06-01-codex-summary-reflection.md>)
- Codex 项目 Session 复盘：[2026-06-01 项目 Session 复盘](<./codex-reflection/projects/2026-06-01-session-project-review.md>)
- Codex Daily Review Skill：[Daily Codex Self-Review Skill](<./codex-reflection/evolution/2026-06-01-codex-daily-self-review-skill.md>)
- 总入口：[Wiki 总索引](<./index.md>)
- FW 入口：[FW 技术知识库](<./fw/index.md>)
- IMC 入口：[IMC 索引](<./fw/imc/index.md>)
- MAS 入口：[MAS 文档知识库](<./mas/index.md>)
- CLI 入口：[CLI 索引](<./fw/cli/index.md>)
- 维护规则：[Wiki 维护规则](<./meta/wiki-maintenance-rules.md>)
- Wiki/Memory 整理：[2026-06-02 Wiki 与 Memory 整理记录](<./meta/2026-06-02-wiki-memory-maintenance.md>)

## 当前主域

GraceC CP MAS v1.4 + fw CP firmware。远端源码默认以 `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` 为准。

## 最近活跃主题


- Codex Skills：[使用地图](<./tools/codex-skills-map.md>)，用于查当前安装 skills、触发场景、选择流程和重名来源。
- claude-code-proxy：[项目 Wiki](<./tools/claude-code-proxy/index.md>)，用于回看 ccproxy 安装、provider/model 切换、订阅登录和故障排查。

- RguGCtrl: [RguGCtrl 学习文档：从 Kernel 到 Core 的两级调度](<./mas/RguCore/02-rgu-gctrl.md>)
- GPGPU DVFS：[GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>)，重点看状态机、OPP/VF、timing 和面试问答。
- C2C 互联：[C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>)，重点看 LD/ST 互联、topo discovery、AMT route、peer mapping 中 `va0/va1/va2` 的归属、MSS/SerDes、loopback/RAS。
- C2C loopback：[近端环回与远端环回详解](<./fw/interconnect/c2c-loopback-near-far.md>)，用于区分 NEP/NES/NES-ext/FEP/FES/FEP-err、Top/Adapter/LLRMAC 环回和测试场景。
- DVFS 更新提醒：DVFS 状态机图已恢复为紧凑的 stateDiagram-v2，保留单行状态名和状态含义表。
- RguGCtrl 阅读提醒：`logic cluster -> block -> core` 是 ClusCtrl 的 cluster 内部调度；GlbCtrl 只负责到 physical cluster 的全局分配。

- IMC 启动：[IMC 启动到 main 流程](<./fw/imc/startup-to-main.md>)
- CLI 卡顿：[agc_shell CLI 输入输出路径与 cp master 卡顿分析](<./fw/cli/agc_shell-cli-path.md>)
- USART 路径：[Grace USART、RT-Thread console 与 agc_shell 完整链路](<./fw/cli/grace-usart-console-cli.md>)，用于查看 USART 硬件初始化、RT-Thread device 注册、console 输出、shell 输入中断、ringbuffer 和完整触发链路；图解已按 technical-diagram-generator workflow 生成 SVG/PNG 资产。
- CP ringbuffer IPC：[CP ringbuffer IPC 与 queue create 调试](<./fw/debug/CP ringbuffer IPC 与 queue create 调试.md>)，用于区分 IPC shared RB 与 CLI 本地 RB、is_ipc_rb 地址转换、IPC 发送/接收和 queue create 调试流程；图解已按 technical-diagram-generator workflow 生成 SVG/PNG 资产。
- RT-Thread yield：[RT-Thread rt_thread_yield 实现与使用风险](<./fw/rt-thread/rt_thread_yield.md>)
- CP User 调度：[cmd_entry — CP User 调度器](<./fw/cp-user/cmd_entry.md>)
- 分支布局：[cmd_entry branch layout](<./fw/cp-user/cmd_entry-branch-layout.md>)
- stop/flush：[CP stop flush 与 queue 切换](<./fw/cp-user/CP stop flush 与 queue 切换.md>)
- L2C remapping：[L2C Remapping 机制](<./mas/L2C/remapping.md>)

## 写作提醒

新增分析页或技术文档后，必须更新：

1. [Wiki 总索引](<./index.md>)
2. 对应专区索引
3. [Wiki Log](<./log.md>)
4. 本页，如果属于近期活跃主题
- Portmap 路由表：[Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md>)，用于回答 C2C/D2D portmap 表项数字如何由拓扑、下一跳方向、serdes/ucie 编码得到。（已补 C2C 白板图解：第一跳 mask 与策略对比）。

- C2C 钉钉学习文档白板图解：[C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>) 已将 Mermaid 讲解图替换为 lark-whiteboard SVG/PNG。
- Mermaid 白板化：已将 71 个学习文档 Mermaid 图解渲染为 lark-whiteboard PNG，并保留 .mmd 源文件；所有目标块已替换。
- Portmap 图解工具对比：[Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md#32-同主题工具对比图>) 已补 G5 第一跳和 8bit mask 的多工具对比产物；当前评估优先采用 lark-whiteboard SVG 和 Graphviz DOT 两版。

- C2C switch 转发规则：[Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md#71-switch-模式转发规则详细图解>) 已补白板图和 Graphviz 判定图，解释跨 GPU 硬件轮询 SerDes、GPU 内跨 die 查 D2D 表。
