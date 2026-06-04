# for_ai Obsidian 知识库使用说明

这个目录是 Obsidian vault。不要从文件夹树逐个展开阅读，优先从总索引进入。

## 从哪里开始

1. `wiki/index.md`
   - 当前唯一总入口。
   - 所有阅读路线先从这里分流。

2. `wiki/fw/index.md`
   - FW 技术知识库入口。
   - CP Master、CP User、CLI、RT-Thread、概念、流程、性能、调试都在这里细分。

3. `wiki/fw/cli/index.md`
   - CLI/agc_shell 相关入口。
   - `agc_shell-cli-path.md` 已放在这里，不再放到 CP Master 下面。

4. `wiki/synthesis/面试用工作笔记总结.md`
   - 面试复盘入口。

5. `wiki/canvases/语雀工作笔记知识图谱.canvas`
   - 需要看图时打开。

## 目录结构

| 目录 | 用途 | 是否优先阅读 |
|---|---|---|
| `wiki/index.md` | 唯一总索引 | 是 |
| `wiki/fw/` | FW 技术知识库 | 是 |
| `wiki/synthesis/` | 跨源综合、工作笔记、面试材料 | 是 |
| `wiki/sources/` | 原始材料索引和镜像 | 查证时看 |
| `wiki/tools/` | 工具链知识 | 按需看 |
| `wiki/meta/` | 维护规则、审计 | 写/整理时看 |
| `.raw/` | 原始归档材料 | 不直接改 |
| `_attachments/` | 附件 | 按需看 |
| `_templates/` | 模板 | 写新笔记时用 |

## FW 阅读路径

1. `wiki/fw/index.md`
2. `wiki/fw/source-maps/GraceC CP MAS v1.4 code knowledge map.md`
3. `wiki/fw/flows/CP command processing flow.md`
4. `wiki/fw/concepts/index.md`
5. `wiki/fw/cp-master/index.md`
6. `wiki/fw/cp-user/index.md`
7. `wiki/fw/cli/index.md`
8. `wiki/fw/rt-thread/index.md`

## 维护规则

- 新增分析页、技术文档、调试结论后，必须更新 `wiki/index.md` 和对应专区索引。
- FW 相关页面默认放在 `wiki/fw/` 下，不再散落到 `topics/` / `entities/`。
- 原始材料放 `.raw/` 或 `wiki/sources/`，不要混入阅读层。
- 详细规则见 `wiki/meta/wiki-maintenance-rules.md`。