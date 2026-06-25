---
type: index
title: "AI Section"
created: 2026-06-24
updated: 2026-06-24
tags: [ai, index]
status: active
---

# AI Section

## Repository Bootstrap

This page is not the repository root entry. AI agents should start from `../../AGENTS.md`; Claude Code CLI should start from `../../CLAUDE.md`, which delegates to `../../AGENTS.md`. After the root bootstrap, use this page for AI-specific routing.

This section is written for AI agents first. It stores reusable operating knowledge, tool manuals, solved bugs, reflections, project-scoped AI notes, templates, and server password records.

## Entry Points

| Area | Entry | Use |
|---|---|---|
| Tools | [AI Tools](<tools/index.md>) | Claude Code, Codex skills, lark-cli, all_skills, claude-code-proxy. |
| Bugs | [Solved AI Bugs](<bugs/index.md>) | Auth, container, SSH, login, and AI collaboration failures. |
| Reflections | [AI Reflections](<reflections/index.md>) | Codex daily reviews, project retrospectives, and workflow evolution. |
| Workflows | [AI Workflows](<workflows/index.md>) | Remote editing, plan mode, cross-machine collaboration, and handoff rules. |
| Projects | [AI Projects](<projects/index.md>) | Project-scoped AI notes when retrieval should start from a project name. |
| Templates | [AI Templates](<templates/index.md>) | Reusable `CLAUDE.md` and `AGENTS.md` templates. |
| Secrets | [Server Passwords](<secrets/server-passwords.md>) | Plaintext server login passwords only. |

## Organization Choice

Use two complementary routing modes:

- By type: use `tools/`, `bugs/`, `workflows/`, and `reflections/` for reusable knowledge that applies across projects.
- By project: use `projects/<project>/` when the material is tightly bound to one repo, service, product, or long-running project and AI retrieval should start from the project name.

Do not duplicate whole pages just to support both modes. Prefer one canonical page plus cross-links from the other route.

## Read Order

1. Start here and choose the relevant area.
2. If the task names a concrete project, check `projects/index.md` before broad searching.
3. Use `tools/` for commands and setup, `bugs/` for known failures, and `workflows/` for operating rules.
4. Use `reflections/` for historical reasoning and process evolution.
5. Use `sources/local-md/**/.claude/**` only when original evidence is needed.
