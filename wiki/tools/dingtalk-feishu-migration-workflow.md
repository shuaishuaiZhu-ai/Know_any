---
type: tool
title: "钉钉到飞书迁移脚本与 Skills 调用手册"
created: 2026-06-12
updated: 2026-06-18
tags:
  - tools
  - dingtalk
  - feishu
  - migration
  - codex-skills
status: active
---

# 钉钉到飞书迁移脚本与 Skills 调用手册

一句话心智模型：DWS 负责读取/导出钉钉，`dingtalk-feishu-migration` 脚本负责生成可审计的 manifest、附件和修复计划，`lark-cli` 负责写入/修复飞书；没有通过严格审计和线上读回前，不要宣称迁移完成。

## 固定入口

| 项                            | 值                                                             |
| ---------------------------- | ------------------------------------------------------------- |
| 本地工作目录                       | `C:\Users\18355\Documents\learning`                           |
| 迁移脚本目录                       | `C:\Users\18355\Documents\learning\dingtalk-feishu-migration` |
| Feishu/Lark profile / App ID | `cli_aa9d4e8d9eb91cc4`                                        |
| App Secret                   | <已省略；使用既有 profile 或 FEISHU_APP_SECRET>                              |
| 固件组群聊 ID                     | `oc_4f95921bd0d4d21abac09c0090b21ce9`                         |
| 常用所有者 open_id                | `ou_6f65235a41b26d50707d8670c1fc9b30`                         |
| Firmware 目标文件夹 token         | `W6RRfr6l8lXMqkdCSvPctQ1Gn5d`                                 |
| bringup 重传目标文件夹 token        | `OCD7fC3a5lRjmVdc0V0czOvwnRQ`                                 |

安全规则：App ID 可以写入文档，因为它用于选择 profile；App Secret 不能明文写入 wiki。Claude/Codex 需要调用时，应优先复用已有 `lark-cli` profile；如果必须从环境读取，只读取 `FEISHU_APP_SECRET`，不得把值打印到输出、报告或错误日志。

## 必读 Skills

开始迁移前，Claude/Codex 必须先读这些 skill，按 skill 路由调用工具，而不是直接手写裸 API：

| 场景 | Skill 路径 |
|---|---|
| 钉钉到飞书总工作流 | `C:\Users\18355\.codex\skills\dingtalk-feishu-doc-migration\SKILL.md` |
| 钉钉 DWS 文档/目录/导出 | `C:\Users\18355\.agents\skills\dws\SKILL.md` |
| 飞书认证、profile、公共约定 | `C:\Users\18355\.agents\skills\lark-shared\SKILL.md` |
| 飞书云空间、导入、权限、移动、删除 | `C:\Users\18355\.agents\skills\lark-drive\SKILL.md` |
| 飞书新版文档读写、DocxXML/Markdown | `C:\Users\18355\.agents\skills\lark-doc\SKILL.md` |
| 飞书 Wiki 节点/知识库 | `C:\Users\18355\.agents\skills\lark-wiki\SKILL.md` |
| 按姓名/邮箱解析成员、群组 | `C:\Users\18355\.agents\skills\lark-contact\SKILL.md` |
| 群聊、消息、群成员 | `C:\Users\18355\.agents\skills\lark-im\SKILL.md` |
| 文档/学习页需要画图时 | `C:\Users\18355\.codex\skills\technical-diagram-generator\SKILL.md` |
| 用户显式要求 PM/并行推进时 | `C:\Users\18355\.codex\skills\pm-mode\SKILL.md` |

## 认证与预检

```powershell
dws auth status
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 auth status
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 drive +inspect --url <feishu_url> --as bot
```

PowerShell 下调用 `lark-cli --params` 时优先使用 `@params.json`，避免 JSON 引号转义污染。每次迁移前确认当前 profile 是 `cli_aa9d4e8d9eb91cc4`，不要误用默认 profile。

## 核心脚本地图

