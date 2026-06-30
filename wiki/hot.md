---
type: meta
title: "Hot Cache"
created: 2026-05-09
updated: 2026-06-29
tags:
  - meta
  - hot-cache
status: active
---

- [C2C OISA vs L2 frame format](grace/fw/interconnect/c2c-dingtalk-study.md#13-oisa-格式c2c-l2-格式和-switch-适配)：解释 OISA native frame 和 C2C L2 switch-facing wrapper 的区别，以及为什么两种格式都需要。

# Hot Cache

> 近期上下文缓存。回答问题时先读这里，再进入对应索引页。

## 当前主入口

- **image_tool AddDefault_value 分支设计（新增，2026-06-29）**：[image_tool AddDefault_value 分支设计](<./tools/image_tool AddDefault_value 分支设计.md>)——GitLab 分支 `zss/AddDefault_value`（`cc1a244→756adeb`）技术设计文档：默认值机制、`_check_runtime_deps`、`soc_name` 显式传参、`-j` 去 `argparse.FileType`、启动 chdir、`try/finally`、平台化退出 + 配套文档/spec/openpyxl；5 张图解（SVG+PNG）在 `_attachments/tools/image_tool/`。配套 [[image_tool 固件镜像打包工具]]。
- **UMD 全代码系统化落盘（新增，2026-06-28）**：通读整个 `aigc-driver` 后，[UMD 总览](<./grace/umd/index.md>) 升级为总枢纽（「整体架构」a1 全栈分层/a2 命名空间地图 + 「子系统导航」表），新增 8 个分子系统页：[初始化与设备模型](<./grace/umd/runtime/init-and-device-model.md>)、[kernel launch 全路径](<./grace/umd/runtime/kernel-launch.md>)、[stream/event/signal](<./grace/umd/runtime/streams-events-signals.md>)、[code object 装载与注册](<./grace/umd/compile/code-object-and-registration.md>)、[命令模型与队列](<./grace/umd/dispatch/command-model-and-queue.md>)、[dispatch packet 与 doorbell](<./grace/umd/dispatch/packet-and-doorbell.md>)、[显存分配与内存对象模型](<./grace/umd/memory/allocation-and-memory-model.md>)、[thunk 边界与同步原语](<./grace/umd/platform/thunk-and-sync.md>)。17 张新 Graphviz 图在 `_attachments/grace/umd-arch/`（dot 源在 src/，已逐张视检）。架构事实与既有端到端长文一致（直发 HWS、ring 在 host、单一 0x10）。
- **UMD aicaMemcpy 造命令细读（新增，2026-06-28）**：[aicaMemcpy 怎么造拷贝命令](<./grace/umd/memory/aica-memcpy-copy-command.md>)——`aicaMemcpy` 不是裸 memcpy，而是 `iaicaMemcpy` 解析指针→临时锁页→`createCopyCommand`(`getCopyStrategy` 选 SDMA/TMA/HostStage/WaitHost)→`new DMACopyCommand`→`enqueue`→DIRECT_DISPATCH 当场 `submit`→`VirtualGPU::submitDMACopy`(SDMA)→`awaitCompletion`。含 2 张 Graphviz 图（命令的一生流程图 + getCopyStrategy 决策树，源在 `_attachments/grace/umd-memcpy/`）。单设备 H2D 走 SDMA→DMACopyCommand。
- **UMD 开发维护落盘（新增，2026-06-28）**：[UMD 开发维护：访问、代码结构与构建](<./grace/umd/dev/access-and-build.md>)——aigc-driver 代码在 **80.116 `shuaishuai.zhu@192.168.80.116:~/aigc-driver`**（密码见 secrets 页，勿回显）；git origin `git@192.168.90.119:aigc_toolchain/aigc-driver.git`（默认分支 `develop`）；含 `~/aigc-driver` 完整目录结构 + `build_ex.sh` 构建/单测命令。配套：另一个工作目录 `/root/workspace/umd` 的 `CLAUDE.md` 已写明「代码在远端、怎么连、怎么编、架构」。架构原理仍走 [UMD 总览](<./grace/umd/index.md>)。


- **Kernel 端到端系列（重做 + 扩充，2026-06-26）**：[一个 Kernel 从 .cu 源码到硬件执行的全流程](<./grace/overview/saxpy-kernel-end-to-end.md>) 已**全面重写 + 重绘**——10 张手绘 SVG/Graphviz 图（替换原 Mermaid，源文件在 `_attachments/grace/saxpy-e2e/src/`）、严谨技术风（弱化比喻）、每阶段"面试官会追问"盒子。新增 4 篇配套：[stream/MCQD/HCQD 与命令下发](<./grace/overview/stream-mcqd-hcqd-and-command-submission.md>)、[kernel cmd→CP job cmd 字段映射](<./grace/overview/kernel-cmd-to-cp-job-cmd.md>)、[UMD 总览入口](<./grace/umd/index.md>)、[KMD 面试向深入](<./grace/kmd/appendix/interview-qa.md>)、[CP 固件面试向深入](<./grace/fw/fw-cp-interview-deep-dive.md>)。
  - **关键源码纠正（116 实读 2026-06-26）**：① kernel launch 走 **UMD 直发 HWS**——UMD 自己写 host ringbuffer + 敲 doorbell(MMIO)，KMD 只一次性建场、不经手每包；② ringbuffer 在 **host 内存** 非 VRAM；③ **全栈只有一个 `0x10`**（"两个 0x10"是误判）；④ `AIP_QUEUE_SUBMIT` 当前 `return -EFAULT`（提交禁用），KMD CP 环+kthread 是非主/演进路径，旧 `command-submission-flow.md` 把它当主线是误导；⑤ `aigc_kernel.o_binary` 是 KMD 闭源 x86 blob、**不是 GPU kernel**。`add1` 完成走 MSI-X **向量 40**。
- **KMD 知识库全量重构（2026-06-29）**：[KMD 内核驱动知识库](<./grace/kmd/index.md>) 从原扁平 10 区**重构为线性编号 8 章 + 附录**，按当前 ajthunk 代码核实、面向应届生：[00 大局观](<./grace/kmd/00-big-picture.md>) / [01 架构](<./grace/kmd/01-architecture.md>) / [02 数据结构](<./grace/kmd/02-data-structures.md>) / [03 ioctl-ABI](<./grace/kmd/03-ioctl-abi.md>) / [04 内存页表](<./grace/kmd/04-memory-and-pagetables.md>) / [05 提交-中断](<./grace/kmd/05-submission-events-interrupts.md>) / [06 HAL](<./grace/kmd/06-hal-grace.md>) / [07 构建测试](<./grace/kmd/07-build-and-test.md>) / [08 saxpy 端到端](<./grace/kmd/08-end-to-end-saxpy.md>) + 附录（[术语表](<./grace/kmd/appendix/glossary.md>)/[面试问答](<./grace/kmd/appendix/interview-qa.md>)/[评审](<./grace/kmd/appendix/code-review.md>)）。**12 张图全部改用飞书白板风手绘 SVG**（`_attachments/grace/kmd/diagrams/`，弃用 Graphviz/内联 mermaid）。关键纠偏：`AIP_QUEUE_SUBMIT` 当前 `return -EFAULT`、kernel 提交走 UMD 直发 doorbell、HAL 多块为 bring-up 桩。分支 `wiki/kmd-refactor`（GitHub）。
- **tiny-kmd 架构知识库（新增）**：[tiny-kmd 架构知识库](<./grace/tiny-kmd/index.md>)，最小骨架驱动（ringbuffer IPC + DMA + misc ioctl），含 [对照 ajthunk 的缺口](<./grace/tiny-kmd/gap-vs-ajthunk.md>) 与移植顺序。配套远端代码仓 `aigc-kmd-modular`（ajthunk kmd 模块化抽取 + 移植/重构指南）。
- CP USART/Clock IMC 统一初始化（`zss/MoveUsart` commit `d18bc36`）：[CP USART 与 Core Clock 解耦 IMC 统一初始化 — 设计文档](<./grace/fw/cli/cp-usart-clock-imc-init-design-review.md>)
- Claude Code 教程（发布版，面向知乎/博客）：[Claude Code CLI 使用教程](<ai/tools/claude-code/Claude Code CLI 使用教程.md>)
- Claude Code 进阶教程（发布版，面向知乎/博客）：[Claude Code CLI 进阶教程](<ai/tools/claude-code/Claude Code CLI 进阶教程.md>)
- Claude Code 会话策略与记忆（新增，2026-06-16）：[Claude Code 会话策略与跨 session 记忆机制](<ai/tools/claude-code/claude-code-session-and-memory.md>)，用于回答"每任务新开 vs 长 session"以及新开后如何用 `--continue`/`--resume`、CLAUDE.md、自动记忆、`/remember` 交接、wiki 落盘把有用的东西带给下一个任务。
- 容器 Claude 交互 401 修复（新增，2026-06-22）：[容器内 Claude Code 交互模式 401 根因与修复](<ai/bugs/容器内 Claude Code 交互模式 401 根因与修复.md>)，docker 容器 `claude` 输密码后交互 TUI 报 `Please run /login · 401`（`-p` 正常），根因是 2.1.18x 交互优先读过期 `claudeAiOauth`；修复=删该块,并在密码门/`heal-claude.sh` 加自动剔除保险。
- Codex 反思与进化：[Codex 反思与进化](<ai/reflections/codex/index.md>)
- Codex 全局复盘：[全局 Codex 工作流复盘](<ai/reflections/codex/projects/2026-05-26-global-codex-workflow-review.md>)
- Codex 总结反思：[2026-06-01 Codex 总结反思](<ai/reflections/codex/projects/2026-06-01-codex-summary-reflection.md>)
- Codex 项目 Session 复盘：[2026-06-01 项目 Session 复盘](<ai/reflections/codex/projects/2026-06-01-session-project-review.md>)
- Codex Daily Review Skill：[Daily Codex Self-Review Skill](<ai/reflections/codex/evolution/2026-06-01-codex-daily-self-review-skill.md>)
- Codex 工作流质量门：[两周对话工作流质量门优化](<ai/reflections/codex/evolution/2026-06-04-workflow-quality-gates.md>)
- Codex 6月5-8工作流复盘：[6月5日到6月8日 Codex 工作流复盘](<ai/reflections/codex/evolution/2026-06-08-june5-8-workflow-retrospective.md>)
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

- **C2C Wiki 全量梳理改写（2026-06-26）**：[FW Interconnect 索引](<./grace/fw/interconnect/index.md>) 已改成学习路线；13 个 C2C 页面补读图说明、MAS 证据边界和学习图，新增 overview/frame/adapter/clock/RAS/loopback/source 等图解资产。
- **C2C 面试题精讲（新增，2026-06-22）**：[C2C 面试题精讲（按重要度分梯队）](<./grace/fw/interconnect/c2c-interview-questions.md>)，12 道高频题分三梯队（必考/区分度高/加分）+ 参考答案 + 考点 + 追问 + 优先级表 + "痛点→机制→边界"答题套路；为 VC 死锁、Early response、组包、PFC 水线 4 个难点新增图解（用 lark-whiteboard skill 的 SVG 路由绘制，风格与既有 whiteboard 图统一）。
- **C2C_SS MAS v0.8 权威层（新增，2026-06-22）**：依据官方架构规范 `Grace_c2c_ss_mas_v0.8.docx` 新写 5 篇权威小白页 + 订正 6 篇旧页。先读 [C2C_SS 架构总览](<./grace/fw/interconnect/c2c-ss-architecture-overview.md>)，再到 [帧格式 OISA/L2](<./grace/fw/interconnect/c2c-frame-format-oisa-l2.md>)、[Adapter 内部](<./grace/fw/interconnect/c2c-adapter-internals.md>)、[时钟复位初始化](<./grace/fw/interconnect/c2c-clock-reset-init.md>)、[接口信号 + 中断/RAS](<./grace/fw/interconnect/c2c-interface-signals-and-ras.md>)。复用了 docx 原图（EMF→PNG）。⚠️ **整个 `wiki/grace/fw/interconnect/` + `_attachments/fw/interconnect/` 已加 `.gitignore`，本地专属、不上 GitHub**（故无需脱敏，可写满精度）。重要订正：VC2=写响应/VC3=读响应（MAS §1.3 概括有笔误）；远端环回 FES 项目不支持。
- **Wiki 大整理（2026-06-18）**：把 `fw/`、`kmd/`、`tiny-kmd/`、`mas/` 四域迁入 `wiki/grace/`，新增 [GraceC 芯片软硬件栈](<./grace/index.md>) 统一入口；合并 IB/stop-flush/CLI 重叠页，3 篇稀薄 debug 页合成 [CP 平台 bring-up 复盘合集](<./grace/fw/debug/CP 平台 bring-up 复盘合集.md>)，`source-maps/` 折叠，`硬件基础 RAM ROM Flash` 移到 synthesis；修全库路径/wikilink/图片深度，重画 Wiki Map。详见 [Wiki Log](<./log.md>)。
- 飞书 lark-cli AI 建文档（新增，2026-06-18）：[从零安装、授权到验证](<ai/tools/lark-cli-ai-document-guide.md>)。面向未配置任何工具的 AI Agent，要求自行安装 CLI/Skills、读取 `lark-shared`/`lark-doc`、发起链接与二维码授权、使用 v2 创建文档并回读验收。
- **Git fetch known_hosts 与 Docker 共享 SSH 排查**（2026-06-18 修，**2026-06-24 复发排查**）：[排查页](<./grace/fw/debug/Git fetch known_hosts 与 Docker 共享 SSH 排查.md>)。80.116 `~/fw` `git pull` 报 `known_hosts: Permission denied` 复发。已验证 `core.sshCommand + known_hosts.local` 仍有效（`ssh -v` 走独立文件 `Found key in .../known_hosts.local:2`、`git pull` exit 0），fw git pull 不受影响；**决定性证据**：主 `known_hosts` 被容器 `claude-code-shuaishuai.zhu`（root 共享 `~/.ssh`）**分钟级实时**重写成 root（移走重建为 shuaishuai.zhu 属主后几分钟又 `root:root 600`）。复发触发条件待定（疑似非 core.sshCommand 路径：sudo / 容器内 / `GIT_SSH_COMMAND` / 配置被清）。根治需 sudo 或改容器。

- Codex Skills：[使用地图](<ai/tools/codex-skills-map.md>)，用于查当前安装 skills、触发场景、选择流程和重名来源。
- 跨机器共享 skills（2026-06-16 建，**2026-06-17 v2**）：[all_skills:跨机器共享 Claude/Codex Skills 仓库](<ai/tools/all-skills-shared-repo.md>)，用于回答"一个仓库怎么让多机器的 Claude 和 Codex 都用上同一批 skills"——`sync.py` 编译器、`manifest.json` 全量目录 + 本机启用集、**v2 交互式 TUI**(Textual:分类 tab + 复选框;install 选启用、`push.py` 选提交;无 TTY/未装 textual 自动降级)、"插件声明依赖不复制 / 撞名仓库优先"去重。远端 `git@github.com:shuaishuaiZhu-ai/all_skills.git`。
- 钉钉到飞书迁移：[脚本与 Skills 调用手册](<ai/tools/dingtalk-feishu-migration-workflow.md>)，用于 Claude/Codex 复用 DWS + lark-cli 迁移流程、权限脚本、附件卡片和流程图修复审计。
- Claude Code CLI：[使用教程](<ai/tools/claude-code/Claude Code CLI 使用教程.md>)，**新手友好长文 + 手工 SVG 图解**：五分钟上手、权限模型、CLAUDE.md（user vs 项目级、`/init`）、skills 与 plugins（含 superpowers 实战、官方 marketplace 地址）、hooks/MCP/settings 和排错。
- claude-code-proxy：[项目 Wiki](<ai/tools/claude-code/claude-code-proxy/index.md>)，用于回看 ccproxy 安装、provider/model 切换、订阅登录和故障排查。

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
- CP USART/Clock IMC 初始化：[CP USART 与 Core Clock 解耦 IMC 统一初始化（设计文档）](<./grace/fw/cli/cp-usart-clock-imc-init-design-review.md>)，`zss/MoveUsart` commit `d18bc36`，含 IMC 统一初始化 USART1..5、CP 只注册 device/console/shell、core clock 按 `FW_IMC && !FW_BACKDOOR` 分流的设计、权衡、风险与 SVG/PNG 图解。
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
- 2026-06-26: C2C 图片拆解质量修订：深修 Adapter PktComb 组包图和 MACPHY wrapper 三路径读法，补全多页 MAS/来源图的图内拆解。
