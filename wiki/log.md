---
type: meta
title: "Wiki Log"
created: 2026-05-09
updated: 2026-06-08
tags:
  - meta
  - log
status: active
---

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
- Added [CP USART 移到 IMC 统一初始化：代码修改和原因](<./fw/cli/cp-usart-imc-unified-init.md>) with detailed function roles, code modification explanation, address mapping, boot sequence, and debug checklist.
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