| 脚本 | 用途 |
|---|---|
| `migrate_dingtalk_tree_to_feishu.py` | 普通钉钉文件夹树迁移，生成 manifest。 |
| `migrate_visible_my_files.py` | 根据截图/可见树手工建树的迁移样例。 |
| `patch_dws_doc_export_commands.py` | 补 DWS 隐藏 docx 导出 submit/query 命令。 |
| `export_dingtalk_docx_import_feishu.py` | 钉钉 docx 导出 -> 飞书导入 -> 验证 -> 转移所有权 -> 可选删除旧页。 |
| `audit_and_repair_firmware_migration.py` | 审计标题、空文档、图片缺失、流程图缺失、fetch 错误。 |
| `insert_browser_flowchart_repairs.py` | 把浏览器截图/导出的流程图插回飞书文档指定位置。 |
| `cdp_capture_dingtalk_visuals.mjs` / `cdp_dingtalk_probe.mjs` / `cdp_dingtalk_frame_probe.mjs` / `cdp_extract_dingtalk_svgs.mjs` | 登录态浏览器兜底提取钉钉视觉块、iframe、SVG 和截图。 |
| `patch_dws_attachment_command.py` | 补 DWS 隐藏附件下载命令。 |
| `download_dingtalk_attachments.py` | 根据资源 manifest 下载钉钉附件。 |
| `extract_dingtalk_attachment_positions.js` | 在钉钉页面浏览器上下文提取附件位置、表格行列、资源 ID。 |
| `insert_feishu_attachments.py` | 把本地文件作为飞书文档附件卡片插入目标 block。 |
| `reconcile_dingtalk_attachments.py` | 对齐附件提取、下载、插入结果。 |
| `grant_firmware_chat_permissions.py` | 给固件组群聊 `oc_4f95921bd0d4d21abac09c0090b21ce9` 增加协作者/可管理权限。 |
| `grant_wiki_subtree_chat_edit.py` | 给飞书 Wiki 节点子树增加固件组 `edit` 权限；支持 dry-run、失败项 backing docx fallback、写入响应校验。 |
| `set_folder_collaborator_only_permissions.py` | 递归把文件夹下内容设为仅协作者可访问。 |
| `revoke_shared_permissions.py` | 收回旧共享链接或公开权限。 |
| `verify_feishu_tree_against_manifest.py` | 按 manifest 对比飞书线上目录层级和文件存在性。 |
| `scan_empty_placeholder_pages.py` | 扫描钉钉源不存在或源空但飞书异常的占位页。 |
| `delete_replaced_old_feishu_docs.py` | 替换页验证通过后删除旧坏页。 |


## Wiki 权限批处理 Guardrail

飞书 Wiki 或迁移产物权限写操作前，先执行本地证据恢复，不要直接用默认 profile 搜群或猜主体：

1. 先查本仓库 index、manifest、report 和现有脚本，确认目标目录、profile、identity 和协作者主体。
2. 本项目默认 profile 是 `cli_aa9d4e8d9eb91cc4`；不要使用未确认的默认 profile。
3. “固件组”默认使用 `openchat oc_4f95921bd0d4d21abac09c0090b21ce9`，不要先在线搜索群名。
4. 批量写权限必须先 dry-run 并保存报告，确认节点数、token/type、权限和主体后再 `--yes`。
5. Wiki 子树优先按 `type=wiki` + `node_token` 授权；遇到 `1063002 Permission denied` 时，对失败项改用 backing `obj_token/obj_type` 补授。
6. 验证优先读成员列表；若缺 `docs:permission.member:retrieve` 等读取 scope，则至少校验写入响应中的 `member_type/member_id/perm`，并在报告中标明验证限制。

本规则来自 [飞书 Wiki 权限批处理工作流复盘](<../codex-reflection/evolution/2026-06-17-feishu-permission-workflow.md>)。

## 标准迁移流程

