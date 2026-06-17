---
type: meta
title: "Wiki Log"
created: 2026-05-09
updated: 2026-06-13
tags:
  - meta
  - log
status: active
---

## [2026-06-15] add | KMD flows 区新增 8 个逐操作代码流程页（函数级调用链）

- **新增 `wiki/kmd/flows/` 8 页**：把 kmd 代码流程从「时间线」细化到「函数级调用链」，配套远端 ajthunk
  `docs/kmd-step-comments` 分支刚补的函数内 step 注释。新增页：[[device-probe-flow]]、[[device-init-flow]]、
  [[context-create-flow]]、[[mem-create-flow]]、[[pgtable-mapping-flow]]、[[queue-create-flow]]、
  [[command-submission-flow]]、[[completion-interrupt-flow]]。每页含 mermaid 调用链 + 关键步骤（真实函数名/文件）+
  「给应届生」直觉 + 延伸。
- **扩充**：[[saxpy-submission-flow]] 增「逐步深入：每步的代码流程页」导航段并交叉链到上述新页；
  [[wiki/kmd/arch/request-path]] 延伸补链逐操作页；改写 [[wiki/kmd/flows/index|flows 索引]]（总览 + 逐操作两组）。
- 同步更新 [Hot Cache](<./hot.md>)。两份 wiki 都更新：本 vault（Know_any）+ 同步回 ajthunk 仓 `wiki/kmd/`。

## [2026-06-13] add | 新增 tiny-kmd 架构知识库（+ ajthunk kmd 模块化抽取于远端代码仓）

- **新增专区 `wiki/tiny-kmd/`**（8 页，扁平结构）：为最小骨架驱动 tiny-kmd（`/data3/shuaishuai.zhu/tiny_kmd`，
  GitLab `fw/tiny_kmd.git` 分支 `dev`，~2600 行）建架构知识库。覆盖：probe 序列与 `aigc_device` 根结构、
  **ringbuffer IPC（双镜像、64 位消息头、host↔IMC/CP_Master、同步/异步、订阅分发）**、设备/BAR/PCIe ATU/DMA、
  misc 设备与 6 个 ioctl、MSI-X 中断，以及 [[tiny-kmd 对照 ajthunk 的缺口]]（缺页表/队列/调度/fence/HAL/OS 抽象 +
  移植顺序）。全部含 mermaid + `文件:行` 引用。同步更新 [Wiki 总索引](<./index.md>)（结构树 + 入口优先级 + tiny-kmd 快速入口表）与 [Hot Cache](<./hot.md>)。
- **配套（不在本 vault）**：在远端建 `~/aigc-kmd-modular/`——把 ajthunk kmd 按模块忠实抽取成源码树（mem/pagetable/
  queue/sched/interrupt/ctx/ioctl/hal/os）+ 模块文档 + 移植指南 + tiny-kmd 重构指南；由用户用脚本推到 GitHub。

## [2026-06-13] add | 新增 KMD 内核驱动知识库 + kmd 代码评审与注释改进

- **新增专区 `wiki/kmd/`**：为 AIGCIC Grace GPU 的 Linux 内核驱动 `aigc.ko` 建立完整知识库，镜像 `wiki/fw/` 风格、面向应届生。含 hub `index.md` + `env.md` + 10 个子目录（arch/concepts/ioctl/memory/queue/interrupt/os/hal/flows/review，每目录有 `index.md`），共约 30 页：三层架构与请求路径、5 个核心数据结构原子词条（[[aigc_lib_device]]/[[aigc_vdev]]/[[aigc_ctx]]/[[aigc_vm]]/[[mem_handle]]）、ioctl 两级派发与 ABI、内存与 4 级页表、命令队列与调度、MSI-X 中断与 fence、OS 抽象与 conftest、Grace HAL bring-up 状态、saxpy 端到端流程、代码评审。全部含 mermaid 图 + `[[wikilink]]` + `文件:行` 引用；不含测试套件。
- **kmd 代码评审 + 注释改进**（远端 `~/ajthunk/kmd`，分支 `docs/kmd-commenting`）：产出 [[kmd-code-review]]；据评审在 **7 个核心 .c 做 13 处仅注释**修改（`aigc_mem_handle.c` 中文逗号→英文、`aigc_interrupt.c` 删与新注释重复的旧式单行注释、`aigc_hal.c` 多后端 TODO 澄清、`aigc_fops.c`/`aigc_queue_manager.c` 笼统 `TODO` 补说明含 `fill_mcqd_info` 字段、`aigc_drv.c` firmware-ack 向量与 xilinx 绕过说明、`aigc_gcache.c` NUMA/gpuva TODO 澄清）。后续追加 P1/P2：给 `_vm_pgt_cleanup()` 补函数头 + 三层循环不变量注释，给 34 个 `#if 0` 批量补 `/* DISABLED: 原因 */`（fops×19、page_table×9、devm×6）。每轮均 `make FALLBACK_ENABLE=y -j` 通过、`git diff` 仅注释、`grep` 无残留中文字符。注释改动已在 ajthunk 远端 `docs/kmd-commenting` 提交（`0c2596e`、`49bc1fa`）。
- 已同步更新 [Wiki 总索引](<./index.md>)（结构树 + 入口优先级 + KMD 快速入口表）和 [Hot Cache](<./hot.md>)。

## [2026-06-12] reorg | wiki 激进档：flows 三合一 + 命名规范固化

- **fw/flows 三页合一**：`CP event atomic wait host handling`（event/atomic/wait_host 处理）+ `CP 多队列多上下文与 HCQD MCQD`（多 context bring-up）并入 canonical 页 `CP command processing flow.md`，删除前两页。全量修复反链（concepts ×4、cp-master/cp-user/flows index、debug ×2、source-maps、dashboard、synthesis ×2），并 dedup 相邻重复 wikilink。
- **未强合 cmd_entry-branch-layout**：该页是 12k 实测/反汇编深度页（6 变体 + CI 脚本），与 `cmd_entry` 总览职责不同，强合并会降质——保持独立，仅收紧交叉链接。concepts 原子词条同理保持不合并。
- **命名规范固化**：在 [Wiki 维护规则](<./meta/wiki-maintenance-rules.md>) 写入三层命名约定（代码符号页 / 概念词条 / 主题页）与"概念词条保持原子、近义页优先合并、含空格文件名 md-link 用 `<>` 包裹"等规则。判断：对 Obsidian vault 做大规模改名会断 `[[wikilink]]` 图谱、属降质 churn，故以规范文档统一而非改名。
- 修正一次脚本事故：Windows `os.walk` 路径分隔符导致误改 3 个 `sources/` 文件，已 `git checkout` 回退，并把该坑写进删除规则。
- 本档净删除 2 文件（累计本日两档：删 8 增 1，174 → 167）。

