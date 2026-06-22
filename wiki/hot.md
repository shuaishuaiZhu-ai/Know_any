---
type: meta
title: "Hot Cache"
created: 2026-05-09
updated: 2026-06-18
tags:
  - meta
  - hot-cache
status: active
---

- [C2C OISA vs L2 frame format](grace/fw/interconnect/c2c-dingtalk-study.md#13-oisa-格式c2c-l2-格式和-switch-适配)：解释 OISA native frame 和 C2C L2 switch-facing wrapper 的区别，以及为什么两种格式都需要。

# Hot Cache

> 近期上下文缓存。回答问题时先读这里，再进入对应索引页。

## 当前主入口


- **KMD 内核驱动知识库（新增）**：[KMD 内核驱动知识库](<./grace/kmd/index.md>)，`aigc.ko` 内核态驱动——三层架构、ioctl/ABI、内存与 4 级页表、命令队列与调度、MSI-X 中断与 fence、Grace HAL；面向应届生、含 mermaid 图与 `文件:行` 引用。配套 [代码评审意见](<./grace/kmd/review/kmd-code-review.md>)。
- **KMD 逐操作代码流程（新增，2026-06-15）**：[端到端流程索引](<./grace/kmd/flows/index.md>) 下新增 8 个**函数级调用链**页（probe / 设备初始化 / context / mem-create / 页表写入 / queue-create / 命令提交下发 / 完成中断），与远端 `docs/kmd-step-comments` 分支的函数内 step 注释配套，可对着真实函数名读源码。
- **tiny-kmd 架构知识库（新增）**：[tiny-kmd 架构知识库](<./grace/tiny-kmd/index.md>)，最小骨架驱动（ringbuffer IPC + DMA + misc ioctl），含 [对照 ajthunk 的缺口](<./grace/tiny-kmd/gap-vs-ajthunk.md>) 与移植顺序。配套远端代码仓 `aigc-kmd-modular`（ajthunk kmd 模块化抽取 + 移植/重构指南）。
- CP USART/Clock IMC 统一初始化（`zss/MoveUsart`）：[CP USART 与 Core Clock 解耦 IMC 统一初始化 — 设计评审 + 实现详解](<./grace/fw/cli/cp-usart-clock-imc-init-design-review.md>)
- Claude Code 教程（发布版，面向知乎/博客）：[Claude Code CLI 使用教程](<./tools/Claude Code CLI 使用教程.md>)
- Claude Code 进阶教程（发布版，面向知乎/博客）：[Claude Code CLI 进阶教程](<./tools/Claude Code CLI 进阶教程.md>)
- Claude Code 会话策略与记忆（新增，2026-06-16）：[Claude Code 会话策略与跨 session 记忆机制](<./tools/claude-code-session-and-memory.md>)，用于回答"每任务新开 vs 长 session"以及新开后如何用 `--continue`/`--resume`、CLAUDE.md、自动记忆、`/remember` 交接、wiki 落盘把有用的东西带给下一个任务。
- 容器 Claude 交互 401 修复（新增，2026-06-22）：[容器内 Claude Code 交互模式 401 根因与修复](<./tools/容器内 Claude Code 交互模式 401 根因与修复.md>)，docker 容器 `claude` 输密码后交互 TUI 报 `Please run /login · 401`（`-p` 正常），根因是 2.1.18x 交互优先读过期 `claudeAiOauth`；修复=删该块,并在密码门/`heal-claude.sh` 加自动剔除保险。
- Codex 反思与进化：[Codex 反思与进化](<./codex-reflection/index.md>)
- Codex 全局复盘：[全局 Codex 工作流复盘](<./codex-reflection/projects/2026-05-26-global-codex-workflow-review.md>)
- Codex 总结反思：[2026-06-01 Codex 总结反思](<./codex-reflection/projects/2026-06-01-codex-summary-reflection.md>)
- Codex 项目 Session 复盘：[2026-06-01 项目 Session 复盘](<./codex-reflection/projects/2026-06-01-session-project-review.md>)
- Codex Daily Review Skill：[Daily Codex Self-Review Skill](<./codex-reflection/evolution/2026-06-01-codex-daily-self-review-skill.md>)
- Codex 工作流质量门：[两周对话工作流质量门优化](<./codex-reflection/evolution/2026-06-04-workflow-quality-gates.md>)
- Codex 6月5-8工作流复盘：[6月5日到6月8日 Codex 工作流复盘](<./codex-reflection/evolution/2026-06-08-june5-8-workflow-retrospective.md>)
- 总入口：[Wiki 总索引](<./index.md>)
- 芯片栈入口：[GraceC 芯片软硬件栈](<./grace/index.md>)（MAS→FW→KMD 统一入口，含栈图）
- FW 入口：[FW 技术知识库](<./grace/fw/index.md>)
- IMC 入口：[IMC 索引](<./grace/fw/imc/index.md>)
- MAS 入口：[MAS 文档知识库](<./grace/mas/index.md>)
- CLI 入口：[CLI 索引](<./grace/fw/cli/index.md>)
- 维护规则：[Wiki 维护规则](<./meta/wiki-maintenance-rules.md>)
- Wiki/Memory 整理：[2026-06-02 Wiki 与 Memory 整理记录](<./meta/2026-06-02-wiki-memory-maintenance.md>)

## 当前主域

GraceC CP MAS v1.4 + fw CP firmware。远端源码默认以 `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` 为准。

## 最近活跃主题

- **Wiki 大整理（2026-06-18）**：把 `fw/`、`kmd/`、`tiny-kmd/`、`mas/` 四域迁入 `wiki/grace/`，新增 [GraceC 芯片软硬件栈](<./grace/index.md>) 统一入口；合并 IB/stop-flush/CLI 重叠页，3 篇稀薄 debug 页合成 [CP 平台 bring-up 复盘合集](<./grace/fw/debug/CP 平台 bring-up 复盘合集.md>)，`source-maps/` 折叠，`硬件基础 RAM ROM Flash` 移到 synthesis；修全库路径/wikilink/图片深度，重画 Wiki Map。详见 [Wiki Log](<./log.md>)。
- 飞书 lark-cli AI 建文档（新增，2026-06-18）：[从零安装、授权到验证](<./tools/lark-cli-ai-document-guide.md>)。面向未配置任何工具的 AI Agent，要求自行安装 CLI/Skills、读取 `lark-shared`/`lark-doc`、发起链接与二维码授权、使用 v2 创建文档并回读验收。
- **Git fetch known_hosts 与 Docker 共享 SSH 排查**（2026-06-18）：[排查页](<./grace/fw/debug/Git fetch known_hosts 与 Docker 共享 SSH 排查.md>)。80.116 `git fetch` 报 `known_hosts: Permission denied` 时，根因是 `claude-code` 容器以 root 共享 `~/.ssh` 污染属主（不是首次连接）；解法为宿主用独立 `~/.ssh/known_hosts.local` + 仓库级 `core.sshCommand`，勿用全局 config。


- Codex 飞书权限复盘（新增，2026-06-17）：[飞书 Wiki 权限批处理工作流复盘](<./codex-reflection/evolution/2026-06-17-feishu-permission-workflow.md>)，用于提醒飞书权限写操作前先查项目 index/manifest/profile，固件组默认 `openchat oc_4f95921bd0d4d21abac09c0090b21ce9`，Wiki node 失败时 fallback 到 backing docx。
- Codex Skills：[使用地图](<./tools/codex-skills-map.md>)，用于查当前安装 skills、触发场景和选择流程；已补画图专章，区分技术图解 `technical-diagram-generator`、普通位图 `imagegen`、飞书画板 `lark-whiteboard` 以及 SVG/Graphviz/Mermaid 渲染路径。
- 跨机器共享 skills（新增，2026-06-16）：[all_skills:跨机器共享 Claude/Codex Skills 仓库](<./tools/all-skills-shared-repo.md>)，用于回答"一个仓库怎么让多机器的 Claude 和 Codex 都用上同一批 skills"——`sync.py` 编译器、`manifest.json` 安装清单、`collect→多选框→push` 贡献流程、"插件声明依赖不复制 / 撞名仓库优先"去重原则。远端 `git@github.com:shuaishuaiZhu-ai/all_skills.git`。
- 钉钉到飞书迁移：[脚本与 Skills 调用手册](<./tools/dingtalk-feishu-migration-workflow.md>)，用于 Claude/Codex 复用 DWS + lark-cli 迁移流程、权限脚本、附件卡片和流程图修复审计。
- Claude Code CLI：[使用教程](<./tools/Claude Code CLI 使用教程.md>)，**新手友好长文 + 手工 SVG 图解**：五分钟上手、权限模型、CLAUDE.md（user vs 项目级、`/init`）、skills 与 plugins（含 superpowers 实战、官方 marketplace 地址）、hooks/MCP/settings 和排错。
- claude-code-proxy：[项目 Wiki](<./tools/claude-code-proxy/index.md>)，用于回看 ccproxy 安装、provider/model 切换、订阅登录和故障排查。

- RguGCtrl: [RguGCtrl 学习文档：从 Kernel 到 Core 的两级调度](<./grace/mas/RguCore/02-rgu-gctrl.md>)
- GPGPU DVFS：[GPGPU FW DVFS 学习文档](<./grace/fw/performance/dvfs-gpgpu-fw.md>)，重点看状态机、OPP/VF、timing 和面试问答。
- C2C 互联：[C2C 互联学习文档](<./grace/fw/interconnect/c2c-dingtalk-study.md>)，重点看 LD/ST 互联、topo discovery、AMT route、peer mapping 中 `va0/va1/va2` 的归属、MSS/SerDes、loopback/RAS。
- C2C 发包路径：[C2C transaction routing 与 OISA/L2 封装](<./grace/fw/interconnect/c2c-transaction-routing-and-encapsulation.md>)，用于回答 GPU/SDMA/TMA 发起 memory transaction 后，NoC、AMT/top/mesh_router、portmap、C2C adapter、OISA MAC 和 switch L2 外壳分别做什么。
- C2C 子系统结构图：[C2C 子系统结构图拆解](<./grace/fw/interconnect/c2c-macphy-wrapper-subsystem.md>)，用于回答 MACPHY_WRAPPER、Adapter0/1/2、LLRMAC、PCS/FEC、Hss112GX4Wrapper 和 112G SerDes 分层。
- C2C 中的 AXI5：[AXI5 协议详解与 C2C 中 AXI 的作用](<./grace/fw/interconnect/axi5-protocol-and-c2c-role.md>)，用于回答 AXI5 五通道、VALID/READY、burst/ID/atomic，以及 AXI monitor/adapter/NoC 边界在 C2C 中的定位。
- C2C loopback：[近端环回与远端环回详解](<./grace/fw/interconnect/c2c-loopback-near-far.md>)，用于区分 NEP/NES/NES-ext/FEP/FES/FEP-err、Top/Adapter/LLRMAC 环回和测试场景。
- DVFS 更新提醒：DVFS 状态机图已恢复为紧凑的 stateDiagram-v2，保留单行状态名和状态含义表。
- RguGCtrl 阅读提醒：`logic cluster -> block -> core` 是 ClusCtrl 的 cluster 内部调度；GlbCtrl 只负责到 physical cluster 的全局分配。

- IMC 启动：[IMC 启动到 main 流程](<./grace/fw/imc/startup-to-main.md>)
- CP USART/Clock IMC 初始化：[CP USART 与 Core Clock 解耦 IMC 统一初始化（设计评审 + 实现详解）](<./grace/fw/cli/cp-usart-clock-imc-init-design-review.md>)，`zss/MoveUsart` 单一文档，含 IMC 统一初始化 USART1..5、CP 只注册 device/console/shell、core clock 按 `FW_IMC` 分流的设计评审、风险与逐函数图解。
- CLI 卡顿/行编辑：[agc_shell CLI 输入输出路径与 cp master 卡顿分析](<./grace/fw/cli/agc_shell-cli-path.md>)，用于查看输入 ringbuffer、Backspace/Delete、`this_line` 当前行字符串和 argv 组装。
- USART 路径：[Grace USART、RT-Thread console 与 agc_shell 完整链路](<./grace/fw/cli/grace-usart-console-cli.md>)，用于查看 USART 硬件初始化、RT-Thread device 注册、console 输出、shell 输入中断、ringbuffer 和完整触发链路；图解已按 technical-diagram-generator workflow 生成 SVG/PNG 资产。
- CP ringbuffer IPC：[CP ringbuffer IPC 与 queue create 调试](<./grace/fw/debug/CP ringbuffer IPC 与 queue create 调试.md>)，用于区分 IPC shared RB 与 CLI 本地 RB、is_ipc_rb 地址转换、IPC 发送/接收和 queue create 调试流程；图解已按 technical-diagram-generator workflow 生成 SVG/PNG 资产。
- RT-Thread yield：[RT-Thread rt_thread_yield 实现与使用风险](<./grace/fw/rt-thread/rt_thread_yield.md>)
- CP User 调度：[cmd_entry — CP User 调度器](<./grace/fw/cp-user/cmd_entry.md>)
- 分支布局：[cmd_entry branch layout](<./grace/fw/cp-user/cmd_entry-branch-layout.md>)
- stop/flush：[CP stop flush 与 queue 切换](<./grace/fw/cp-user/CP stop flush 与 queue 切换.md>)
- L2C remapping：[L2C Remapping 机制](<./grace/mas/L2C/remapping.md>)

## 写作提醒

新增分析页或技术文档后，必须更新：

1. [Wiki 总索引](<./index.md>)
2. 对应专区索引
3. [Wiki Log](<./log.md>)
4. 本页，如果属于近期活跃主题
- Portmap 路由表：[Portmap 路由表数字图解](<./grace/fw/interconnect/portmap-routing-table.md>)，用于回答 C2C/D2D portmap 表项数字如何由拓扑、下一跳方向、serdes/ucie 编码得到。（已补 C2C 白板图解：第一跳 mask 与策略对比）。

- C2C 钉钉学习文档白板图解：[C2C 互联学习文档](<./grace/fw/interconnect/c2c-dingtalk-study.md>) 已将 Mermaid 讲解图替换为 lark-whiteboard SVG/PNG。
- Mermaid 白板化：已将 71 个学习文档 Mermaid 图解渲染为 lark-whiteboard PNG，并保留 .mmd 源文件；所有目标块已替换。
- Portmap 图解工具对比：[Portmap 路由表数字图解](<./grace/fw/interconnect/portmap-routing-table.md#32-同主题工具对比图>) 已补 G5 第一跳和 8bit mask 的多工具对比产物；当前评估优先采用 lark-whiteboard SVG 和 Graphviz DOT 两版。

- C2C switch 转发规则：[Portmap 路由表数字图解](<./grace/fw/interconnect/portmap-routing-table.md#71-switch-模式转发规则详细图解>) 已补白板图和 Graphviz 判定图，解释跨 GPU 硬件轮询 SerDes、GPU 内跨 die 查 D2D 表。
