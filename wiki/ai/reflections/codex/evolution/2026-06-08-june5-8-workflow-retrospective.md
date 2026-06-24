---
type: codex-reflection
title: "6月5日到6月8日 Codex 工作流复盘"
created: 2026-06-08
updated: 2026-06-08
tags:
  - codex
  - reflection
  - workflow
  - skills
status: active
scope: "2026-06-05 到 2026-06-08 的可见 session、session_index、技能与 wiki 证据"
---

# 6月5日到6月8日 Codex 工作流复盘

## 1. 改动结论

这几天最大的问题不是单个 bug，而是长线程中需求持续升级后，Codex 没有持续维护一个不可回归的验收矩阵。最明显的重复失误是：视觉 sidecar 引入了不该引入的规划模式；Neon Arena 多轮重构中丢失多人入口、房间码、地图/难度选择等原始能力；游戏视觉用背景图近似真实地图，导致可见障碍物和碰撞对象不一致。相对做得好的地方是 6 月 8 日系统排查任务：先收集证据、再最小清理、最后复查。

本次已优化三个工作流 skill：每日复盘连续断档必须升级为 automation incident；反思归档支持只读例外；Obsidian 维护流程默认把文档/wiki 图表交给 `technical-diagram-generator`。

## 2. 证据来源

| 证据 | 结论 |
|---|---|
| `session_index.jsonl` 过滤 2026-06-05 到 2026-06-08 | 只索引到 3 条 session，且部分 cwd/rollout_path 为空；索引不完整，不能单独作为覆盖结论。 |
| 6 月 5 日 Neon Arena 长 session | 43 条用户消息、1000+ shell 调用、200+ patch 调用；需求多次从 iOS、Web/PWA、部署、资产、多人、全局验收之间切换。 |
| 6 月 5 日 ImageGen sidecar session | 用户指出“是否使用错了模式”；Codex承认不应把 sidecar 任务带入规划/规格流程。 |
| 6 月 8 日排查/清理/PDF 转换 session | 系统排查遵循证据链和最小清理；PDF 转换有存在性、大小、文件头验证。 |
| 每日复盘文件检查 | 项目本地 `notes/codex-daily/` 与 Obsidian `codex-reflection/daily/` 未发现 2026-06-05 到 2026-06-08 日报。 |
| 现有 memory/wiki | 已记录 diagram skill 和 wiki 可见复查规则，但部分 workflow skill 没有把规则固化。 |

## 3. 重复做得不好的事

1. 模式选择过度：用户给了明确 sidecar 限制时，仍读取或提到不适合的规划类流程。
2. 长线程缺少不可回归清单：多人入口、地图选择、难度、房间码、退出按钮、赛后流程等能力在重构中反复丢失或需要用户重新指出。
3. 视觉真实性不足：把高级视觉目标理解为“背景图好看”，而没有保证地图对象、碰撞对象和渲染对象同源。
4. 验收声明过早：没有稳定要求双浏览器、多房间码、地图遍历、AI 对局完整结束、真实截图和远端可见状态同时通过后再关闭任务。
5. 自动复盘断档：已有 watchdog 规则，但 6 月 5 日到 6 月 8 日没有形成连续日报，说明 automation 健康检查没有被转化成 incident 处理。

## 4. 为什么会出错

| 根因 | 表现 | 修正方向 |
|---|---|---|
| 任务范围过大 | 一个线程混合新项目、iOS、Web、图像生成、部署、回滚、规则重构 | 大任务先建 acceptance matrix，并在每轮重构前复读不可回归能力。 |
| Skill 路由不够克制 | 点名插件/skill 后，没有先判断该 skill 的完整流程是否和用户限制冲突 | 对 sidecar/read-only/patch-only 任务先做边界判断，必要时只使用 checklist。 |
| 视觉验收标准不具体 | “高级样式”被实现成贴背景图，而不是真实地图建模 | 视觉任务必须绑定 screenshot、对象层、碰撞层、可行走性测试和可见/碰撞一致性。 |
| 状态证据分散 | 本地 Vite、远端主机、Cloudflare、下载包、Git 仓库连续切换 | 每次部署/迁移都维护 source-of-truth 表：源码、构建产物、运行位置、URL、验证命令。 |
| 自动化健康没有升级机制 | 日报缺失时仍容易继续普通复盘 | 连续两天缺日报时，先记录 automation incident，再写普通结论。 |

## 5. 本次工作流改动

| 文件 | 改动 |
|---|---|
| `codex-daily-self-review/SKILL.md` | Daily Watchdog 新增连续断档升级规则：目标窗口两天以上缺本地或 Obsidian 日报时，先按 automation incident 处理。 |
| `codex-reflection-archiver/SKILL.md` | 新增只读例外：只要求检查、分析、建议、patch-level 建议时，不自动写 Obsidian。 |
| `obsidian-vault-index-maintenance/SKILL.md` | Procedure 新增 diagram routing：文档/wiki 图表默认使用 `technical-diagram-generator`，并要求源资产、渲染资产、路径和布局验证。 |

## 6. 下次规则

1. 遇到长线程重构，先写并持续维护“不可回归能力矩阵”：入口、模式、联网、视觉、规则、部署、测试，每轮完成前逐项验收。
2. 遇到 sidecar 任务，先执行用户硬约束，不把主流程 planning/spec/implementation skill 自动带进去。
3. 对游戏视觉和地图，不允许用“单张背景图 + 手写碰撞矩形”冒充真实建模；渲染对象和碰撞对象必须同源，且要用自动化或截图证明。
4. 对部署任务，必须写清当前 source-of-truth：Git 仓库、下载包、远端目录、运行进程、域名入口和验证时间。
5. 对每日复盘，发现连续缺日报时，先报告 automation incident，不把缺失证据写成正常日报。

## 7. 验证

- 已读取 session 元数据和必要 JSONL 摘要，未输出图片 base64、工具输出全文或敏感值。
- 已检查 workflow skill 是否存在对应规则，确认本次前存在缺口。
- 写入后已复查：skill 关键规则可读；Obsidian 页面、index、hot、log 为 UTF-8/BOM，可读中文正常，未发现 U+FFFD、`????` 或明显 secret 模式。

## 8. 剩余风险

- `session_index.jsonl` 对 6 月 5 日到 6 月 8 日覆盖不完整，部分结论依赖必要 JSONL 抽样和当前线程可见上下文。
- Neon Arena 的具体代码质量没有在本次复盘里重新打开业务仓库验证，因此不能把“已修复”写成事实。
- Obsidian vault 当前已有未提交改动；本次只追加工作流复盘入口，不整理其它既有脏状态。