## [2026-06-12] reorg | wiki 中等力度整理：合并冗余页 + 优化排布

- **fw/cp-user stop/flush**：`CP queue scheduling stop flush.md` 的"调度优先级视角"+3 张图并入 `CP stop flush 与 queue 切换.md`，删除前者。
- **fw/cp-user cmd_entry**：`CP cmd_entry Candidate V7 调度设计.md`（桩页）的设计要点 + `.raw` 来源清单并入 `cmd_entry.md`，删除桩页。
- **fw/performance**：`CP candidate peek 热路径优化.md` + `CP 分支预取与 cmd_entry 布局优化.md` 两碎页合并为新页 `CP cmd_entry 热路径与分支布局优化.md`，删除原两页。
- **synthesis**：`工具与登录环境经验.md`（来源是 `AI 协作远程编辑经验.md` 的子集）并入后者的"工具与登录环境经验"小节，删除前者。
- **顶层**：`overview.md` 的结构树并入 `index.md`（新增"当前结构"节），删除 `overview.md`。
- 共删除 6 个文件、新增 1 个。已同步更新 [CP User 索引](<./fw/cp-user/index.md>)、[FW 性能索引](<./fw/performance/index.md>)、[Wiki 总索引](<./index.md>) 的"非 FW 内容"表，并全量修复阅读层反向链接（hcqd-scheduling、cmd_entry-branch-layout、两份 synthesis 知识图谱、面试总结、tools/index）。`sources/local-md` 原始镜像与 dated audit/log 历史快照未改动。

## [2026-06-12] add | 新增钉钉到飞书迁移脚本与 Skills 调用手册

- 新增 [钉钉到飞书迁移脚本与 Skills 调用手册](<./tools/dingtalk-feishu-migration-workflow.md>)：沉淀 DWS + lark-cli 迁移工作流、脚本地图、权限脚本、附件卡片原位恢复、流程图/图片修复、审计验收和 Claude 调用注意事项。
- 记录 Feishu profile/App ID `cli_aa9d4e8d9eb91cc4`、固件组群聊 ID `oc_4f95921bd0d4d21abac09c0090b21ce9`、关键 skill 路径和常用命令模板；App Secret 只记录为从 profile/环境变量 `FEISHU_APP_SECRET` 读取，未明文写入 wiki。
- 同步更新 [工具链知识库](<./tools/index.md>)、[Wiki 总索引](<./index.md>) 和 [Hot Cache](<./hot.md>)。

## [2026-06-12] add+merge | CP USART/Clock IMC 统一初始化设计评审文档（合并旧逐函数页）

- 新增并合并为单一文档 [CP USART 与 Core Clock 解耦 IMC 统一初始化 — 设计评审 + 实现详解](<./fw/cli/cp-usart-clock-imc-init-design-review.md>)：基于 `zss/MoveUsart` 当前未提交 diff（HEAD 944c37c），面向 review 人员。
- Part A 设计评审：USART 三层拆分（`hw_config`/`hw_init_only`/`register`/`init`）+ IMC 统一初始化 USART1..5 + core clock 按 `FW_IMC` 编译期分流（IMC 读 boot_info，CP 推导 600M/REF_2）+ `FW_BACKDOOR` guard 移除；含权衡、兼容性、5 项风险（R1-R5）、测试与 checklist。（`test/SConscript` 注释为本地调试、不合入，排除在评审范围外。）
- Part B 实现详解：由原 `cp-usart-imc-unified-init.md` 合并而来，含地址映射、逐函数职责、启动串联、调试顺序与 SVG/PNG 图解。
- **删除** 旧页 `cp-usart-imc-unified-init.md`（内容已并入本文档；`_attachments/fw/cli/cp-usart-imc-unified-init/` 图解目录保留）。同步更新 [CLI 索引](<./fw/cli/index.md>)、[Hot Cache](<./hot.md>) 及旧链接。

## [2026-06-12] add | 新增 Claude Code CLI 进阶教程（发布版）

- 新增 [Claude Code CLI 进阶教程](<./tools/Claude Code CLI 进阶教程.md>)：与基础版同系列的发布版长文（无 frontmatter / wikilink，面向知乎与博客）。
- 覆盖：无头模式与 CLI 参数全解（`-p`、output-format、allowedTools）、会话管理（`-c`/`-r`/fork/`/rewind` checkpoint）、交互隐藏技巧（`!` bash 模式、Ctrl+B 后台、贴图）、权限决策链与规则语法全解、settings/环境变量、自定义命令进阶（`!` 预执行、`$1`、allowed-tools）、Skill/Subagent/Hook 编写（含 PreToolUse 拦截脚本与自动格式化实例）、MCP 作用域与 plugin 打包、git worktree 并行多开、CI/cron 集成、Agent SDK、`/context`/`/cost`/OTEL 观测、进阶排错表。
- 同步更新 [工具链知识库](<./tools/index.md>) 与 [Hot Cache](<./hot.md>)。
- 为进阶教程手绘 5 张 SVG 图解（沿用基础版视觉风格），存于 `_attachments/tools/claude-code/`：`headless-pipeline.svg`（无头模式管道）、`session-lifecycle.svg`（续/分叉/回滚）、`permission-decision.svg`（权限决策链，替换原 ASCII 图）、`hooks-protocol.svg`（hook stdin JSON + exit 0/2 协议）、`worktree-parallel.svg`（worktree 并行多开）。已安装 `@resvg/resvg-js-cli`（npm 全局，命令 `resvg-js`）批量渲染 PNG 并逐张视觉校对；修复 resvg 下 CSS class fill 覆盖 `fill="#ffffff"` 属性导致深色框白字不可见的问题（新增 `.qw`/`.smw` 白字类），并微调 session-lifecycle 回滚标签与 worktree/hooks 两处文字遮挡。5 张 PNG 已就绪，可直接上传知乎/博客。
## [2026-06-11] improve | Claude Code 教程改造为发布版 + 修正全景图箭头 + 引入 karpathy CLAUDE.md

- 把 [Claude Code CLI 使用教程](<./tools/Claude Code CLI 使用教程.md>) 改造为面向知乎/博客外部读者的**单一发布版**：删 frontmatter 与全部 `[[wikilink]]`、删 §18 维护说明，§17 仅留公开 URL；顶部新增**命令/键位速查表**。
- §5：换后端模型的链接由 Obsidian 内链改为 GitHub 地址 `https://github.com/shuaishuaiZhu-ai/claude-code-proxy`。
- §6：个人级 `~/.claude/CLAUDE.md` 由手写范例改为推荐现成模板 [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)（含一行 curl 安装）。
- 用新建的个人 skill `svg-diagrams`（渲染→视觉校对→修正）逐张核对 9 张图：仅 `panorama.svg` 的“你↔Claude”双向箭头在 resvg 下渲染异常（`auto-start-end` 起点头未反向），已改用显式左向 marker + `orient="auto"` 修正；并为全部 9 张图渲染 PNG 存于 `_attachments/tools/claude-code/`（供发布上传）。

