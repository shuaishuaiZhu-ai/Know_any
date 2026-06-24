---
type: tool
title: "钉钉到�?�书迁移脚本�? Skills 调用手册"
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

# 钉钉到�?�书迁移脚本�? Skills 调用手册

�?句话心智模型：DWS 负责读取/导出钉钉，`dingtalk-feishu-migration` 脚本负责生成�?审�?�的 manifest、附件和�?复�?�划，`lark-cli` 负责写入/�?复�?�书；没有�?�过严格审�?�和线上读回前，不�?��?�称迁移完成�?

## 固定入口

| �?                            | �?                                                             |
| ---------------------------- | ------------------------------------------------------------- |
| �?地工作目�?                       | `C:\Users\18355\Documents\learning`                           |
| 迁移脚本�?�?                       | `C:\Users\18355\Documents\learning\dingtalk-feishu-migration` |
| Feishu/Lark profile / App ID | `cli_aa9d4e8d9eb91cc4`                                        |
| App Secret                   | <已省略；使用既有 profile �? FEISHU_APP_SECRET>                              |
| 固件组群�? ID                     | `oc_4f95921bd0d4d21abac09c0090b21ce9`                         |
| 常用�?有�?? open_id                | `ou_6f65235a41b26d50707d8670c1fc9b30`                         |
| Firmware �?标文件夹 token         | `W6RRfr6l8lXMqkdCSvPctQ1Gn5d`                                 |
| bringup 重传�?标文件夹 token        | `OCD7fC3a5lRjmVdc0V0czOvwnRQ`                                 |

安全规则：App ID �?以写入文档，因为它用于�?�择 profile；App Secret 不能明文写入 wiki。Claude/Codex �?要调用时，应优先复用已有 `lark-cli` profile；�?�果必须从环境�?�取，只读取 `FEISHU_APP_SECRET`，不得把值打印到输出、报告或错�??日志�?

## 必�?? Skills

�?始迁移前，Claude/Codex 必须先�?�这�? skill，按 skill �?由调用工具，而不�?直接手写�? API�?

| 场景 | Skill �?�? |
|---|---|
| 钉钉到�?�书总工作流 | `C:\Users\18355\.codex\skills\dingtalk-feishu-doc-migration\SKILL.md` |
| 钉钉 DWS 文档/�?�?/导出 | `C:\Users\18355\.agents\skills\dws\SKILL.md` |
| 飞书认证、profile、公共约�? | `C:\Users\18355\.agents\skills\lark-shared\SKILL.md` |
| 飞书云空间�?��?�入、权限�?�移动�?�删�? | `C:\Users\18355\.agents\skills\lark-drive\SKILL.md` |
| 飞书新版文档读写、DocxXML/Markdown | `C:\Users\18355\.agents\skills\lark-doc\SKILL.md` |
| 飞书 Wiki 节点/知识�? | `C:\Users\18355\.agents\skills\lark-wiki\SKILL.md` |
| 按�?�名/�?箱解析成员�?�群�? | `C:\Users\18355\.agents\skills\lark-contact\SKILL.md` |
| 群聊、消�?、群成员 | `C:\Users\18355\.agents\skills\lark-im\SKILL.md` |
| 文档/学习页需要画图时 | `C:\Users\18355\.codex\skills\technical-diagram-generator\SKILL.md` |
| 用户显式要求 PM/并�?�推进时 | `C:\Users\18355\.codex\skills\pm-mode\SKILL.md` |

## 认证与�?��??

```powershell
dws auth status
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 auth status
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 drive +inspect --url <feishu_url> --as bot
```

PowerShell 下调�? `lark-cli --params` 时优先使�? `@params.json`，避�? JSON 引号�?义污染�?�每次迁移前�?认当�? profile �? `cli_aa9d4e8d9eb91cc4`，不要�??用默�? profile�?

## 核心脚本地图

