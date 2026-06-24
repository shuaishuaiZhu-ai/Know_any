---
type: reflection
title: "飞书 Wiki 权限批处理工作流复盘"
created: 2026-06-17
updated: 2026-06-17
tags:
  - codex
  - reflection
  - feishu
  - workflow
  - permissions
status: active
source:
  - 'C:\Users\18355\Documents\learning\dingtalk-feishu-migration\retrospective-2026-06-17-feishu-permission-workflow.md'
  - 'C:\Users\18355\Documents\learning\dingtalk-feishu-migration\skill-dingtalk-feishu-doc-migration\SKILL.md'
related:
  - "[[wiki/tools/dingtalk-feishu-migration-workflow|钉钉到飞书迁移脚本与 Skills 调用手册]]"
  - "[[wiki/codex-reflection/index|Codex 反思与进化]]"
---

# 飞书 Wiki 权限批处理工作流复盘

> Source: `C:\Users\18355\Documents\learning\dingtalk-feishu-migration\retrospective-2026-06-17-feishu-permission-workflow.md`
> Scope: 记录一次飞书 Wiki 目录权限批处理中的工作流偏差、修正路径和可复用 guardrail；不重新展开飞书 API 全量权限模型。

## 1. 一句话理解

这次问题不是飞书 API 做不到，而是执行前没有先读取本项目已有 index、manifest、profile 和权限脚本，导致一开始用默认 profile 和在线群搜索走偏；正确做法是先从本地证据恢复上下文，再做 dry-run、写入和验证。

## 2. 事件摘要

用户要求给 `https://hcnl90h70f1g.feishu.cn/wiki/TwWyw2PoXi9T7GksKx4cQaISnyc` 目录下所有文件增加固件组可编辑权限。

初始执行时直接使用默认 `lark-cli.cmd` profile，并尝试通过 `im +chat-search` 搜索“固件组”。这导致两个误导信号：默认 user 身份缺少 `wiki:node:retrieve` / `im:chat:read` scope，bot 身份也搜不到目标群。用户提醒“查看 index”后，才回到项目已有证据：正确 profile 是 `cli_aa9d4e8d9eb91cc4`，固件组已有稳定 `openchat` ID，且仓库已有固件权限脚本。

用正确 profile 后，目标 wiki 节点可由 bot 读取，实际递归范围为 33 个 wiki 节点。

## 3. 已确认事实

| 项 | 结果 |
|---|---|
| 目标根节点 | `TwWyw2PoXi9T7GksKx4cQaISnyc` |
| Wiki 空间 | `7644844900080536770` |
| 根标题 | `我的文件（来自钉盘）` |
| 递归节点数 | 33 |
| 固件组主体 | `member_type=openchat`, `member_id=oc_4f95921bd0d4d21abac09c0090b21ce9` |
| 目标权限 | `edit` |
| bot 按 wiki node 写入 | 22 成功 |
| bot 失败项 | 11 个，错误为 `1063002 Permission denied` |
| user 按 backing docx token 补授 | 11 成功 |
| 写入响应校验 | 33/33 返回固件组 `openchat` 且权限为 `edit` |

## 4. 根因拆解

- 没有把本仓库 index、migration manifest、既有 report 和脚本作为飞书写操作前的第一信息源。
- 把自然语言“固件组”当成需要在线搜索的新主体，而不是先查本地已验证的 `chat_id`。
- 没有先核对 profile，导致默认 profile 下的 scope 缺失被误看成任务阻塞。
- 对 wiki `node_token` 权限和 backing `obj_token/obj_type` 权限的差异预案不够明确。

## 5. 新工作流规则

1. 飞书权限写操作前，先查本仓库 index、manifest、报告和现有脚本；不要先用默认 profile 搜索自然语言主体。
2. 对 `C:\Users\18355\Documents\learning` 的钉钉到飞书迁移资产，优先使用 profile `cli_aa9d4e8d9eb91cc4`，除非当前任务明确给出其他 profile。
3. “固件组”默认解析为 `openchat oc_4f95921bd0d4d21abac09c0090b21ce9`；只有本地证据缺失或用户要求变更时才重新搜索。
4. 批量权限写入必须先 dry-run，报告目标 token、类型、主体、权限和数量，再执行 `--yes`。
5. Wiki 目录批量授权优先按 `type=wiki` + `node_token` 写入；遇到 `1063002 Permission denied` 时，使用节点的 backing `obj_token/obj_type` 补授。
6. 验证分两层：能读取成员列表时验证 `openchat` 成员存在且权限为 `edit` 或 `full_access`；成员列表读取缺 scope 时，至少检查写入 API 返回的 `member_type/member_id/perm`，并把限制写入报告。

## 6. 已沉淀产物

- `dingtalk-feishu-migration/grant_wiki_subtree_chat_edit.py`
- `dingtalk-feishu-migration/wiki-subtree-chat-edit-dry-run.json`
- `dingtalk-feishu-migration/wiki-subtree-chat-edit-report.json`
- `dingtalk-feishu-migration/wiki-subtree-chat-edit-retry-user-report.json`
- `dingtalk-feishu-migration/wiki-subtree-chat-edit-verify-wiki.json`

## 7. 下次检查清单

- 当前 `cwd` 是否为 `C:\Users\18355\Documents\learning`。
- 是否已搜索 memory 和本仓库相关 index/manifest。
- 是否确认 `profile`、`identity`、目标空间、目标节点和权限主体。
- 是否有既有脚本可复用。
- 是否先 dry-run 并保存报告。
- 是否把成功、失败、fallback、验证限制分别记录。