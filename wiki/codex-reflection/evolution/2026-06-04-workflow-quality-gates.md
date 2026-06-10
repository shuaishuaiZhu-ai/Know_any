---
type: codex-reflection
title: "两周对话工作流质量门优化"
created: 2026-06-04
updated: 2026-06-04
tags:
  - codex
  - reflection
  - workflow
  - quality-gate
status: active
scope: evolution
source:
  - "session_index.jsonl filtered 2026-05-21..2026-06-04, excluding ComfyUI/ctrlclaw/generation-media work"
  - "subagent workflow mining results"
  - "MEMORY.md targeted workflow rules"
  - "codex-reflection project reviews"
---

# 两周对话工作流质量门优化

## 1. 改动结论

本次排除了 ComfyUI、ctrlclaw 和生成媒体链路后，重复问题集中在五类：Daily Review 断档、session 覆盖和误分类、wiki/diagram 写后复查不足、远端 source-of-truth 与历史 memory 混用、只读审计被归档规则误触发。

本次不新增大型 skill，不修改 AGENTS.md，不改业务代码。只补强现有 workflow skill 的质量门和边界。

## 2. 证据覆盖

- 本地解析 `session_index.jsonl`：两周窗口内 51 条记录，排除生成媒体链路后保留 29 条候选。
- subagent 独立扫描得到窗口内 54 条记录、53 个唯一 session，其中非 ComfyUI/ctrlclaw 主线程 7 个。
- 读取并交叉验证 Daily Review、项目复盘、automation memory、MEMORY.md、wiki 维护记录。
- 三个 subagent 均为只读；两个按时返回，一个超时后被要求停止并最终返回当前结论。

## 3. 重复问题

| 问题 | 根因 | 本次优化 |
|---|---|---|
| Daily Review 断档 | automation 健康层和日报内容层混在一起 | `codex-daily-self-review` 增加 Daily Watchdog |
| session 漏读/误分类 | 只看路径日期、标题或 index，长线程/guardian 混入 | 强化 coverage table 和 acceptance matrix |
| wiki 写后复查不足 | 验证停在存在性、链接或解码层 | `obsidian-vault-index-maintenance` 增加 frontmatter、图片、diagram 可见复查 |
| 远端事实从 memory 继承 | memory 可用于 setup，但不能证明当前 live 状态 | `codex-session-project-bootstrap` 增加 source-of-truth checklist |
| 只读审计误写归档 | archiver/automation skill 规则太强 | archiver 与 automation registry skill 增加 read-only exception |
| memory 边界不清 | skill 仍写直接 promote 到 MEMORY.md | `memory-management-model` 改为 ad-hoc note 边界 |

## 4. 改动文件

- `C:\Users\18355\.codex\skills\codex-session-project-bootstrap\SKILL.md`
- `C:\Users\18355\.codex\skills\codex-reflection-archiver\SKILL.md`
- `C:\Users\18355\.codex\skills\codex-daily-self-review\SKILL.md`
- `C:\Users\18355\.codex\skills\codex-automation-registry-check\SKILL.md`
- `C:\Users\18355\.codex\skills\memory-management-model\SKILL.md`
- `C:\Users\18355\.codex\skills\obsidian-vault-index-maintenance\SKILL.md`

## 5. AGENTS.md 建议

暂不直接修改。建议以后写入全局或项目集 `AGENTS.md` 的规则：当用户说只读、不要改文件、只做审计、只给 patch 建议时，skills 可以作为判断依据，但不得写 wiki、memory、AGENTS、automation 或 skill 文件；只能输出建议。

## 6. 剩余风险

- 本次没有复盘 ComfyUI/ctrlclaw/生成媒体具体质量，按用户要求排除。
- 没有连接远端验证 FW、kernel、DingTalk/Feishu 的 live 状态。
- 没有创建新的安全 session 摘要脚本；目前通过 skill 规则约束。
- 当前 AGENTS.md 仍来自上下文注入而非本项目持久文件。

## 7. 下次规则

做高质量复盘时，先建 session 覆盖表，再区分证据层级；如果要改 workflow，优先补强已有 skill 的 guardrail，而不是新增重叠 skill 或把所有规则塞进 automation prompt。