| 脚本 | 用�?? |
|---|---|
| `migrate_dingtalk_tree_to_feishu.py` | �?通钉钉文件夹树迁移，生成 manifest�? |
| `migrate_visible_my_files.py` | 根据�?�?/�?见树手工建树的迁移样例�?? |
| `patch_dws_doc_export_commands.py` | �? DWS 隐藏 docx 导出 submit/query 命令�? |
| `export_dingtalk_docx_import_feishu.py` | 钉钉 docx 导出 -> 飞书导入 -> 验证 -> �?移所有权 -> �?选删除旧页�?? |
| `audit_and_repair_firmware_migration.py` | 审�?�标题�?�空文档、图片缺失�?�流程图缺失、fetch 错�??�? |
| `insert_browser_flowchart_repairs.py` | 把浏览器�?�?/导出的流程图插回飞书文档指定位置�? |
| `cdp_capture_dingtalk_visuals.mjs` / `cdp_dingtalk_probe.mjs` / `cdp_dingtalk_frame_probe.mjs` / `cdp_extract_dingtalk_svgs.mjs` | 登录态浏览器兜底提取钉钉视�?�块、iframe、SVG 和截图�?? |
| `patch_dws_attachment_command.py` | �? DWS 隐藏附件下载命令�? |
| `download_dingtalk_attachments.py` | 根据资源 manifest 下载钉钉附件�? |
| `extract_dingtalk_attachment_positions.js` | 在钉钉页面浏览器上下文提取附件位�?、表格�?�列、资�? ID�? |
| `insert_feishu_attachments.py` | 把本地文件作为�?�书文档附件卡片插入�?�? block�? |
| `reconcile_dingtalk_attachments.py` | 对齐附件提取、下载�?�插入结果�?? |
| `grant_firmware_chat_permissions.py` | 给固件组群聊 `oc_4f95921bd0d4d21abac09c0090b21ce9` 增加协作�?/�?管理权限�? |
| `grant_wiki_subtree_chat_edit.py` | 给�?�书 Wiki 节点子树增加固件�? `edit` 权限；支�? dry-run、失败项 backing docx fallback、写入响应校验�?? |
| `set_folder_collaborator_only_permissions.py` | 递归把文件夹下内容�?�为仅协作�?�可访问�? |
| `revoke_shared_permissions.py` | 收回旧共�?链接或公�?权限�? |
| `verify_feishu_tree_against_manifest.py` | �? manifest 对比飞书线上�?录层级和文件存在性�?? |
| `scan_empty_placeholder_pages.py` | �?描钉钉源不存在或源空但�?�书异常的占位页�? |
| `delete_replaced_old_feishu_docs.py` | 替换页验证�?�过后删除旧坏页�? |


## Wiki 权限批�?�理 Guardrail

飞书 Wiki 或迁移产物权限写操作前，先执行本地证�?恢�?�，不�?�直接用默�?? profile 搜群或猜主体�?

1. 先查�?仓库 index、manifest、report 和现有脚�?，确认目标目录�?�profile、identity 和协作�?�主体�??
2. �?项目默�?? profile �? `cli_aa9d4e8d9eb91cc4`；不要使用未�?认的默�?? profile�?
3. “固件组”默认使�? `openchat oc_4f95921bd0d4d21abac09c0090b21ce9`，不要先在线搜索群名�?
4. 批量写权限必须先 dry-run 并保存报告，�?认节点数、token/type、权限和主体后再 `--yes`�?
5. Wiki 子树优先�? `type=wiki` + `node_token` 授权；遇�? `1063002 Permission denied` 时，对失败项改用 backing `obj_token/obj_type` 补授�?
6. 验证优先读成员列�?；若�? `docs:permission.member:retrieve` 等�?�取 scope，则至少校验写入响应�?�? `member_type/member_id/perm`，并在报告中标明验证限制�?

�?规则来自 [飞书 Wiki 权限批�?�理工作流�?�盘](<../reflections/codex/evolution/2026-06-17-feishu-permission-workflow.md>)�?

## 标准迁移流程