## [2026-06-10] fix | Claude Code 教程复审修订

- 复审 [Claude Code CLI 使用教程](<./tools/Claude Code CLI 使用教程.md>)。
- §14 扩为“模型与思考强度”：新增 thinking/effort（`think`/`think harder`/`ultrathink` 关键词 + `/config` 调 effort），并辨析 `ultrathink`（提高思考强度）≠ `/ultraplan`（云端精炼计划）。
- 修正权限规则语法不一致/不准确：统一为官方冒号前缀式 `Bash(命令:*)`（原 §4.2 `Bash(npm run *)`、§16 `Bash(git *)` 空格通配不可靠）。
- §8 增加一句交叉引用：让它“想得更深”用关键词而非 slash 命令。

## [2026-06-10] improve | Claude Code 教程改写为新手友好版 + 手工 SVG 图解

- 把 [Claude Code CLI 使用教程](<./tools/Claude Code CLI 使用教程.md>) 重写为面向完全新手的长文：加“怎么读/五分钟跑通第一次”、全程更细更白话。
- 新增 **CLAUDE.md 专章**：user 级（`~/.claude/CLAUDE.md`）vs 项目级（`./CLAUDE.md`）区别对照、配置用法、`/init` 初始化工作目录全流程、可直接抄的范例。
- 新增 **skills 与 plugins 专章**：讲清 skill/命令/subagent/hooks/MCP 与 plugin 的关系，附官方地址（anthropics/claude-plugins-official、claude.com/plugins），并**以 superpowers 为例**端到端讲安装与工作流（核实 5.1.0 共 14 个 skill）。
- 按 vault 惯例把 9 张 mermaid 全部替换为**手工 SVG**，存于 `_attachments/tools/claude-code/`（panorama、first-run、work-loop、permission-modes、claude-md-layers、init-flow、skills-plugins、superpowers-flow、context-mgmt）。
- 同步更新 [Hot Cache](<./hot.md>)。

## [2026-06-10] add | Claude Code CLI 使用教程

- Added [Claude Code CLI 使用教程](<./tools/Claude Code CLI 使用教程.md>) under 工具链知识库，通用入门到精通教程。
- Covered 安装/更新、登录认证、会话交互与快捷键、核心工作循环、权限模型（模式 + allow/deny 规则）、slash 命令与自定义命令、CLAUDE.md 多层记忆、上下文管理、skills、subagents、hooks、MCP、settings.json、插件、模型选择、Git/GitHub/CI 集成、无头模式/SDK、最佳实践与排错速查。
- 事实经 claude-code-guide 专家 agent 核实；版本易变细节（hooks JSON 格式、settings 键、模型版本）按官方最稳写法处理，并指向 `/help`、`/config`、官方文档为最终事实源。
- Linked the new page from [工具链知识库](<./tools/index.md>) 和 [Hot Cache](<./hot.md>)。按现有惯例未单列进 Wiki 总索引。

## [2026-06-08] add | AXI5 协议详解与 C2C 中 AXI 的作用

- Added [AXI5 协议详解与 C2C 中 AXI 的作用](<./fw/interconnect/axi5-protocol-and-c2c-role.md>) under FW Interconnect / C2C.
- Covered AXI5 five channels, VALID/READY, read/write flows, burst/ID/response, AXI5 optional capabilities, atomic/AWATOP, C2C AXI monitor, and interview Q&A.
- Generated editable SVG plus PNG render assets under `_attachments/fw/interconnect/c2c/axi5-protocol/` and linked the page from C2C 总览、transaction routing、FW/Interconnect 索引、Wiki 总索引和 Hot Cache。
- Added AXI waveform SVG/PNG diagrams for VALID/READY handshake, write AW/W/B timing, and read AR/R timing with RRESP on the R channel.

## [2026-06-08] add | C2C 子系统结构图拆解

- Added [C2C 子系统结构图拆解](<./fw/interconnect/c2c-macphy-wrapper-subsystem.md>) based on the high-resolution `c2c.jpg` source image.
- Preserved the original source image and generated two SVG/PNG learning diagrams for MACPHY_WRAPPER overview and Adapter internal datapath.
- Linked the new page from C2C 总览、transaction routing、FW/Interconnect 索引和 hot cache。
- Expanded [C2C 子系统结构图拆解](<./fw/interconnect/c2c-macphy-wrapper-subsystem.md>) with a front-loaded terminology section covering every visible term in the MACPHY_WRAPPER diagram.

## [2026-06-08] improve | Codex June 5-8 workflow retrospective

- Added [6月5日到6月8日 Codex 工作流复盘](<./codex-reflection/evolution/2026-06-08-june5-8-workflow-retrospective.md>).
- Updated Codex reflection, daily review, and Obsidian vault maintenance skills with read-only exception, missing-daily incident handling, and diagram-skill routing.

## [2026-06-08] add | C2C transaction routing 与 OISA/L2 封装

- Added [C2C transaction routing 与 OISA/L2 封装](<./fw/interconnect/c2c-transaction-routing-and-encapsulation.md>) to explain the runtime path from GPU/SDMA/TMA memory transaction through NoC, AMT/top/mesh_router, portmap, C2C adapter, OISA MAC, optional C2C L2 encapsulation, PCS, and SerDes.
- Generated editable SVG plus PNG diagrams under `_attachments/fw/interconnect/c2c/transaction-routing/`.
- Updated [FW 互联索引](<./fw/interconnect/index.md>), [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>), [FW 技术知识库](<./fw/index.md>), [Wiki 总索引](<./index.md>), and [Hot Cache](<./hot.md>).

## [2026-06-04] improve | Codex workflow quality gates

- Added [两周对话工作流质量门优化](<./codex-reflection/evolution/2026-06-04-workflow-quality-gates.md>).
- Updated Codex reflection, daily review, automation registry, session bootstrap, memory, and Obsidian maintenance skills with read-only boundaries, watchdog checks, acceptance matrices, and source-of-truth gates.