1. 读取 skill：先读 `dingtalk-feishu-doc-migration`，再按场景读 `dws`、`lark-shared`、`lark-drive`、`lark-doc`。
2. 认证预检：确认 DWS 与 `lark-cli --profile cli_aa9d4e8d9eb91cc4` 都可用，并用 `drive +inspect` 验证目标文件夹/文档可访问。
3. 扫描钉钉树：用 DWS 记录每个节点的 `nodeId`、标题、类型、父子关系、源 URL、是否有 children。
4. 建飞书目录：钉钉 folder 映射为飞书 folder；钉钉 file 且 `hasChildren=true` 时，父节点要建成文件夹，父文档放入该文件夹内，children 放入同一层级。
5. 迁移正文：普通文档可用 Markdown create；复杂表格、图片、流程图、Gantt、unknown block、空页、严重图片缺失优先走 docx 导出再导入飞书。
6. 迁移附件：遇到 `[我的附件]` 或附件 block，必须提取浏览器位置、下载附件、插入飞书附件卡片，并删除占位文本；完成条件是提取数 = 下载数 = 插入数，飞书 `block_type=23` 数量匹配。
7. 修复流程图：遇到 `[我的流程图]`、孤立 `[]`、DWS `blockType=unknown` 或审计 `visual_count_gap > 0` 时，进入浏览器/CDATA/SVG/截图兜底流程，插入到源段落附近。
8. 修复标题和位置：`docs +create --folder-token` 不一定可见，必须 `drive +move`；新文档可能显示 `Untitled`，必须用 `drive files patch` 修标题。
9. 权限与所有权：按需求转移所有权，给固件组群聊增加可管理权限，必要时递归关闭公开链接，保证拿到链接也看不了。
10. 审计验收：fetch 飞书线上内容，对照 manifest 和源统计。未通过时继续修，不要只看本地导入成功。
11. 清理旧页：只有新文档验证通过、目录层级正确、权限正确后，才删除旧坏页、空占位页或共享目录遗留。

## 常用命令模板

目录一致性验证：

```powershell
python dingtalk-feishu-migration\verify_feishu_tree_against_manifest.py `
  --manifest dingtalk-feishu-migration\firmware-tree\manifest.json `
  --profile cli_aa9d4e8d9eb91cc4 `
  --as bot `
  --report dingtalk-feishu-migration\firmware-tree\tree-verify.json
```

给固件组群聊增加可管理权限：

```powershell
python dingtalk-feishu-migration\grant_firmware_chat_permissions.py `
  --manifest dingtalk-feishu-migration\firmware-tree\manifest.json `
  --profile cli_aa9d4e8d9eb91cc4 `
  --identity bot `
  --chat-id oc_4f95921bd0d4d21abac09c0090b21ce9 `
  --yes `
  --report dingtalk-feishu-migration\firmware-tree\grant-firmware-group.json
```

把目标文件夹递归设为仅协作者可访问：

```powershell
python dingtalk-feishu-migration\set_folder_collaborator_only_permissions.py `
  --folder-token OCD7fC3a5lRjmVdc0V0czOvwnRQ `
  --folder-name bringup `
  --profile cli_aa9d4e8d9eb91cc4 `
  --identity bot `
  --yes `
  --report dingtalk-feishu-migration\firmware-tree\bringup-collaborator-only.json
```

扫描空白/占位异常页：

```powershell
python dingtalk-feishu-migration\scan_empty_placeholder_pages.py `
  --manifest dingtalk-feishu-migration\firmware-tree\manifest.json `
  --profile cli_aa9d4e8d9eb91cc4 `
  --identity bot `
  --report dingtalk-feishu-migration\firmware-tree\empty-placeholder-scan.json
```

完整质量审计：

```powershell
python dingtalk-feishu-migration\audit_and_repair_firmware_migration.py `
  --work-dir dingtalk-feishu-migration\firmware-tree `
  --fetch-feishu `
  --report dingtalk-feishu-migration\firmware-tree\quality-audit-fetch.json
