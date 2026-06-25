# Know_any Agent Instructions

This repository is a portable Obsidian wiki. Other AI agents may clone it on any machine, so all required navigation paths below are relative to the repository root, not to a local absolute path such as `C:\home\for_ai`.

## Authoritative Bootstrap

Before answering or editing in this repository, follow this order:

1. Read this `AGENTS.md`.
2. If the current tool is Claude Code CLI, read `CLAUDE.md` next for Claude-specific environment notes.
3. Read `wiki/index.md` to understand the canonical wiki structure.
4. Read `wiki/ai/index.md` when the task involves AI tools, solved bugs, workflows, reflections, templates, project-scoped AI notes, or server passwords.
5. If the AI task is tied to a concrete project, check `wiki/ai/projects/index.md` and then that project's local AI index if it exists.
6. Read `wiki/hot.md` for recent active context.
7. For chip-stack topics, enter through `wiki/grace/index.md`, then the nearest domain index such as `wiki/grace/fw/index.md` or `wiki/grace/kmd/index.md`.
8. Use `wiki/sources/` only for evidence checks after reading the authored wiki page.

Do not answer from random file-tree browsing when a relevant index exists. If a moved stub points to `wiki/ai/**` or another canonical page, follow the canonical target before using the old path.

## Write Rules

- Keep changes surgical and update the relevant index pages.
- Preserve moved stubs unless the user explicitly asks to remove compatibility entries.
- For material wiki changes, update `wiki/index.md`, `wiki/hot.md`, and `wiki/log.md` when applicable.
- For Grace/FW/KMD/MAS pages, update the nearest `wiki/grace/**/index.md` page as well.
- Do not use unsafe PowerShell pipelines for Chinese Markdown content; verify UTF-8 readback after writes.
- Server passwords, if provided by the user, belong in `wiki/ai/secrets/server-passwords.md`; do not echo password values in final chat responses.
- Project-scoped AI knowledge may live under `wiki/ai/projects/<project>/` when searching by project is more useful than searching by type. Keep cross-project reusable knowledge in `tools/`, `bugs/`, `workflows/`, or `reflections/`.

## Portability Rules

- Treat machine-specific paths, hosts, and credentials as local context, not as portable repository assumptions.
- Prefer repository-relative links in Markdown.
- When copying these rules into another project, replace the wiki paths with that project's actual documentation indexes.
