---
type: tool
title: "钉钉到飞书迁移脚本与 Skills 调用手册"
created: 2026-06-12
updated: 2026-06-12
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
| App Secret                   | Fnvvh33dNp3U4zkSUUgpOgX7lugAAqUa                              |
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
| `set_folder_collaborator_only_permissions.py` | 递归把文件夹下内容设为仅协作者可访问。 |
| `revoke_shared_permissions.py` | 收回旧共享链接或公开权限。 |
| `verify_feishu_tree_against_manifest.py` | 按 manifest 对比飞书线上目录层级和文件存在性。 |
| `scan_empty_placeholder_pages.py` | 扫描钉钉源不存在或源空但飞书异常的占位页。 |
| `delete_replaced_old_feishu_docs.py` | 替换页验证通过后删除旧坏页。 |

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
