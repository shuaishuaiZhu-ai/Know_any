# CLAUDE.md

## Bootstrap Contract Propagation

When entering any project or vault, inspect the top-level `CLAUDE.md` and `AGENTS.md` first. If neither file contains a read-order constraint for the relevant wiki or documentation indexes, add that constraint before doing substantive work, or explicitly report that it is missing when edits are not allowed.

For this vault, the required constraint is: read `wiki/index.md`, then `wiki/ai/index.md` when the task involves AI tools, solved bugs, workflows, reflections, templates, or server passwords, then `wiki/hot.md` for recent context. Do not rely on random file-tree browsing when a relevant index exists.

Purpose: persistent project instructions for Claude Code and compatible AI coding agents.

## Project Boundary

- State the authoritative project root and source-of-truth repository.
- If source code lives on a remote host, write the exact `user@host:path` here.
- Do not mix unrelated project dependencies, build outputs, or configuration.

## Read Order

1. Read this `CLAUDE.md`.
2. Read local `README.md`, `AGENTS.md`, and the nearest subproject docs.
3. Inspect manifests, tests, and existing conventions before editing.
4. For documentation or wiki work, update the relevant index/log/hot pages.

## Work Rules

- Keep changes surgical and directly tied to the request.
- Prefer existing patterns over new abstractions.
- Do not refactor adjacent code unless required for the task.
- Preserve user changes in a dirty worktree.
- Before finalizing, run the smallest meaningful verification and report failures clearly.

## Secrets

- Do not paste secrets into chat responses.
- Only store secrets in locations explicitly approved for the project.
- Never commit API tokens, OAuth credentials, cookies, or private keys unless the user explicitly accepts that exact risk.
