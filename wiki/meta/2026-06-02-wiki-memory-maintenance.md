---
type: maintenance
title: "Wiki 与 Memory 整理记录"
created: 2026-06-02
updated: 2026-06-02
tags:
  - meta
  - wiki
  - memory
  - maintenance
status: active
source:
  - "obsidian-vault-index-maintenance skill"
  - "memory-management-model skill"
  - "MEMORY.md targeted search"
---

# Wiki 与 Memory 整理记录

## 1. 结论

这次整理没有发现核心索引内容本身已经损坏；问题主要是部分导航层 Markdown 没有 UTF-8 BOM，Windows PowerShell 或某些预览路径会把中文显示成乱码。已统一补 BOM，并把这次整理写入 wiki 与 memory 的维护记录。

## 2. Wiki 整理

已处理的导航层文件：

- `wiki/index.md`
- `wiki/fw/index.md`
- `wiki/fw/imc/index.md`
- `wiki/fw/interconnect/index.md`
- `wiki/mas/index.md`
- `wiki/meta/wiki-maintenance-rules.md`
- `wiki/tools/index.md`
- `wiki/tools/claude-code-proxy/index.md`

处理方式：保留原有内容，只补 UTF-8 BOM，并把已有 frontmatter 的 `updated` 更新到 2026-06-02。

未做事项：没有批量改写具体技术内容页，没有删除文件，没有移动 `.raw` 或 `sources` 证据文件。

## 3. Memory 整理

`MEMORY.md` 已经存在 2026-06-01 的 Daily Codex Self-Review skill 更新记录，因此本次不重复沉淀同一内容。新增的 memory 更新只记录这条稳定规则：整理 wiki 时要先区分“文件内容损坏”和“无 BOM 导致显示乱码”，memory 维护只写 ad-hoc note，不直接编辑 `MEMORY.md`。

## 4. 后续规则

- 写入或整理 `C:\home\for_ai\wiki` 后，必须可见复查实际文件内容。
- 核心导航层 Markdown 应保留 UTF-8 BOM，尤其是 `index.md`、`hot.md`、`log.md` 和 `meta` 规则页。
- Memory 只沉淀可复用、已验证、会影响未来行为的规则；已有语义记录不要重复写入。

## 5. 未完成与风险

- 本次只整理导航层，不代表全库每个具体技术页面都做了内容审校。
- 低优先级历史页面如果仍无 BOM，只有在用户打开出现乱码或成为活跃入口时再处理。