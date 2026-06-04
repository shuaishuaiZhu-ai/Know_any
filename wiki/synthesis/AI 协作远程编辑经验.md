---
type: topic
title: "AI 协作远程编辑经验"
created: 2026-05-09
updated: 2026-05-09
tags:
  - workflow
  - remote-editing
  - claude
  - codex
status: active
---

# AI 协作远程编辑经验

这些 .claude/learnings 和 retros 记录了多次真实协作失败模式：远程路径不一致、SSH heredoc 转义、Python 字节替换误判、plan mode 识别失败、多点编辑 offset 错误等。

## 可复用规则

- 远程 repo 以服务器路径为准；本地 Windows 映射只适合辅助读取，不能替代远端验证。
- 对 C 字符串、反斜杠、换行等 escape-heavy 内容，优先字节级验证，确认 92,110 与 10 的区别。
- 多点编辑要么从后往前改，要么维护 offset；不要在原始坐标上连续替换。
- 用户明确说处于 plan mode 时，以用户 UI 声明为准，再调查标记为什么没传递。
- 大文档重写前先确认目标边界；适合整篇替换的就整篇替换，局部补丁不稳定时不要硬切。

## 来源

- **agent-browser Installation Without sudo** — `.raw/local-md/C-home-shuaishuai.zhu/ajthunk\.claude\learnings\agent-browser-no-sudo-install.md`
- **agent-browser on Windows: Use Edge Instead of Chrome** — `.raw/local-md/C-home-shuaishuai.zhu/ajthunk\.claude\learnings\agent-browser-windows-edge-workaround.md`
- **Feishu Documents Require Authentication** — `.raw/local-md/C-home-shuaishuai.zhu/ajthunk\.claude\learnings\feishu-requires-auth.md`
- **SSH One-liner PATH Export Fails with Windows Paths** — `.raw/local-md/C-home-shuaishuai.zhu/ajthunk\.claude\learnings\ssh-windows-path-export-issue.md`
- **Session Retrospective — 2026-03-30 19:35** — `.raw/local-md/C-home-shuaishuai.zhu/ajthunk\.claude\retros\2026-03-30-1935.md`
- **Learning: HCQD Round-Robin V3 Design Patterns** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\2026-03-31-hcqd-v3.md`
- **Learning: Candidate Bitmask Caching Pattern** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\candidate-cache-pattern.md`
- **Plan Mode Detection Failure — Copilot Chat Agent Handoff Limitation** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\errors\plan-mode-silent-detection-failure.md`
- **Plan Mode 违规根因分析** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\errors\plan-mode-violation-root-cause.md`
- **Backslash-N Expansion Through SSH Heredoc Layers** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\errors\ssh-heredoc-backslash-expansion.md`
- **SSH Python Binary-Mode Replacement: False-Positive Trap** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\errors\ssh-python-byte-escaping.md`
- **Local Pointer Extraction: pending_mask Bitmask Pattern** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\local-pointer-extraction.md`
- **Byte-Level File Surgery: Diagnosis and Replacement** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\patterns\byte-level-file-surgery.md`
- **Large Document Rewrite Pattern** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\patterns\large-document-rewrite.md`
- **Multi-Point Python Edit Script: Offset Tracking** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\patterns\multi-point-edit-offset-tracking.md`
- **Selective Version Revert: Base + Cherry-Pick Strategy** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\patterns\selective-version-revert.md`
- **SSH Remote File Editing -- Patterns and Pitfalls** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\patterns\ssh-remote-file-editing.md`
- **Static Bitmask Cache Stale-Bit Hazard** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\patterns\static-bitmask-cache-stale-bit.md`
- **Remote File Editing via SSH** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\remote-file-editing.md`
- **Learning: Remote Server Access** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\remote-server.md`
- **Struct Deduplication: Per-HCQD vs Global Pending** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\learnings\struct-deduplication.md`
- **Session Retrospective - 2026-03-30** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-03-30.md`
- **Session Retrospective - 2026-03-30** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-03-30-1112.md`
- **Session Retro: 2026-03-31-1916 - HCQD Round-Robin V3 Design** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-03-31-1916.md`
- **Session Retrospective: 2026-04-03 10:58** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-03-1058.md`
- **Session Retrospective: 2026-04-07** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-07-candidate-cache.md`
- **Retro 2026-04-08-1140 (Session 3ebc4330)** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-1140.md`
- **Session Retrospective: 2026-04-08 16:30** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-1630.md`
- **Session Retrospective: 2026-04-08 17:30 — V7 Review Findings Fix** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-1730.md`
- **Session Retrospective: 2026-04-08 18:30** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-1830.md`
- **Retro: 2026-04-08-2031 (session 5d38a655)** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-2031.md`
- **Session Retrospective: 2026-04-08** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-v7-candidate-driven.md`
- **Session Retrospective: 2026-04-08** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-v7-context.md`
- **Session Retrospective: 2026-04-08 (V7 Document Update)** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-08-v7-doc-update.md`
- **Session Retrospective: 2026-04-15 13:45** — `.raw/local-md/C-home-shuaishuai.zhu/fw\.claude\retros\2026-04-15-1345.md`