1. 读取 skill：先�? `dingtalk-feishu-doc-migration`，再按场�?�? `dws`、`lark-shared`、`lark-drive`、`lark-doc`�?
2. 认证预�??：确�? DWS �? `lark-cli --profile cli_aa9d4e8d9eb91cc4` 都可�?，并�? `drive +inspect` 验证�?标文件夹/文档�?访问�?
3. �?描钉钉树：用 DWS 记录每个节点�? `nodeId`、标题�?�类型�?�父子关系�?�源 URL、是否有 children�?
4. 建�?�书�?录：钉钉 folder 映射为�?�书 folder；钉�? file �? `hasChildren=true` 时，父节点�?�建成文件夹，父文档放入该文件夹内，children 放入同一层级�?
5. 迁移正文：普通文档可�? Markdown create；�?�杂表格、图片�?�流程图、Gantt、unknown block、空页�?�严重图片缺失优先走 docx 导出再�?�入飞书�?
6. 迁移附件：遇�? `[我的附件]` 或附�? block，必须提取浏览器位置、下载附件�?�插入�?�书附件卡片，并删除占位文本；完成条件是提取�? = 下载�? = 插入数，飞书 `block_type=23` 数量匹配�?
7. �?复流程图：遇�? `[我的流程图]`、�?�立 `[]`、DWS `blockType=unknown` 或�?��?? `visual_count_gap > 0` 时，进入浏�?�器/CDATA/SVG/�?图兜底流程，插入到源段落附近�?
8. �?复标题和位置：`docs +create --folder-token` 不一定可见，必须 `drive +move`；新文档�?能显�? `Untitled`，必须用 `drive files patch` �?标�?��??
9. 权限与所有权：按�?求转移所有权，给固件组群聊�?�加�?管理权限，必要时递归关闭�?�?链接，保证拿到链接也看不了�??
10. 审�?�验收：fetch 飞书线上内�?�，对照 manifest 和源统�?��?�未通过时继�?�?，不要只看本地�?�入成功�?
11. 清理旧页：只有新文档验证通过、目录层级�?�确、权限�?�确后，才删除旧坏页、空占位页或共享�?录遗留�??

## 常用命令模板

�?录一致�?�验证：

```powershell
python dingtalk-feishu-migration\verify_feishu_tree_against_manifest.py `
  --manifest dingtalk-feishu-migration\firmware-tree\manifest.json `
  --profile cli_aa9d4e8d9eb91cc4 `
  --as bot `
  --report dingtalk-feishu-migration\firmware-tree\tree-verify.json
```

给固件组群聊增加�?管理权限�?

```powershell
python dingtalk-feishu-migration\grant_firmware_chat_permissions.py `
  --manifest dingtalk-feishu-migration\firmware-tree\manifest.json `
  --profile cli_aa9d4e8d9eb91cc4 `
  --identity bot `
  --chat-id oc_4f95921bd0d4d21abac09c0090b21ce9 `
  --yes `
  --report dingtalk-feishu-migration\firmware-tree\grant-firmware-group.json
```

把目标文件夹递归设为仅协作�?�可访问�?

```powershell
python dingtalk-feishu-migration\set_folder_collaborator_only_permissions.py `
  --folder-token OCD7fC3a5lRjmVdc0V0czOvwnRQ `
  --folder-name bringup `
  --profile cli_aa9d4e8d9eb91cc4 `
  --identity bot `
  --yes `
  --report dingtalk-feishu-migration\firmware-tree\bringup-collaborator-only.json
```

�?描空�?/占位异常页：

```powershell
python dingtalk-feishu-migration\scan_empty_placeholder_pages.py `
  --manifest dingtalk-feishu-migration\firmware-tree\manifest.json `
  --profile cli_aa9d4e8d9eb91cc4 `
  --identity bot `
  --report dingtalk-feishu-migration\firmware-tree\empty-placeholder-scan.json
```

完整质量审�?�：

```powershell
python dingtalk-feishu-migration\audit_and_repair_firmware_migration.py `
  --work-dir dingtalk-feishu-migration\firmware-tree `
  --fetch-feishu `
  --report dingtalk-feishu-migration\firmware-tree\quality-audit-fetch.json