## [2026-06-04] update | CP USART moved to IMC init wiki

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` current source, branch `zss/MoveUsart`, HEAD `944c37c`, with USART migration diff in CP/IMC board files and `drv_usart.c`.
- Added [CP USART 移到 IMC 统一初始化：代码修改和原因] (页面已于 2026-06-12 合并入 [设计评审 + 实现详解](<./fw/cli/cp-usart-clock-imc-init-design-review.md>)) with detailed function roles, code modification explanation, address mapping, boot sequence, and debug checklist.
- Added editable SVG plus PNG render assets for old/new ownership, driver API split, USART address view, and boot sequence under `_attachments/fw/cli/cp-usart-imc-unified-init/`.
- Updated [Grace USART、RT-Thread console 与 agc_shell 完整链路](<./fw/cli/grace-usart-console-cli.md>), [CLI 索引](<./fw/cli/index.md>), [FW 技术知识库](<./fw/index.md>), [Wiki 总索引](<./index.md>), and [Hot Cache](<./hot.md>).

## [2026-06-04] update | agc_shell CLI Backspace 与 line buffer 图解

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` current source, branch `zss/CliOptimize`, HEAD `541207a`.
- Updated [agc_shell CLI 输入输出路径与 cp master 卡顿分析](<./fw/cli/agc_shell-cli-path.md>) with Backspace/Delete handling, `input_buff` raw-byte FIFO semantics, `this_line` current-line string maintenance, and Enter-time `argv` assembly.
- Added editable SVG plus PNG render assets for buffer ownership, Backspace flow, and line-buffer edit examples under `_attachments/fw/cli/agc_shell-cli-path/line-editing/`.
- Updated [CLI 索引](<./fw/cli/index.md>), [FW 技术知识库](<./fw/index.md>), [Wiki 总索引](<./index.md>), and [Hot Cache](<./hot.md>).

## 2026-06-04 - maintain - Obsidian Git and plugin stack installed

- Initialized `C:\home\for_ai` as a local Git repository on branch `main`.
- Installed/enabled `obsidian-git`, `omnisearch`, `text-extractor`, `recent-files-obsidian`, `table-editor-obsidian`, `templater-obsidian`, and `quickadd`; kept `for-ai-image-zoom`.
- Added `.gitattributes` LF rules for Markdown/wiki files.
- Backup before plugin install: `C:\tmp\for-ai-obsidian-before-plugins-20260604-102125.zip`.
- No remote/upstream is configured yet, so Obsidian Git currently provides local version history until remote backup is added.

## [2026-06-03] fix | Diagram skill line-spacing guard and v3 figure cleanup

- Enhanced `technical-diagram-generator` with card text-stack layout rules, `svg-card-layout.cjs`, and a regression fixture for baseline overlap.
- Updated `lint-svg-text-overlap.cjs` so same-card text lines fail on unsafe baseline gaps or approximate glyph-box overlap.
- Repaired and re-rendered the 11 USART/CP ringbuffer `*-v3.svg/png` figures so card text no longer overlaps and connector labels avoid lines.
- Verified the repaired SVG set with the enhanced linter and reviewed the rendered PNG contact sheet plus the shell input path figure.

## [2026-06-03] fix | Removed stale wiki sub-vault configuration

- Backed up and deleted `C:\home\for_ai\wiki\.obsidian`; the active Obsidian vault root is `C:\home\for_ai`.
- Restored the USART and CP ringbuffer diagram links to root-vault `_attachments` paths and removed the duplicate `wiki/_attachments` mirror after confirming no wiki links referenced it.
- Restored the diagram skill default asset location to `C:\home\for_ai\_attachments` while keeping image-link validation for accidental vault escapes.

## [2026-06-03] fix | Wiki image paths made Obsidian-subvault compatible

- Fixed the USART and CP ringbuffer diagram links after Obsidian reported missing `../../../_attachments/...` images when opening `C:\home\for_ai\wiki` as its own vault.
- Mirrored the v3 SVG/PNG assets into `wiki/_attachments/...` and changed the two wiki pages to use `../../_attachments/...`, keeping image and SVG source links inside the active wiki vault.

## [2026-06-03] update | CP ringbuffer wiki diagrams regenerated with diagram skill

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` current source, HEAD `541207a`.
- Regenerated [CP ringbuffer IPC 与 queue create 调试](<./fw/debug/CP ringbuffer IPC 与 queue create 调试.md>) with `technical-diagram-generator` workflow.
- Added SVG source plus PNG render assets for IPC/CLI boundary, IPC init owner, address translation, IPC message flow, and mirror/wrap debug.
- Redrew all CP ringbuffer figures as `*-v3.svg/png` with the batch SVG normalizer and renderer so arrowheads are smaller, connector endpoints land on card borders, and text stays inside boxes.

## [2026-06-03] update | USART wiki diagrams regenerated with diagram skill

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` current source, HEAD `541207a`.
- Regenerated [Grace USART、RT-Thread console 与 agc_shell 完整链路](<./fw/cli/grace-usart-console-cli.md>) diagrams with `technical-diagram-generator` workflow.
- Added SVG source plus PNG render assets for layered overview, init sequence, driver/device split, console output path, shell input path, and IRQ trigger chain.
- Fixed the layered overview figure: reduced SVG arrowhead size, increased card text clearance, and strengthened the diagram skill validator for polyline arrows, oversized markers, and text outside node boxes. Updated the wiki reference to `usart-layered-overview-v2.png` to avoid stale Obsidian image cache.
- Redrew all USART figures as `*-v3.svg/png` with the batch SVG normalizer and renderer, replacing the earlier v2 overview reference and the remaining original diagram references.

## [2026-06-02] update | Grace USART console and agc_shell complete path

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` current source.
- Rewrote [Grace USART、RT-Thread console 与 agc_shell 完整链路](<./fw/cli/grace-usart-console-cli.md>) as a detailed learning guide.
- Added source-backed diagrams and explanations for initialization, `drv_usart_init()`, RT-Thread console output, shell RX interrupt, shell ringbuffer, HAL/device relationships, and debug order.
- Updated [CLI 索引](<./fw/cli/index.md>) and [Hot Cache](<./hot.md>).

## [2026-06-02] update | CP ringbuffer IPC 与 CLI ringbuffer 图解

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` current source.
- Rewrote [CP ringbuffer IPC 与 queue create 调试](<./fw/debug/CP ringbuffer IPC 与 queue create 调试.md>) with source-backed flow diagrams.
- Clarified the difference between IPC shared ringbuffer and agc_shell local input ringbuffer, especially `is_ipc_rb` and `rb_addr_trans()` on CP.
- Updated [FW 调试索引](<./fw/debug/index.md>), [FW 技术知识库](<./fw/index.md>), [Wiki 总索引](<./index.md>), and [Hot Cache](<./hot.md>).

## [2026-06-02] maintain | Wiki and memory maintenance

