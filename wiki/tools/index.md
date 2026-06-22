---
type: index
title: "工具链知识库"
created: 2026-05-14
updated: 2026-06-18
tags: [tools, index]
status: active
---

# 工具链知识库

这里放非 FW 主链路但仍有复用价值的工具说明。

- [claude-code-proxy 项目 Wiki](<./claude-code-proxy/index.md>)
- [image_tool 固件镜像打包工具](<./image_tool 固件镜像打包工具.md>)
- [AI 协作远程编辑经验](<../synthesis/AI 协作远程编辑经验.md>)
- [Codex Skills 使用地图](<./codex-skills-map.md>)：含 `technical-diagram-generator`、`imagegen`、lark-whiteboard、SVG/Graphviz/Mermaid 的选择和验证规则。
- [all_skills:跨机器共享 Claude/Codex Skills 仓库](<./all-skills-shared-repo.md>)
- [钉钉到飞书迁移脚本与 Skills 调用手册](<./dingtalk-feishu-migration-workflow.md>)
- [AI 使用飞书 lark-cli 创建文档：从零安装、授权到验证](<./lark-cli-ai-document-guide.md>)：面向没有任何预配置的 AI Agent，覆盖 Node.js、CLI/Skills 安装、应用配置、OAuth、v2 创建与回读验收。
- [Claude Code CLI 使用教程](<./Claude Code CLI 使用教程.md>)
- [Claude Code CLI 进阶教程](<./Claude Code CLI 进阶教程.md>)
- [Claude Code 会话策略与跨 session 记忆机制](<./claude-code-session-and-memory.md>)
- [容器内 Claude Code 交互模式 401 根因与修复](<./容器内 Claude Code 交互模式 401 根因与修复.md>)：docker 容器内 `claude` 输密码后交互 TUI 报 `Please run /login · 401`（`-p` 正常）；根因是 2.1.18x 交互优先读过期 `claudeAiOauth` 而非注入 token，修复=删该块 + 密码门/heal 自动剔除保险。