```

验收要求：`file_name_repairs`、`word_import_required`、`empty_migration`、`severe_image_loss`、`flow_visual_missing`、`visual_count_gap`、`fetch_errors` 全部�? 0�?

## Claude 调用注意事项

- 先�?�本页和相关 skill，再执�?�脚�?；脚�?输出、manifest、report 都�?�保留，方便追责和续跑�??
- 不�?�因�? Markdown create 成功就�?�为完成；带图片、表格�?�流程图、附件的页面必须做线�? fetch 审�?��??
- 不�?�把任意 `img_tags + table_tags` 当作流程图成功，流程图需要按源顺序和位置做�?��?��?�盖�?
- 不�?�给缺扩展名�? PDF/文件直接上传；否则�?�书�?能显示为�?知灰色文件�?�上传前保留原�?�扩展名�?
- 不�?�把“源节点�? children �? file”迁成一�?空同名文档；它应成为文件夹，并把�?�?文档�? children 放进去�??
- 不�?�把 App Secret 写入 wiki、prompt、shell 命令、manifest �? report�?
- 写中�? wiki 后必须�?�回�?查，�?认没有连�?�?号乱码�?�异常乱码�?�异常低 CJK 字�?�量�?

## 已踩坑结�?

- DWS Markdown 经常丢流程图，docx 导出也可能丢 `unknown block`；必要时必须浏�?�器�?�?/导出 SVG 后回插�??
- `docs +create --folder-token` �?能返回成功但文件夹不�?见；创建后�?�是执�?? `drive +move`�?
- 飞书新建/导入文档�?能显�? `Untitled`；迁移后必须统一 patch title�?
- 飞书文件夹的�?�?权限�?要�?�归处理子资源；不�?�只 patch 父文件夹就�?�为链接访问关闭�?
- 空占位页会�?�致飞书里出现连�?�?号乱码或无源文档；用 `scan_empty_placeholder_pages.py` 找出并确认删除�??
- CDP 抓钉钉流程图时虚拟滚动会把相邻两张图抓成同一张（md5 相同）；必须对照 SVG 消息文本区分，必要时�? SVG 还原 mermaid 源重新渲染，不�?�直接用抓混�? PNG�?
- DWS docx 导出会把多�?? C 代码压成单�?�（换�?�信�?丢失）；补代码�?�时必须�? C �?法手工重建换�?/缩进，不能原样�?�进 pre�?
- `docs +update block_replace` 后原 block_id 会变成新 id；验证改动的正确方式�?按内容关�?词匹配，不�?�再按旧 block_id 查找�?
- `block_replace` 替换图片块会重新绑定媒体，新图的 `src` token �? `media-insert` 返回�? token �?能不同；以块属�?�（name/caption/dims）更新为准�??

## 迁移后补�?：代码�?�与损坏图修复工作流

迁移完成后，飞书页面常有两类遗留质量�?题：�? docx 导入时代码�?�散落在�?�? `<p>` 里没框成 `<pre>`；② 流程�?/示意图�?�入后是损坏占位图（空白或抓混）。本节是批量探测 + 精修的工作流�?

### 1. 列出�?�? wiki 子树

```powershell
# 解析 wiki 节点 token �? space_id
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 wiki spaces get_node `
  --params '{"token":"<wiki_node_token>"}' --format json
# 递归列子节点（需 space_id + parent_node_token，page_size 上限 50，翻 page_token�?
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 wiki nodes list `
  --params '{"space_id":"<space_id>","parent_node_token":"<node>","page_size":50}' --format json
```

递归脚本：�?�每�? `obj_type=docx` 的叶子收�? `node_token`/`obj_token`，写�? `*-leaves.json` 供后�?批�?�理。`sheet`/`file` 类型不属于代码�?�范畴，跳过�?

### 2. 批量探测�?�?框代码的文档

对每�? docx 叶子�? lightweight fetch（不�? `--detail`），统�?�现�? `<pre>` �? + �?�? pre 内的代码特征段数�?**关键：探测�?�则会�??�?**，必须给 suspect 打分并�?�置阈�?�：

```python
CODE = re.compile(r'uint32_t|uint16_t|#define|typedef\s+struct|->|0x[0-9a-fA-F]{2,}|\bfor\s*\(|\breturn\s+[a-z]')
# 对每�? <p>/<li>（先剔除 <pre> 内�?�）�?
score = len(CODE.findall(txt)) + (2 if re.search(r'[{}]', txt) else 0) + (1 if txt.count(';')>=2 else 0)
# score>=2 才算候�??
```

110 篇文档跑出来 21 篇�?��?�，但�?�条核�?? suspect 文本后真正需要�?�的�?有个位数�?

### 3. 鉴别真代�? vs �?报（�?重�?�）

逐条看�?��?�的 suspect 文本，区分四类：

| 类型 | 特征 | 处理 |
|---|---|---|
| 真裸代码 | CJK 字�?? < 15 且代�? token �? 3（`#define`/`typedef`/`struct`/`uint32_t`/`->`/`;`/`{}`/`0x`�? | 框成 pre |
| �?文�?��?�含地址 | "SW polling pcie_link_up 寄存�?(Address: 0x0500_101c)..." CJK �? | 不�?? |
| 流程�?�? | "Decoder API -> DWL -> Driver -> Hardware" | 不�?? |
| 单�?�命令在解释性列表项 | "示例：drscan mytap 8 0xAA -endstate DRPAUSE �? �? mytap �? DR 移入..." 命令+�?文解释混�? `<li>` | 不�?�（框了丢解释�?�断列表�? |
| 配置由表格承�? | AdapterNetCtl 字�?��?��?�地�?范围�? | 不�?�（表格已是合理呈现�? |