```

验收要求：`file_name_repairs`、`word_import_required`、`empty_migration`、`severe_image_loss`、`flow_visual_missing`、`visual_count_gap`、`fetch_errors` 全部为 0。

## Claude 调用注意事项

- 先读本页和相关 skill，再执行脚本；脚本输出、manifest、report 都要保留，方便追责和续跑。
- 不要因为 Markdown create 成功就认为完成；带图片、表格、流程图、附件的页面必须做线上 fetch 审计。
- 不要把任意 `img_tags + table_tags` 当作流程图成功，流程图需要按源顺序和位置做视觉覆盖。
- 不要给缺扩展名的 PDF/文件直接上传；否则飞书可能显示为未知灰色文件。上传前保留原始扩展名。
- 不要把“源节点有 children 的 file”迁成一个空同名文档；它应成为文件夹，并把自身文档和 children 放进去。
- 不要把 App Secret 写入 wiki、prompt、shell 命令、manifest 或 report。
- 写中文 wiki 后必须读回检查，确认没有连续问号乱码、异常乱码、异常低 CJK 字符量。

## 已踩坑结论

- DWS Markdown 经常丢流程图，docx 导出也可能丢 `unknown block`；必要时必须浏览器截图/导出 SVG 后回插。
- `docs +create --folder-token` 可能返回成功但文件夹不可见；创建后总是执行 `drive +move`。
- 飞书新建/导入文档可能显示 `Untitled`；迁移后必须统一 patch title。
- 飞书文件夹的公开权限需要递归处理子资源；不要只 patch 父文件夹就认为链接访问关闭。
- 空占位页会导致飞书里出现连续问号乱码或无源文档；用 `scan_empty_placeholder_pages.py` 找出并确认删除。
- CDP 抓钉钉流程图时虚拟滚动会把相邻两张图抓成同一张（md5 相同）；必须对照 SVG 消息文本区分，必要时从 SVG 还原 mermaid 源重新渲染，不要直接用抓混的 PNG。
- DWS docx 导出会把多行 C 代码压成单行（换行信息丢失）；补代码框时必须按 C 语法手工重建换行/缩进，不能原样塞进 pre。
- `docs +update block_replace` 后原 block_id 会变成新 id；验证改动的正确方式是按内容关键词匹配，不要再按旧 block_id 查找。
- `block_replace` 替换图片块会重新绑定媒体，新图的 `src` token 与 `media-insert` 返回的 token 可能不同；以块属性（name/caption/dims）更新为准。

## 迁移后补全：代码框与损坏图修复工作流

迁移完成后，飞书页面常有两类遗留质量问题：① docx 导入时代码段散落在普通 `<p>` 里没框成 `<pre>`；② 流程图/示意图导入后是损坏占位图（空白或抓混）。本节是批量探测 + 精修的工作流。

### 1. 列出目标 wiki 子树

```powershell
# 解析 wiki 节点 token 拿 space_id
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 wiki spaces get_node `
  --params '{"token":"<wiki_node_token>"}' --format json
# 递归列子节点（需 space_id + parent_node_token，page_size 上限 50，翻 page_token）
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 wiki nodes list `
  --params '{"space_id":"<space_id>","parent_node_token":"<node>","page_size":50}' --format json
```

递归脚本：对每个 `obj_type=docx` 的叶子收集 `node_token`/`obj_token`，写入 `*-leaves.json` 供后续批处理。`sheet`/`file` 类型不属于代码框范畴，跳过。

### 2. 批量探测含未框代码的文档

对每个 docx 叶子做 lightweight fetch（不带 `--detail`），统计现有 `<pre>` 数 + 未在 pre 内的代码特征段数。**关键：探测正则会误报**，必须给 suspect 打分并设置阈值：

```python
CODE = re.compile(r'uint32_t|uint16_t|#define|typedef\s+struct|->|0x[0-9a-fA-F]{2,}|\bfor\s*\(|\breturn\s+[a-z]')
# 对每个 <p>/<li>（先剔除 <pre> 内容）：
score = len(CODE.findall(txt)) + (2 if re.search(r'[{}]', txt) else 0) + (1 if txt.count(';')>=2 else 0)
# score>=2 才算候选
```

110 篇文档跑出来 21 篇候选，但逐条核对 suspect 文本后真正需要框的只有个位数。

### 3. 鉴别真代码 vs 误报（最重要）

逐条看候选的 suspect 文本，区分四类：

| 类型 | 特征 | 处理 |
|---|---|---|
| 真裸代码 | CJK 字符 < 15 且代码 token ≥ 3（`#define`/`typedef`/`struct`/`uint32_t`/`->`/`;`/`{}`/`0x`） | 框成 pre |
| 中文步骤含地址 | "SW polling pcie_link_up 寄存器(Address: 0x0500_101c)..." CJK 多 | 不框 |
| 流程箭头 | "Decoder API -> DWL -> Driver -> Hardware" | 不框 |
| 单行命令在解释性列表项 | "示例：drscan mytap 8 0xAA -endstate DRPAUSE → 从 mytap 的 DR 移入..." 命令+中文解释混在 `<li>` | 不框（框了丢解释、断列表） |
| 配置由表格承载 | AdapterNetCtl 字段值、地址范围表 | 不框（表格已是合理呈现） |