- Added [Wiki 与 Memory 整理记录](<./meta/2026-06-02-wiki-memory-maintenance.md>).
- Normalized UTF-8 BOM on core wiki navigation pages so Windows-facing previews do not show Chinese mojibake.
- Added a memory ad-hoc note instead of editing `MEMORY.md` directly.
- Redrew the USART address/device map in [Grace USART、console 与 agc_shell 路径图解](<./fw/cli/grace-usart-console-cli.md#3-地址与设备映射>) as hand-routed SVG/PNG so arrows avoid group titles and node text.

## [2026-06-01] add | Grace USART console and agc_shell wiki

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/`.
- Added [Grace USART、console 与 agc_shell 路径图解](<./fw/cli/grace-usart-console-cli.md>) with address mapping, board init sequence, driver/HAL/device relationships, RX/console Mermaid diagrams, and a debug checklist.
- Updated the page to use lark-whiteboard-rendered PNG diagrams under `_attachments/fw/cli/grace-usart-console-cli/whiteboard-mermaid/`, with editable `.mmd` sources preserved next to each image.
- Updated [CLI 索引](<./fw/cli/index.md>), [FW 技术知识库](<./fw/index.md>), [Wiki 总索引](<./index.md>), and [Hot Cache](<./hot.md>).
- Key insight: current tracked source still has `drv_usart_init()` doing hardware init and RT-Thread device registration together; IMC-unified CP USART init would need a hardware-only path and a register-only path.

## [2026-06-01] add | Daily Codex self-review skill

- Added `codex-daily-self-review` as the dedicated daily review skill for all project-level Codex sessions in the target window.
- Added AGENTS.md decision gates for project-set versus global guidance, while keeping edits proposal-only unless explicitly approved.

## [2026-06-01] add | Project session review

- Added [2026-06-01 项目 Session 复盘](<./codex-reflection/projects/2026-06-01-session-project-review.md>) after filtering session_index for 2026-05-26..2026-06-01 and safely summarizing 34 unique session JSONL files by project group.
- Covered ctrlclaw/ComfyUI, Codex/Hermes skills, fw/kernel/UMD, DingTalk-to-Feishu migration, and C2C wiki work with completion, gaps, verification evidence, risks, Codex behavior, and next steps.

## [2026-06-01] add | Codex summary reflection

- Added [2026-06-01 Codex 总结反思](<./codex-reflection/projects/2026-06-01-codex-summary-reflection.md>) after reviewing the previous global reflection, automation memory, session_index summaries, MEMORY.md rules, and wiki log/hot state.
- Recorded that Daily Review output appears to have stopped after 2026-05-25 and normalized frontmatter position while updating touched wiki navigation files.

- 2026-06-01: Expanded [C2C PHY 近端环回与远端环回详解](<./fw/interconnect/c2c-loopback-near-far.md#44-soc-数据和-bist-数据有什么区别>) with a SoC data vs BIST data comparison for C2C loopback debugging.
- 2026-05-29: Added [C2C PHY 近端环回与远端环回详解](<./fw/interconnect/c2c-loopback-near-far.md>) from DingTalk 10.9 loopback source, explaining NEP/NES/NES-ext/FEP/FES/FEP-err and Top/Adapter/LLRMAC loopback boundaries.
- 2026-05-29: Added C2C switch forwarding rule diagrams to [Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md#71-switch-模式转发规则详细图解>) and linked them from [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md#71-switch-模式转发规则补图>).
- 2026-05-28: Recorded user evaluation that lark-whiteboard SVG and Graphviz DOT are the best G5 first-hop 8bit mask diagram variants in [Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md#32-同主题工具对比图>).
- 2026-05-28: Added G5 first-hop 8bit mask diagram tool comparison assets to [Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md#32-同主题工具对比图>), covering lark-whiteboard SVG, Mermaid, D2, Graphviz DOT, and PlantUML source boundary.
- 2026-05-27: Converted 71 Mermaid diagrams in authored learning wiki pages to lark-whiteboard-rendered PNG assets with .mmd sources.
- 2026-05-27: Optimized [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>) by replacing six Mermaid explanation diagrams with lark-whiteboard-style SVG/PNG assets.
- 2026-05-27: Optimized [Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md>) with lark-whiteboard-style C2C SVG/PNG diagrams for first-hop mask and routing strategy comparison.
## [2026-05-27] add | Portmap route-table number walkthrough

- Added [Portmap 路由表数字图解](<./fw/interconnect/portmap-routing-table.md>) from `C:\home\for_ai\portmap方案.drawio`.
- Explained how C2C 8bit masks and D2D `0/1` values are derived from topology, next-hop routing policy, and serdes/ucie encoding, with Mermaid diagrams and evidence boundaries.
- Archived the source draw.io file under `.raw/mas/portmap/` and updated FW interconnect indexes plus Hot Cache.

## [2026-05-26] update | C2C OISA vs L2 frame format
- Expanded section 13 with a clearer explanation of OISA native frame vs C2C L2 switch-facing wrapper.
- Added an interview Q&A for why both frame formats are needed.

## [2026-05-26] fix | C2C page prefix restored and PNG placed in section 8
- Restored sections 1-8 after an incorrect replacement placed the peer mapping image at the page head.
- Kept peer mapping as PNG embedding in section 8 and retained the Mermaid source under .raw.

## [2026-05-26] update | C2C peer mapping PNG restored
- Restored the peer mapping sequence to PNG image embedding for better readability.
- Kept Mermaid source at `.raw/dingtalk/c2c/peer-mapping-d2d-copy-sequence.mmd` for future edits.
## [2026-05-26] fix | C2C peer mapping Mermaid note syntax
- 将 peer mapping 时序图里的 Note 步骤分隔从分号改为 <br/>，避免 Obsidian Mermaid sequenceDiagram parser 把分号误判为语句结束。
- 保持 wiki 正文和 .raw/dingtalk/c2c/peer-mapping-d2d-copy-sequence.mmd 源码一致。

## [2026-05-26] update | C2C peer mapping Mermaid source

- Changed [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>) to render the peer mapping sequence directly from Mermaid source instead of embedding a PNG/SVG image.
- Updated the source file at `.raw/dingtalk/c2c/peer-mapping-d2d-copy-sequence.mmd` and removed the generated peer-mapping image attachments from wiki usage.


## [2026-05-26] fix | C2C peer mapping original-style sequence

- Regenerated the peer mapping D2D copy diagram in [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>) with the same layout style as the source image: left-side notes, lifelines, activation bars, right-side device1 notes, and the corrected `va0 + va2` copy trigger.


## [2026-05-26] add | Global Codex workflow review

- Added [全局 Codex 工作流复盘](<./codex-reflection/projects/2026-05-26-global-codex-workflow-review.md>) after a skill-guided review of Daily Review notes, automation memory, Obsidian reflection archive, MEMORY.md rules, and session_index summaries.
- Captured follow-up rules for reflection archiving, evidence boundaries, UTF-8 verification, automation trigger validation, and safe session summarization.
## [2026-05-26] update | C2C peer mapping VA correction

- Updated [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>) with a corrected Mermaid sequence for device0/device1 peer memory allocation and D2D copy.
- Recorded the correction that device0-triggered kernel TMA / SDMA D2D copy should use `src=va0` and `dst=va2`, not `va1`; `va1` belongs to device1 VA space while `va2` is device0's peer mapping to remote `pa1`.


## [2026-05-25] redo | C2C wiki source-image rebuild

- Rebuilt [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>) after review: removed whole-page screenshots from wiki attachments and replaced them with DingTalk image-element captures under _attachments/fw/interconnect/c2c/source/.
- Re-extracted all 11 DingTalk docs into .raw/dingtalk/c2c/raw and recorded explicit evidence boundaries: text extraction is complete, image OCR is only complete for embedded/inspected source-image crops.
- Added source topology figures for 10.10, OISA/MegaNIC/OISA-Switch figures for 10.2, MSS figures for 10.7, RAS monitor fragments for 10.6, L2 EthType evidence for 10.8, and loopback flow evidence for 10.9.


## [2026-05-25] fix | C2C topology diagrams and image attachment paths

- Added topology diagrams to [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>): 4 GPU / 3 port direct full-mesh, 2DIE package view, and direct-connect vs switch mental model.
- Moved readable C2C images from raw evidence paths into Obsidian attachments under `_attachments/fw/interconnect/c2c/` and updated image links so preview mode can render them.

## [2026-05-25] fix | C2C wiki review corrections

- Corrected C2C wiki evidence boundaries after parallel-agent and live DingTalk review: only text extraction is complete; 10.7/10.10 screenshots are now archived but not OCR-complete.
- Tightened AMT wording, ACK/re-ACK direction, loopback test-point diagram, AI ID inference boundary, and added missing 10.1/10.3/10.4/10.5/10.6/10.9 details.
- Fixed Hot Cache indentation so DVFS and GCtrl reminders are not nested under the C2C topic.

## [2026-05-25] add | C2C interconnect DingTalk study wiki

- Added [C2C 互联学习文档](<./fw/interconnect/c2c-dingtalk-study.md>) from the DingTalk `10.C2C` directory, starting at `10.1` and including the `AI集群ID基础设施调研` child page.
- Archived raw extracts, the 10.2 visual snapshot, and Understand Anything graph output under `.raw/dingtalk/c2c/`.
- Added [FW Interconnect 索引](<./fw/interconnect/index.md>) and linked it from the root FW indexes.

## [2026-05-25] update | Restore compact DVFS state diagram

- Restored the DVFS state machine diagram in [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>) from the larger `flowchart TD` version back to compact `stateDiagram-v2`.
- Kept single-line state labels and the separate state explanation table to avoid literal newline rendering issues.
## [2026-05-25] fix | DVFS FSM diagram label clarity

- Reworked the state machine diagram in [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>) from `stateDiagram-v2` to a clearer `flowchart TD` layout.
- Split timeout/regulator/PLL errors into dedicated `ERR` nodes with dashed rollback paths so error labels no longer look attached to normal clock-ok paths.
## [2026-05-25] update | DVFS terminology quick reference

- Added a front-of-page terminology table to [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>).
- Covered governor, transition FSM, OPP, glitchless, PLL, divider, rollback, debounce, NoC backpressure, self-refresh, PCIe completion, and timing violation.


## [2026-05-22] add | Codex automation registry check skill

- Added `codex-automation-registry-check` as a Codex skill for verifying automation config, scheduler-known ID, actual run evidence, output artifacts, and inbox/final delivery.
- Added [Codex Automation Registry Check Skill](<./codex-reflection/evolution/2026-05-22-codex-automation-registry-check-skill.md>) to the Codex reflection archive.

## [2026-05-22] add | ccproxy convergence review skill

- Added `ccproxy-project-convergence-review` as a Codex skill for consolidating ccproxy / Claude Code Proxy subtask results into one evidence-backed status matrix, gap list, and validation plan.
- Added [ccproxy 项目收敛 Review Skill](<./codex-reflection/evolution/2026-05-22-ccproxy-project-convergence-review-skill.md>) to the Codex reflection archive.

## [2026-05-22] add | Daily Codex Self-Review archive

- Added [2026-05-22 Daily Codex Self-Review](<./codex-reflection/daily/2026-05-22.md>) to the Codex reflection archive.
- This is the first manual run after enabling `codex-reflection-archiver` dual-write to Obsidian.

## [2026-05-22] update | DVFS VRAM access handling and memory states

- Expanded [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>) with device memory / VRAM DVFS access handling.
- Added diagrams for NoC backpressure, outstanding drain, queued PCIe/NoC reads, and memory OPP switching.
- Added a VRAM/device memory state table covering active, power-down, self-refresh, frequency-change, training, retention, and power-off states.


## [2026-05-22] add | Codex reflection and evolution archive

- Added [Codex 反思与进化](<./codex-reflection/index.md>) as the canonical Obsidian area for Daily Codex Self-Review, project retrospectives, and automation/prompt/skill evolution notes.
- Added subdirectories: `daily/`, `projects/`, and `evolution/`.
- New rule: any Codex self-reflection, summary reflection, project retrospective, or evolution document should create a corresponding Markdown page in this area.

## [2026-05-22] add | claude-code-proxy 项目 wiki 镜像

- Added Obsidian mirror: [claude-code-proxy 项目 Wiki](<./tools/claude-code-proxy/index.md>).
- Copied bilingual project wiki pages from the local repository and saved README SVG assets under `_attachments/tools/claude-code-proxy/`.
- Updated [工具链知识库](<./tools/index.md>) and [Hot Cache](<./hot.md>) for quick navigation.

## [2026-05-22] update | DVFS governor debounce and glitchless switching

- Expanded [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>) with governor jitter causes, hysteresis/debounce methods, and a simplified FW policy loop.
- Added DVFS glitch/glitchless switching notes plus PLL lock and reset release timing guidance.
- Added interview Q&A for governor debounce, clock glitches, glitchless meaning, and reset behavior while PLL is unlocked.

## [2026-05-22] fix | DVFS state diagram Mermaid labels

- Fixed [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>) stateDiagram labels that rendered literal `\n` in Obsidian.
- Replaced multiline state labels with single-line labels and added a state explanation table.

## [2026-05-22] fix | Obsidian navigation links

- Reworked core wiki navigation pages from Obsidian wikilinks to explicit relative Markdown links so index pages can be clicked reliably from the `C:\home\for_ai` vault root.
- Set `.obsidian/app.json` to use Markdown links for new links and kept automatic link updates enabled.
- Validation target: all Markdown navigation links in framework pages must resolve to real files under the vault.

## [2026-05-22] update | DVFS timing/divider/PLL deep dive

- Expanded [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>) with timing violation consequences, clock divider explanation, and PLL configuration flow diagrams.
- Added interview Q&A for divider and PLL setup, plus debug checks for mux/divider readback and safe-clock rollback.

## [2026-05-22] add | GPGPU FW DVFS learning wiki

- Added [GPGPU FW DVFS 学习文档](<./fw/performance/dvfs-gpgpu-fw.md>) for interview-oriented DVFS learning.
- Covered OPP/VF relationship, GPGPU DVFS transition state machine, voltage/frequency ordering, timing closure, voltage-combination risks, debug checklist, and interview Q&A.
- Updated FW performance/concepts indexes, FW/root index, and hot cache.

## [2026-05-21] update | RguGCtrl 职责边界表达优化

- 优化 [RguGCtrl 学习文档](<./mas/RguCore/02-rgu-gctrl.md>) 的开头、流程图、FAQ 和速记版，明确 GCtrl 是 GlbCtrl + ClusCtrl 的总称。
- 补清职责边界：`kernel -> logic cluster -> physical cluster` 属于 GlbCtrl 全局调度；`logic cluster -> block -> core` 属于 ClusCtrl 的 cluster 内部调度。

## [2026-05-20] update | RguGCtrl clusterIdx/blockIdx and interview notes

- Expanded [RguGCtrl 学习文档](<./mas/RguCore/02-rgu-gctrl.md>) with `clusterIdx` / `blockIdx` roles, why they are issued separately, and diagrams for the two scheduling levels.
- Added interview answer templates covering physical vs logic cluster, index dispatch, `cluster_ctrl`, and the NVIDIA SM scheduler analogy boundary.

## [2026-05-20] update | RguGCtrl detailed learning wiki

- Source: `C:\work\mas\RguCore\RGU_Design_Spec_RguGCtrl_V1.0.docx`.
- Expanded [RguGCtrl 学习文档：从 Kernel 到 Core 的两级调度](<./mas/RguCore/02-rgu-gctrl.md>) into a detailed, beginner-friendly guide.
- Added source-derived diagrams under `C:\home\for_ai\_attachments\mas\RguCore\gctrl\`.
- Key learning: GCtrl should be read as a two-level scheduler: GlbCtrl maps kernel/logic-cluster work to physical clusters; ClusCtrl maps logic-cluster blocks to cores and reports completion upward.

# Wiki Log

## [2026-05-19] analysis | IMC startup to main wiki

- Source: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/`.
- Added [IMC 索引](<./fw/imc/index.md>) and [IMC 启动到 main 流程](<./fw/imc/startup-to-main.md>).
- Updated [Wiki 总索引](<./index.md>), [FW 技术知识库](<./fw/index.md>), [Hot Cache](<./hot.md>), and [Wiki 维护规则](<./meta/wiki-maintenance-rules.md>).
- Key insight: IMC does not jump directly to C `main`; the real path is `_start -> entry -> rtthread_startup -> scheduler -> main_thread_entry -> main -> rt_hw_board_pos_init`, and IMC IPC service is established in `main()` via `rt_hw_board_pos_init()`.

## [2026-05-17] ingest | L2C programming PDF and remapping wiki

- Source: `C:\work\reg_table\L2C 编程说明_v0.1.pdf`.
- Installed local `pdf` skill and Python PDF dependencies (`pdfplumber`, `pypdf`, `pypdfium2`) for higher quality PDF extraction and page rendering.
- Raw extraction and rendered remapping pages: `C:\home\for_ai\.raw\mas\L2C\`.
- Added [L2C 编程说明](<./mas/L2C/README.md>) and [L2C Remapping 机制](<./mas/L2C/remapping.md>).
- Key insight: L2C remapping maps bus addresses to physical `dram_channel/bank/part/axi_channel`; it is required for normal physical address correctness, bad-block/BIST remap, interleaving, and error detection. Disabling remapping is only for debug/LTC pass-through paths.

## [2026-05-14] restructure | canonical index and FW routing

- 建立 `wiki/index.md` 作为唯一总索引，`wiki/fw/index.md` 作为 FW 唯一专区索引。
- 新增 FW 子索引：CP Master、CP User、CLI、RT-Thread、Concepts、Flows、Performance、Debug、Source Maps、Learnings。
- 将 FW 技术页从旧 `topics/`、`entities/`、部分 `synthesis/` 迁入 `wiki/fw/` 对应目录。
- 将 `agc_shell-cli-path.md` 从 `cp-master/` 移到 `fw/cli/`，避免 CLI 页面藏在 CP Master 下。
- 删除旧兼容索引别名：`Wiki Index.md`、`Wiki Log.md`、`Hot Cache.md`、`CP MAS 知识图谱入口.md`、`wiki/fw/index.md`。
- 删除重复的 `wiki/fw/cp-user/cmd_entry.md`，保留 `wiki/fw/cp-user/cmd_entry.md` 作为 cmd_entry 权威页。
- 新增 [Wiki 维护规则](<./meta/wiki-maintenance-rules.md>)：以后新增分析/技术文档必须更新总索引和对应专区索引。## [2026-05-09] cleanup | high-quality review and optimization

- 修复 6 处具体 bug：`00 入口` 列表序号错乱；mermaid 单反引号；fw 4 处 wikilink 死链；env.md `[[INDEX]]` 大小写；index.md 内容滞后。
- 删除 `wiki/sources/local-md/`（44 文件 / 280KB），原始归档已在 `.raw/local-md/`，违反 "wiki = AI 知识" 规则。
- 合并重复 topic：`CP queue scheduling stop flush.md` → `CP stop flush 与 queue 切换.md`（保留更详细的版本，吸收 MAS 视角和 sf_drop_hcqd_packets 描述）。
- 移动 3 个 topic → synthesis：`CP cmd_entry Candidate V7 调度设计`、`AI 协作远程编辑经验`、`工具与登录环境经验`（每个聚合 5+ 来源）。
- 删除 7 个空目录：`comparisons/`、`concepts/`、`decisions/`、`dependencies/`、`flows/`、`modules/`、`questions/`。
- Schema 标准化：给 fw/ 全部 7 页加 frontmatter（type/title/created/updated/tags/status）；4 个 Schema A 文件迁到 Schema B；entities/ 9 页升级到完整 schema；sources/* 用 wikilink 形式的 related。
- Tags 统一：从 `[entity, CP, ...]` 改为小写 + snake_case `[entity, cp, ...]`。
- 更新 `wiki/index.md` 包含全部 25+ 主题；重写 `hot.md` 反映实际活跃主题。
- 更新 dashboard.md 文件夹模型描述，移除已删目录引用。
- Canvas `Wiki Map.canvas` 更新 stop flush 节点指向；完整重画未做（仍只覆盖 8 个核心节点）。
- 注意：`_learning_guides/` 是 89 页自动生成的学习卡片镜像，需在 wiki 改动后重新生成。

## [2026-05-09] ingest | local markdown import from C:\home\shuaishuai.zhu

- Source: [本地 Markdown 文件索引](<./sources/本地 Markdown 文件索引.md>)
- Imported: 44 Markdown files, including .claude learnings/retros and empty placeholder files.
- Raw files: C:\home\for_ai\.raw\local-md\C-home-shuaishuai.zhu\
- Wiki mirror: C:\home\for_ai\wiki\sources\local-md\C-home-shuaishuai.zhu\
- Added: [C-home-shuaishuai-zhu Markdown 知识图谱](<./synthesis/C-home-shuaishuai-zhu Markdown 知识图谱.md>), [CP cmd_entry Candidate V7 调度设计](<./fw/cp-user/CP cmd_entry Candidate V7 调度设计.md>), [aigc_sdk Bug 扫描与修复优先级](<./fw/debug/aigc_sdk Bug 扫描与修复优先级.md>), [AI 协作远程编辑经验](<./synthesis/AI 协作远程编辑经验.md>), [image_tool 固件镜像打包工具](<./tools/image_tool 固件镜像打包工具.md>), [工具与登录环境经验](<./synthesis/工具与登录环境经验.md>).
- Key insight: local Markdown combines CP firmware design/review artifacts with AI collaboration retros, so it should be read as both technical knowledge and workflow memory.

## [2026-05-09] ingest | Yuque work notes to Obsidian graph

- Source: [语雀工作笔记索引](<./sources/语雀工作笔记索引.md>)
- Captured: 11 logged-in Yuque work notes from 2025-08 to 2026-05.
- Raw files: `C:\home\for_ai\.raw\yuque\work-notes\`
- Added: [语雀工作笔记知识图谱](<./synthesis/语雀工作笔记知识图谱.md>), [面试用工作笔记总结](<./synthesis/面试用工作笔记总结.md>)
- Added topics: [CP candidate peek 热路径优化](<./fw/performance/CP candidate peek 热路径优化.md>), [CP 分支预取与 cmd_entry 布局优化](<./fw/performance/CP 分支预取与 cmd_entry 布局优化.md>), [CP stop flush 与 queue 切换](<./fw/cp-user/CP stop flush 与 queue 切换.md>), [CP SDMA copy 与 kernel command 调试](<./fw/debug/CP SDMA copy 与 kernel command 调试.md>), [CP 多队列多上下文与 HCQD MCQD](<./fw/flows/CP 多队列多上下文与 HCQD MCQD.md>), [CP ringbuffer IPC 与 queue create 调试](<./fw/debug/CP ringbuffer IPC 与 queue create 调试.md>), [CP 平台 bring-up 与 PCIe 调试](<./fw/debug/CP 平台 bring-up 与 PCIe 调试.md>), [硬件基础 RAM ROM Flash](<./fw/concepts/硬件基础 RAM ROM Flash.md>).
- Key insight: the work notes form a coherent CP firmware story from platform bring-up to queue scheduling and hot-path performance optimization.

## [2026-05-09] restructure | Default Obsidian vault

- Source: [GraceC CP MAS v1.4](<./sources/GraceC CP MAS v1.4.md>), [fw CP user firmware code summary](<./sources/fw CP user firmware code summary.md>)
- Changed: `C:\home\for_ai` is now the Obsidian vault root.
- Removed: web graph HTML/JS assets and old llm-wiki tool directories.
- Added: [CP MAS 知识图谱入口](<../00 CP MAS 知识图谱入口.md>), [Wiki Map.canvas](<./Wiki Map.canvas>), [Wiki Index](<./index.md>), [Hot Cache](<./hot.md>).
- Key insight: Use Obsidian native backlinks, graph view, canvas, and markdown pages as the default knowledge interface.

## [2026-05-28] add | Codex Skills usage map

- Added [Codex Skills 使用地图](<./tools/codex-skills-map.md>) with the current global and enabled-plugin skills inventory, usage rules, scenario lookup table, and Mermaid selection flow.
- Updated the tools index, wiki root index, and Hot Cache for navigation.

## [2026-06-16] add | Claude Code session strategy & cross-session memory

- Added [Claude Code 会话策略与跨 session 记忆机制](<./tools/claude-code-session-and-memory.md>): 默认"每任务新开 session"的结论与 context rot 原因、新开 vs 长 session 对比表、`/clear`·`/compact`·`/rewind`·subagent 的进程内上下文管理,以及跨 session 记忆六层机制(`--continue`/`--resume`、CLAUDE.md、自动记忆 Session Memory、`/remember` 交接、wiki 落盘、MCP 记忆)与选型速查。
- Updated the tools index and Hot Cache for navigation.
- Key insight: 新开 session 后内容并非真丢——要带给下一个任务的东西应沉淀到 CLAUDE.md / 自动记忆 / 交接文件 / wiki,而不是留在会话历史里。

## [2026-06-16] add | all_skills cross-machine shared skills repo

- Added [all_skills:跨机器共享 Claude/Codex Skills 仓库](<./tools/all-skills-shared-repo.md>): 单一真相源 `SKILL.md` + 零依赖 `sync.py` 编译器(install/collect/push/add/doctor/uninstall);Claude 复制进 `~/.claude/skills/` + `claude plugin install`,Codex 在 `~/.codex/AGENTS.md` 生成路由(插件 skill 指向缓存正本);`manifest.json` 单文件安装清单;贡献流程 `collect → 多选框 → push`;去重原则"插件声明依赖不复制、撞名仓库优先"。
- 配套远端仓库 `git@github.com:shuaishuaiZhu-ai/all_skills.git`(分支 `main`),本机已 install 验证 + 清掉 9 个 Cloudflare 个人重复副本。
- Updated the tools index, wiki root index, and Hot Cache for navigation.
- Key insight: 跨工具共享 skills 的关键是"插件归插件、仓库归仓库"——有插件形态的只声明依赖让云端做正本,仓库只 vendor 手写、插件没有的 skill。

## [2026-06-17] update | all_skills v2:交互式 TUI(install 选启用集 + push 选提交)

- 更新 [all_skills:跨机器共享 Claude/Codex Skills 仓库](<./tools/all-skills-shared-repo.md>) 到 v2:install/push 改用 **Textual TUI**(分类 tab + 复选框,←/→ 切分类、↑/↓ + 空格勾选);未装 textual / 非 TTY / `--no-tui` 自动降级为 stdlib 编号选择。
- install 先选**本机启用集**(存 `~/.agent-skills/selection.json`,不改共享 manifest;勾的复制、取消的移除、Codex 路由只列勾选);分类=混合(默认按来源,manifest `category` 覆盖)。新增 `push.py` 贡献脚本(自动收集 新增/更新 → 复选框 → commit&push)。
- Key insight: TUI 标准化在脚本里(Textual + run_test 可 headless 验证),比"交给代理渲染复选框"更通用;`--only` 须用 `is not None` 判定,空串别当交互(踩过坑:误提交)。
