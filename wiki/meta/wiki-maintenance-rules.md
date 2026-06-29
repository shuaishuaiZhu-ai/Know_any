---
type: meta
title: "Wiki 维护规则"
created: 2026-05-14
updated: 2026-06-02
tags: [meta, wiki, maintenance]
status: active
---

# Wiki 维护规则

## 入口规则

- `wiki/index.md` 是唯一总索引。
- `wiki/grace/fw/index.md` 是 FW 唯一专区索引。
- 每个 FW 子目录必须有 `index.md`。
- 不再创建 `Wiki Index.md`、`Hot Cache.md`、`Wiki Log.md` 这类根目录兼容别名。

## 新增页面规则

新增任何分析、技术文档、调试结论、源码阅读总结时，必须同步更新：

1. [Wiki 总索引](<../index.md>)
2. 对应专区索引，例如 [FW 技术知识库](<../grace/fw/index.md>)
3. 对应子目录索引，例如 [IMC 索引](<../grace/fw/imc/index.md>)
4. [Hot Cache](<../hot.md>)，如果它是近期活跃主题
5. [Wiki Log](<../log.md>)，记录新增/移动/删除

## 源码核实与绘图规则

- **先核实、后成文/绘图**：任何关于固件/内核内部机制的断言或图解，落盘前必须对照 `.raw/` 源材料或远程源码核实，不要凭记忆或讹传先写后改——"先画错、事后返工"是已发生过的浪费。
- **图一次画对**：用 `technical-diagram-generator` skill 的视觉审查流程，渲染 PNG 后核对箭头方向、标签遮挡、文字溢出，确认无误再提交；不要靠多轮推倒重来收敛。

## 放置规则

| 内容类型 | 放置位置 |
|---|---|
| FW IMC 启动 / board init / IPC command 分析 | `wiki/grace/fw/imc/` |
| FW CP Master 分析 | `wiki/grace/fw/cp-master/` |
| FW CP User / cmd_entry 分析 | `wiki/grace/fw/cp-user/` |
| CLI / agc_shell / UART 分析 | `wiki/grace/fw/cli/` |
| RT-Thread 调度分析 | `wiki/grace/fw/rt-thread/` |
| HCQD / MCQD / IB 等概念 | `wiki/grace/fw/concepts/` |
| 端到端流程 | `wiki/grace/fw/flows/` |
| 性能优化 | `wiki/grace/fw/performance/` |
| 调试复盘 | `wiki/grace/fw/debug/` |
| 源材料映射（MAS↔代码知识图谱） | `wiki/grace/fw/`（`GraceC CP MAS v1.4 code knowledge map.md`，已折叠 source-maps 子目录） |
| 工具链 | `wiki/tools/` |
| 原始材料和镜像 | `wiki/sources/` 或 `.raw/` |

## 命名规范（统一约定）

本 vault 用 [[wikilink]] 按文件名（basename）解析，因此**文件名即标识符**，确定后不要轻易改名（改名要同步重写全库所有 `[[旧名]]` 反链，成本高、易漏）。命名遵循两层约定：

| 页面类型 | 命名风格 | 示例 |
|---|---|---|
| 代码符号页（函数/模块/寄存器名直接对应代码） | 保持代码原样：snake/kebab、ASCII | `cmd_entry.md`、`ib.md`、`top_reg.md`、`qdma.md`、`rt_thread_yield.md`、`cmd_entry-branch-layout.md` |
| 概念词条（被多页 `[[...]]` 当锚点） | 短、ASCII、连字符 | `HCQD.md`、`MCQD.md`、`Interaction-Buffer.md`、`Event-Table.md`、`CP-Command-Packet.md` |
| 主题/流程/调试/性能分析页 | 描述性中文/英文短语，允许空格 | `CP command processing flow.md`、`CP stop flush 与 queue 切换.md`、`CP cmd_entry 热路径与分支布局优化.md` |

附加约定：

- **概念词条保持原子**，不要合并进大页——它们是全库 `[[HCQD]]`/`[[iDMA]]` 等反链的锚点，合并会断链。
- 新增主题页若与既有页主题重叠 ≥70%，优先合并进既有 canonical 页（保留被链接最多的文件名），而不是新建近义页。
- 含空格的文件名在 md-link 里必须用 `<...>` 包裹，例如 `[文字](<./页面 名.md>)`。

## 删除规则

- 可以删除空目录和只做兼容跳转的旧索引页。
- 不删除 `sources/` 和 `.raw/` 的原始证据，除非用户明确要求。**批量脚本替换时注意 Windows 下 `os.walk` 的路径分隔符是 `\`，排除 `sources/` 要用 `os.sep` 判断，否则会误改原始镜像。**
- 如果删除重复页，必须先确认有保留页承接内容，并更新旧链接。