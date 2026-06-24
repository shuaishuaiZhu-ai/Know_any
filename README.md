# Know_any Obsidian Wiki

AI agents: start from `AGENTS.md`. Claude Code CLI starts from `CLAUDE.md`, which delegates to `AGENTS.md`. After that, use `wiki/index.md`, `wiki/ai/index.md` when relevant, and `wiki/hot.md`.

This repository is an Obsidian vault. Do not browse the file tree randomly as the first step; enter through the indexes.

## Start Here

1. `wiki/index.md`
   - Single master index for the authored wiki.
   - Use it to route into the right domain.

2. `wiki/ai/index.md`
   - AI-facing tools, solved bugs, workflows, reflections, templates, and server password records.
   - Read this when the task involves AI operation or AI-maintained knowledge.

3. `wiki/hot.md`
   - Recent context cache.

4. `wiki/grace/index.md`
   - GraceC chip-stack entry for MAS, FW, KMD, and tiny-kmd.

## Main Structure

| Path | Purpose | First-read? |
|---|---|---|
| `AGENTS.md` | Cross-agent bootstrap contract | Yes |
| `CLAUDE.md` | Claude Code CLI bridge to `AGENTS.md` | Claude only |
| `wiki/index.md` | Master wiki index | Yes |
| `wiki/ai/` | AI-facing operations knowledge | When relevant |
| `wiki/grace/` | GraceC MAS/FW/KMD/tiny-kmd knowledge | For chip-stack topics |
| `wiki/synthesis/` | Cross-source synthesis and interview material | As routed |
| `wiki/sources/` | Source mirrors and source indexes | Evidence checks only |
| `wiki/tools/` | Non-AI tool notes | As routed |
| `wiki/meta/` | Maintenance rules and audits | For wiki maintenance |
| `.raw/` | Immutable raw source material | Do not edit directly |
| `_attachments/` | Images and attachments | As linked |

## Maintenance Rules

- New analysis, technical docs, or debugging conclusions must update `wiki/index.md` and the relevant domain index.
- Grace/FW/KMD/MAS pages belong under `wiki/grace/`.
- Raw material belongs in `.raw/` or `wiki/sources/`, not the authored reading layer.
- Detailed maintenance rules live in `wiki/meta/wiki-maintenance-rules.md`.
