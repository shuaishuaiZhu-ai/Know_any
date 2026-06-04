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
- `wiki/fw/index.md` 是 FW 唯一专区索引。
- 每个 FW 子目录必须有 `index.md`。
- 不再创建 `Wiki Index.md`、`Hot Cache.md`、`Wiki Log.md` 这类根目录兼容别名。

## 新增页面规则

新增任何分析、技术文档、调试结论、源码阅读总结时，必须同步更新：

1. [Wiki 总索引](<../index.md>)
2. 对应专区索引，例如 [FW 技术知识库](<../fw/index.md>)
3. 对应子目录索引，例如 [IMC 索引](<../fw/imc/index.md>)
4. [Hot Cache](<../hot.md>)，如果它是近期活跃主题
5. [Wiki Log](<../log.md>)，记录新增/移动/删除

## 放置规则

| 内容类型 | 放置位置 |
|---|---|
| FW IMC 启动 / board init / IPC command 分析 | `wiki/fw/imc/` |
| FW CP Master 分析 | `wiki/fw/cp-master/` |
| FW CP User / cmd_entry 分析 | `wiki/fw/cp-user/` |
| CLI / agc_shell / UART 分析 | `wiki/fw/cli/` |
| RT-Thread 调度分析 | `wiki/fw/rt-thread/` |
| HCQD / MCQD / IB 等概念 | `wiki/fw/concepts/` |
| 端到端流程 | `wiki/fw/flows/` |
| 性能优化 | `wiki/fw/performance/` |
| 调试复盘 | `wiki/fw/debug/` |
| 源材料映射 | `wiki/fw/source-maps/` |
| 工具链 | `wiki/tools/` |
| 原始材料和镜像 | `wiki/sources/` 或 `.raw/` |

## 删除规则

- 可以删除空目录和只做兼容跳转的旧索引页。
- 不删除 `sources/` 和 `.raw/` 的原始证据，除非用户明确要求。
- 如果删除重复页，必须先确认有保留页承接内容，并更新旧链接。