铁律�?**CJK < 15 且代�? token �? 3** 才�?��?�中文�?�落里偶然出现单�? `0x` �? `->` 不算代码�?

### 4. 补�?�：block_replace 包入 pre

�? `docs +fetch --detail with-ids` 定位�?�? block_id，从 docx 源（`word/document.xml` �? `<w:t>` run 切分）或钉钉原页恢�?�代码原文�?�docx 源若已压成单行，�? C �?法手工重建换�?/缩进，写�? `.txt` 再转 XML�?

```python
esc = code.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('\n','<br/>')
xml = f'<pre lang="c" caption="说明"><code>{esc}</code></pre>'
# 写到文件，用 --content @file.xml 传入，避�? shell �?�?
```

```powershell
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 docs +update --api-version v2 `
  --doc "https://hcnl90h70f1g.feishu.cn/wiki/<node>" `
  --command block_replace --block-id <blkid> --content "@fix.xml"
```

�?义�?�则：标签本�?不转义，�?有标签内文本�? `<>&` �?义，换�?? �? `<br/>`。`--content` 优先�? `@file` 传文件，避免 PowerShell JSON 引号�?义污染�??

### 5. �?复损坏流程图

docx 导入的图块可能是损坏占位图（空白/抓混）�?�修复路径：

1. `docs +fetch --scope section --start-block-id <标�?�id> --detail with-ids` 定位 `<img>` 块，�? `name`/`caption` �?否还�?源文件名（�?? `image21.png` �?导入占位名，`event-barrier.png` �?�?复后名）�?
2. �? CDP 抓的 PNG 抓混（相邻图 md5 相同），对照对应 `.svg` 的消�?文本（`messageText`/`noteText` �? `<tspan>`）确认每张图真实内�?�，�? SVG 还原 mermaid 源�??
3. �? `cdp_render_mermaid_to_png.mjs <html> <out.png> 9222`（CDP 9222 在线）渲染干�? PNG�?
4. `docs +media-insert --file <png>` 上传�? `file_token`，再 `block_replace` 把损�? `<img>` 块替�?�? `<img name="..." caption="..." src="<token>" width="480"/>`，最�? `block_delete` 删掉 media-insert 在文�?产生的临时块�?

### 6. 验证

```powershell
lark-cli.cmd --profile cli_aa9d4e8d9eb91cc4 docs +fetch --api-version v2 `
  --doc "https://hcnl90h70f1g.feishu.cn/wiki/<node>" --format json > verify.json
