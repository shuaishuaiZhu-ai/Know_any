---
type: source-index
title: "本地 Markdown 文件索引"
created: 2026-05-09
updated: 2026-05-22
tags:
  - source
  - local-md
  - obsidian
status: active
---

# 本地 Markdown 文件索引

来源目录：`C:\home\shuaishuai.zhu`
整理时间：2026-05-09
文件数量：44 篇 Markdown，其中空文件 3 个。

## 存放规则

- **原始归档**（只读，规范位置）：`C:\home\for_ai\.raw\local-md\C-home-shuaishuai.zhu\`
- **清单文件**：`C:\home\for_ai\.raw\local-md\c-home-shuaishuai.zhu-manifest.json`
- 早期版本曾在 `wiki/sources/local-md/` 留过 wiki 镜像；2026-05-09 已删除（与 `.raw/` 完全重复，违反 "wiki = AI 知识" 规则）。

## 分类统计

- AI 协作 / 远程编辑经验：11 篇
- aigc_sdk 缺陷扫描：2 篇
- Claude learning / retro：24 篇
- CP stop / flush：1 篇
- CP 调度 / cmd_entry：1 篇
- fw 其他文档：2 篇
- image_tool 镜像工具：2 篇
- 个人/杂项：1 篇

## 推荐入口（AI 整理后的 wiki 页）

- [C-home-shuaishuai-zhu Markdown 知识图谱](<../synthesis/C-home-shuaishuai-zhu Markdown 知识图谱.md>) — 三条主线（CP / image_tool / 协作经验）综合视图
- [CP cmd_entry Candidate V7 调度设计](<../fw/cp-user/CP cmd_entry Candidate V7 调度设计.md>) — 汇总 cmd_entry、candidate、pending、round-robin
- [aigc_sdk Bug 扫描与修复优先级](<../fw/debug/aigc_sdk Bug 扫描与修复优先级.md>) — 汇总两份 bug/check 报告
- [AI 协作远程编辑经验](<../synthesis/AI 协作远程编辑经验.md>) — 汇总 .claude/learnings 与 retros 中的可复用方法
- [image_tool 固件镜像打包工具](<../tools/image_tool 固件镜像打包工具.md>) — 汇总 image_tool README 与架构文档

## 空文件

- `ajthunk\清明自驾游路线规划2026-流程图.md`
- `fw\wait_host_cmd_architecture.md`
- `fw\wait_host_cmd_review_report.md`

## 全量文件（路径相对 `.raw/local-md/C-home-shuaishuai.zhu/`）

| 分类 | 路径 | 标题 | 大小 |
|---|---|---|---:|
| Claude learning / retro | `ajthunk\.claude\learnings\agent-browser-no-sudo-install.md` | agent-browser Installation Without sudo | 689 |
| Claude learning / retro | `ajthunk\.claude\learnings\agent-browser-windows-edge-workaround.md` | agent-browser on Windows: Use Edge Instead of Chrome | 1296 |
| Claude learning / retro | `ajthunk\.claude\learnings\feishu-requires-auth.md` | Feishu Documents Require Authentication | 587 |
| Claude learning / retro | `ajthunk\.claude\learnings\ssh-windows-path-export-issue.md` | SSH One-liner PATH Export Fails with Windows Paths | 604 |
| Claude learning / retro | `ajthunk\.claude\retros\2026-03-30-1935.md` | Session Retrospective — 2026-03-30 19:35 | 1840 |
| 个人/杂项 | `ajthunk\清明自驾游路线规划2026-流程图.md` | 清明自驾游路线规划2026-流程图 | 0 |
| Claude learning / retro | `fw\.claude\learnings\2026-03-31-hcqd-v3.md` | Learning: HCQD Round-Robin V3 Design Patterns | 1985 |
| Claude learning / retro | `fw\.claude\learnings\candidate-cache-pattern.md` | Learning: Candidate Bitmask Caching Pattern | 1109 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\errors\plan-mode-silent-detection-failure.md` | Plan Mode Detection Failure — Copilot Chat Agent Handoff Limitation | 1927 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\errors\plan-mode-violation-root-cause.md` | Plan Mode 违规根因分析 | 1318 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\errors\ssh-heredoc-backslash-expansion.md` | Backslash-N Expansion Through SSH Heredoc Layers | 2175 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\errors\ssh-python-byte-escaping.md` | SSH Python Binary-Mode Replacement: False-Positive Trap | 3381 |
| Claude learning / retro | `fw\.claude\learnings\local-pointer-extraction.md` | Local Pointer Extraction: pending_mask Bitmask Pattern | 1501 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\patterns\byte-level-file-surgery.md` | Byte-Level File Surgery: Diagnosis and Replacement | 3533 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\patterns\large-document-rewrite.md` | Large Document Rewrite Pattern | 1481 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\patterns\multi-point-edit-offset-tracking.md` | Multi-Point Python Edit Script: Offset Tracking | 1566 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\patterns\selective-version-revert.md` | Selective Version Revert: Base + Cherry-Pick Strategy | 2595 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\patterns\ssh-remote-file-editing.md` | SSH Remote File Editing -- Patterns and Pitfalls | 4612 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\patterns\static-bitmask-cache-stale-bit.md` | Static Bitmask Cache Stale-Bit Hazard | 1513 |
| AI 协作 / 远程编辑经验 | `fw\.claude\learnings\remote-file-editing.md` | Remote File Editing via SSH | 1224 |
| Claude learning / retro | `fw\.claude\learnings\remote-server.md` | Learning: Remote Server Access | 642 |
| Claude learning / retro | `fw\.claude\learnings\struct-deduplication.md` | Struct Deduplication: Per-HCQD vs Global Pending | 1543 |
| Claude learning / retro | `fw\.claude\retros\2026-03-30.md` | Session Retrospective - 2026-03-30 | 2691 |
| Claude learning / retro | `fw\.claude\retros\2026-03-30-1112.md` | Session Retrospective - 2026-03-30 | 2691 |
| Claude learning / retro | `fw\.claude\retros\2026-03-31-1916.md` | Session Retro: 2026-03-31-1916 - HCQD Round-Robin V3 Design | 2298 |
| Claude learning / retro | `fw\.claude\retros\2026-04-03-1058.md` | Session Retrospective: 2026-04-03 10:58 | 2739 |
| Claude learning / retro | `fw\.claude\retros\2026-04-07-candidate-cache.md` | Session Retrospective: 2026-04-07 | 1314 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-1140.md` | Retro 2026-04-08-1140 (Session 3ebc4330) | 2812 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-1630.md` | Session Retrospective: 2026-04-08 16:30 | 2522 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-1730.md` | Session Retrospective: 2026-04-08 17:30 — V7 Review Findings Fix | 4263 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-1830.md` | Session Retrospective: 2026-04-08 18:30 | 3269 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-2031.md` | Retro: 2026-04-08-2031 (session 5d38a655) | 627 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-v7-candidate-driven.md` | Session Retrospective: 2026-04-08 | 2603 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-v7-context.md` | Session Retrospective: 2026-04-08 | 831 |
| Claude learning / retro | `fw\.claude\retros\2026-04-08-v7-doc-update.md` | Session Retrospective: 2026-04-08 (V7 Document Update) | 2655 |
| Claude learning / retro | `fw\.claude\retros\2026-04-15-1345.md` | Session Retrospective: 2026-04-15 13:45 | 2437 |
| aigc_sdk 缺陷扫描 | `fw\aigc_sdk_bug_report.md` | aigc_sdk Bug 扫描报告 | 23698 |
| aigc_sdk 缺陷扫描 | `fw\aigc_sdk_check_report.md` | aigc_sdk 代码检查报告 | 13974 |
| CP 调度 / cmd_entry | `fw\cmd_entry_roundrobin_design.md` | CP User cmd_entry Candidate-Driven Dispatch 设计说明 V7 | 21416 |
| CP stop / flush | `fw\docs\cp_user_sf_cmd_changes.md` | CP User：Stop/Flush 与 cmd_entry 优化 | 13994 |
| fw 其他文档 | `fw\wait_host_cmd_architecture.md` | wait_host_cmd_architecture | 0 |
| fw 其他文档 | `fw\wait_host_cmd_review_report.md` | wait_host_cmd_review_report | 0 |
| image_tool 镜像工具 | `image_tool\architecture.md` | image_tool 架构文档 | 11590 |
| image_tool 镜像工具 | `image_tool\README.md` | image_tool — Grace SoC 固件镜像打包工具 | 10910 |
