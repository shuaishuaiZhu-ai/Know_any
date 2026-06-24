# Claude Code Entry for Know_any

Claude Code CLI should use this file as its entry point, then delegate to the cross-agent contract in `AGENTS.md`.

## Required Startup

When Claude Code opens this repository:

1. Read `AGENTS.md` first. It is the authoritative cross-agent bootstrap contract.
2. Follow the repository-relative read order from `AGENTS.md`: `wiki/index.md`, then `wiki/ai/index.md` when relevant, then `wiki/hot.md`.
3. Use the Claude-specific notes below only as environment context; they do not override `AGENTS.md`.

## Repository Purpose

Know_any is a persistent Obsidian knowledge base for GraceC CP MAS, FW firmware, KMD, AI tool workflows, solved bugs, and project reflections.

## Default Interface

Use Obsidian by default when a UI is available. Markdown files are the durable knowledge product. Do not regenerate or rely on standalone HTML graph files unless explicitly requested.

## Claude Code Environment Notes

- Paths in wiki links are repository-relative. The same repository may be checked out as `C:\home\for_ai`, `/root/workspace/wiki`, or another path on another machine.
- No Obsidian UI is available in headless Claude Code environments: edit Markdown directly and resolve `[[wikilinks]]` by file basename yourself.
- Check the actual branch and remote before any Git operation; do not assume a fixed branch name across machines.
- Reference firmware source may live on a remote host such as `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/`; verify current access and path before using it.
- `.gitattributes` may enforce line endings. Do not rewrite files only to normalize CRLF/LF unless asked.

## Claude-Specific Safety

- Keep edits surgical and preserve user changes in a dirty worktree.
- For wiki writes, follow the verification rules in `AGENTS.md` and `wiki/meta/wiki-maintenance-rules.md`.
- Do not paste secrets into chat responses. If server passwords are needed, use `wiki/ai/secrets/server-passwords.md` according to the user's explicit policy.