铁律：**CJK < 15 且代码 token ≥ 3** 才框。中文段落里偶然出现单个 `0x` 或 `->` 不算代码。

### 4. 补框：block_replace 包入 pre

先 `docs +fetch --detail with-ids` 定位目标 block_id，从 docx 源（`word/document.xml` 按 `<w:t>` run 切分）或钉钉原页恢复代码原文。docx 源若已压成单行，按 C 语法手工重建换行/缩进，写成 `.txt` 再转 XML：

```python
esc = code.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('\n','<br/>')
xml = f'<pre lang="c" caption="说明"><code>{esc}</code></pre>'
# 写到文件，用 --content @file.xml 传入，避免 shell 转义
```

```powershell
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 docs +update --api-version v2 `
  --doc "https://hcnl90h70f1g.feishu.cn/wiki/<node>" `
  --command block_replace --block-id <blkid> --content "@fix.xml"
```

转义规则：标签本身不转义，只有标签内文本的 `<>&` 转义，换行 → `<br/>`。`--content` 优先用 `@file` 传文件，避免 PowerShell JSON 引号转义污染。

### 5. 修复损坏流程图

docx 导入的图块可能是损坏占位图（空白/抓混）。修复路径：

1. `docs +fetch --scope section --start-block-id <标题id> --detail with-ids` 定位 `<img>` 块，看 `name`/`caption` 是否还是源文件名（如 `image21.png` 是导入占位名，`event-barrier.png` 是修复后名）。
2. 若 CDP 抓的 PNG 抓混（相邻图 md5 相同），对照对应 `.svg` 的消息文本（`messageText`/`noteText` 的 `<tspan>`）确认每张图真实内容，从 SVG 还原 mermaid 源。
3. 用 `cdp_render_mermaid_to_png.mjs <html> <out.png> 9222`（CDP 9222 在线）渲染干净 PNG。
4. `docs +media-insert --file <png>` 上传拿 `file_token`，再 `block_replace` 把损坏 `<img>` 块替换为 `<img name="..." caption="..." src="<token>" width="480"/>`，最后 `block_delete` 删掉 media-insert 在文末产生的临时块。

### 6. 验证

```powershell
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 docs +fetch --api-version v2 `
  --doc "https://hcnl90h70f1g.feishu.cn/wiki/<node>" --format json > verify.json
```

按内容关键词匹配确认代码/图已入 pre/img，不要按旧 block_id（block_replace 后 id 已变）。`pre` 块计数应增加且目标关键词出现在某个 `<pre>` 内。

### 反思

- **探测的目的不是自动框，而是缩小范围**。批量 fetch 100+ 篇只为筛出 < 20 篇候选，最终是否框必须人/逐条核对文本决定。直接按正则命中框会把大量中文说明误框，破坏可读性。
- **不框也是一种正确决策**。这次 9 篇目标里 7 篇判定不动（命令在解释性列表项、配置在表格、suspect 是中文步骤含地址）。宁可少框不可错框。
- **损坏图要查根因再修**。CDP 抓混、docx 压行都是已知坑，修复时要从 SVG 源/语法重建，不能拿损坏产物直接回插。
- **lark-cli 1.0.42 fetch 输出含 `_notice` 字段**，管道 stdin 直传 Python 偶发 JSON 解析失败；改写文件再解析更稳。`media-download` 缺 `docs:document.media:download` scope 时，改用 SVG 源重渲染绕过，不强求补 scope。
