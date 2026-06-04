---
type: audit
title: "Wiki 缺口审计"
created: 2026-05-09
updated: 2026-05-09
tags:
  - meta
  - audit
  - wiki
status: active
---

# Wiki 缺口审计

本页记录 2026-05-09 对 `C:\home\for_ai` Obsidian wiki 的缺口排查结果。

## 审计口径

本次把“应该写但没有写”的问题分成四类：

1. raw Markdown 已存在，但 `wiki/sources/...` 没有对应镜像。
2. Obsidian `wikilink` 指向不存在的笔记。
3. wiki 中存在 0 字节或空白 Markdown。
4. 索引已经引用某个主题，但主题页没有落盘。

## 已发现并修复

| 问题 | 修复 |
|---|---|
| 46 个 raw Markdown 没有 `wiki/sources/...` 镜像 | 已全部补齐到 `wiki/sources` |
| `CP queue scheduling stop flush` 被多处引用但没有 topic 页 | 已新增 `wiki/fw/cp-user/CP queue scheduling stop flush.md` |
| `bdma`、`qdma`、`ipc_cmd` 被 CP Master 索引引用但没有页面 | 已新增 3 个 CP Master 草稿页 |
| `CP MAS 知识图谱入口`、`Wiki Index`、`Hot Cache`、`Wiki Log` 是旧链接别名 | 已新增兼容入口页 |
| 3 个 raw 文件是 0 字节，镜像后会变成空白 wiki | 已在 wiki/source 侧补成“空源说明页”，不改 `.raw` |
| `hot.md` 中示例 `X` 被误识别为真实链接 | 已改成代码示例 `X` |

## 当前校验结果

```text
vaultMdCount: 203
rawMdCount: 46
sourceMdCount: 50
rawMissingMirrorCount: 0
emptyWikiMarkdownCount: 0
brokenWikilinkCount: 0
```

## 仍然需要后续人工补强的内容

这些不是“缺文件”，而是内容深度还不够：

- [[wiki/fw/cp-master/overview]] 仍是 CP Master 总览草稿，需要继续学习 CP Master 源码。
- [[bdma]]、[[qdma]]、[[ipc_cmd]] 已有入口页，但仍需要结合源码补流程、寄存器、状态机和与 CP User 的交互。
- `wait_host_cmd_architecture.md` 和 `wait_host_cmd_review_report.md` 的 raw 文件为空，需要从原始仓库重新取源才能恢复正文。

## 后续避免规则

- 每次导入 raw 后，必须同步检查 `raw -> wiki/sources` 镜像完整性。
- 每次生成索引后，必须检查所有 `wikilink` 是否可解析。
- 0 字节 raw 不直接生成空白 wiki，要生成“空源说明页”。
- 被索引引用的模块即使还没深入学习，也要先建立 draft 入口页，明确后续需要补什么。