```

按内容关�?词匹配确认代�?/图已�? pre/img，不要按�? block_id（block_replace �? id 已变）�?�`pre` 块�?�数应�?�加且目标关�?词出现在某个 `<pre>` 内�??

### 反�??

- **探测的目的不�?�?动�?�，而是缩小范围**。批�? fetch 100+ 篇只为筛�? < 20 篇�?��?�，�?终是否�?�必须人/逐条核�?�文�?决定。直接按正则命中框会把大量中文�?�明�?框，破坏�?读�?��??
- **不�?�也�?�?种�?�确决策**。这�? 9 篇目标里 7 篇判定不�?（命令在解释性列表项、配�?在表格�?�suspect �?�?文�?��?�含地址）�?�宁�?少�?�不�?错�?��??
- **损坏图�?�查根因再修**。CDP 抓混、docx 压�?�都�?已知坑，�?复时要从 SVG �?/�?法重建，不能拿损坏产物直接回插�??
- **lark-cli 1.0.42 fetch 输出�? `_notice` 字�??**，�?�道 stdin 直传 Python 偶发 JSON 解析失败；改写文件再解析更稳。`media-download` �? `docs:document.media:download` scope 时，改用 SVG 源重渲染绕过，不强求�? scope�?

- **���� `block_replace` �滻ͼƬ src ���ס����ųɹ�ʵ����Ч��**��`--command block_replace --block-id <ԭͼ��> --content '<img src="<��token>"/>'` ���� `result: success` �� fetch ������ src Ҳ����� token��������ʵ���йܵ� PNG ���Ǿɰ棨�滻ǰ���ֽ��������سߴ綼û�䣩�����Ƿ����˰� `<img>` ��� src �ֶθ����˵� media �󶨸����˾���Դ��**��ȷ�ⷨ**���� `media-insert --file <new.png>` ���� token��**append һ����ʱ img block ����� token**�������������ʱ��� href URL ��֤ PNG �ֽ���/�ߴ�==��ͼ��**��һ��������**��ȷ�� token ���ָ����ͼ����Ȼ�� `block_replace` �����**����֤**�� token �滻Ŀ��飬��� `block_delete` ��ĩ��ʱ�顣
- **��� block_replace �滻ͬһͼ���� doc �����¶��ͬ�� img ��**��ÿ�� replace ��������¿顢���¾ɿ飨������ʽ delete������ɺ���� fetch ȫ��ͳ�� `name="atomic.png"` �� img ������>1 ��ɾ������ģ��� `block_delete --block-id <����id>,<����id>` ����ɾ����
- **���� img �� width/height ���������ϸ�ƥ�� PNG ԭ����**��`block_replace` content д `width="720" height="512"` �� PNG ʵ���� 1012��578��ratio 1.751��ʱ�������� PNG ����/�ü��� 720��512����ȷ height Ӧ�� PNG �����㣨`height = width * png_h / png_w`�������� `--content` ��д height���÷��鰴 PNG ԭ��������Ӧ��
- **�� fix ʧ��ʱ��Ҫ������Դ���ݣ������ط���ʵ���йܵ�ͼ������Դ**������ҳ img ��� `href` URL �� `internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=...` �� authcode����ֱ�� HTTP GET��`urllib.request` + `User-Agent: Mozilla/5.0`�������ص����غ��� PIL/Pillow ����ʵ���سߴ硣������� viewer ������ʾ������ fetch ���ص� src token�����ű��� PNG �ļ����ɿ�������Ϊ�����˿����û���/���õ�������Դȫ����
- **CDN viewer/Read ���ߵ�������ʾ�����С�ͼƬ���á�**������ 4048��2480 �� PNG �������� Read ���߰� 4:1 ������ʾʱ�� viewer �߶����ޣ���Ѵ�ͼ�ײ�������ʾ��**������**���ײ� actor ���С���ʵ�� PNG �������б𷽷���PIL `Image.open().crop((0, h-600, w, h)).save(...)` �õײ� 600 �е��������� HTTP ���ط��� href ֱ�ӿ���ʵ�ߴ硣
- **sequence diagram SVG ����� actor �� viewport ����**����д SVG ʱ��ͼ���ײ� actor ���� `y=bottom_actor_y`���߶� `AH`��SVG viewport �� `H` ���� >= `bottom_actor_y + AH`������ actor ��׳��� viewport ���á���������`H = bottom + TOP`��ֻ�� 30 padding���� `bottom = bottom_actor_y + AH`��actor ��ױ� H �� 18-48px��**��ȷ**��`H = bottom_actor_y + AH + TOP`��
- **`lint-svg-text-overlap.cjs` �� sequence diagram ��Ϣ�в�������**������� card-based ͼ��ƣ�����Ϣ��ǩ box�������Ϸ�����ˮƽ��ͷ�ߣ������ϣ��㡸connector intersects text area������ʱ��ͼ����Ϣ��ǩ�� UML �����ͷ��ڼ�ͷ�Ϸ���**����**����ص����б�����ͼ���� linter �ġ�connector intersects text����ֻ��ע `text too close to or outside node box`��loop/note ���������߾��룩��ʱ��ͼ�����ص�Ҫ���۸��飨�� Read ���߿�ͼ�������� PIL crop �ؼ��������ء�
- **CDP `Page.captureScreenshot` ��Ⱦ SVG ʱ���� HTML wrapper ����ʵ bbox**��ֱ�� `Page.navigate("data:image/svg+xml;base64,...")` + `Emulation.setDeviceMetricsOverride` ��� height ������ SVG ʵ����Ⱦ�߶Ȳ�һ�£����½�ͼ���С�**��ȷ����**���� SVG Ƕ�� `<html><body style="margin:0;padding:0;background:#fff"><svg>...</svg></body></html>`���� `document.querySelector('svg').getBoundingClientRect()` ����ʵ w/h������ device metrics ���� `clip: {width: w, height: h}`��
- **systematic-debugging �ڶ� fix ʧ��ʱ�����ռ����֤��**������ ��2 �� fix ʧ�ܺ�STOP ֱ�Ӹ�Դ���ݣ���Ϊ�ռ���ԭʼ��ʵ����֤�ݡ�������������ط���ʵ���йܵ� PNG��HTTP GET href URL������ PIL ����ʵ�ߴ硣��ȷ����� SVG ����/������Ⱦ/�����ϴ���ö࣬��һ�ζ�λ���򣨷����˸��þ�ý�壩��
