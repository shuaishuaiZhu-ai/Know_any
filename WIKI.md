# Know_any Wiki Schema

AI agents: start from `AGENTS.md`. Claude Code CLI starts from `CLAUDE.md`, which delegates to `AGENTS.md`.

This vault uses Obsidian as the default UI. Markdown files are the persistent knowledge product. Paths below are repository-relative so the repository can be cloned on any machine.

## Canonical Entrances

- `AGENTS.md` - cross-agent bootstrap contract.
- `CLAUDE.md` - Claude Code CLI bridge to `AGENTS.md`.
- `wiki/index.md` - single master wiki index.
- `wiki/ai/index.md` - AI-facing tools, solved bugs, workflows, reflections, project-scoped notes, templates, and secrets.
- `wiki/ai/projects/index.md` - optional project-first routing for AI knowledge.
- `wiki/grace/index.md` - GraceC chip-stack entry.
- `wiki/hot.md` - recent context cache.
- `wiki/log.md` - maintenance log.
- `wiki/meta/wiki-maintenance-rules.md` - write and routing rules.

## Structure

```text
repo-root/
|-- AGENTS.md          # cross-agent bootstrap contract
|-- CLAUDE.md          # Claude Code CLI entry bridge
|-- README.md          # human entry and quick start
|-- WIKI.md            # this schema
|-- .raw/              # immutable source material
|-- wiki/              # authored knowledge base
|   |-- index.md       # master catalog
|   |-- ai/            # AI-facing operations knowledge
|   |   `-- projects/   # optional project-first AI routing
|   |-- hot.md         # recent context cache
|   |-- log.md         # operation log
|   |-- grace/         # GraceC MAS/FW/KMD/tiny-kmd stack
|   |-- synthesis/    # cross-source synthesis and interview material
|   |-- sources/      # source mirrors and source indexes
|   |-- tools/        # non-AI tool notes
|   |-- canvases/     # Obsidian canvas files
|   `-- meta/         # maintenance rules and audits
|-- _templates/
|-- _attachments/
`-- .obsidian/
```

## Rules

- Default view is Obsidian, not generated HTML.
- `.raw/` is read-only source material.
- `wiki/` pages may be created and maintained by AI agents.
- AI operational knowledge belongs under `wiki/ai/`. Use `wiki/ai/projects/<project>/` when project-first retrieval is clearer than type-first retrieval.
- GraceC technical content belongs under `wiki/grace/`.
- New analysis or technical docs must update `wiki/index.md` and the relevant domain/subdomain index.
- Prefer repository-relative Markdown links, frontmatter, and short focused pages.
- Update `wiki/log.md` and `wiki/hot.md` after significant ingest or restructure work.

## Current Domain

GraceC CP MAS, FW firmware, KMD, AI workflows, solved toolchain bugs, and durable project reflections.
