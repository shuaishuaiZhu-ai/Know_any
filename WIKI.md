# for_ai — Obsidian Wiki Schema

This vault uses Obsidian as the default UI. Markdown files are the persistent knowledge product.

## Canonical Entrances

- `wiki/index.md` — single master index.
- `wiki/fw/index.md` — FW technical knowledge base.
- `wiki/hot.md` — recent context cache.
- `wiki/log.md` — maintenance log.
- `wiki/meta/wiki-maintenance-rules.md` — write and routing rules.

## Structure

```text
C:\home\for_ai\
├── .raw\              # immutable source material
├── wiki\              # AI-authored knowledge base
│   ├── index.md       # master catalog
│   ├── hot.md         # recent context cache
│   ├── log.md         # operation log
│   ├── fw\           # firmware technical knowledge
│   ├── synthesis\    # cross-source synthesis and interview material
│   ├── sources\      # source mirrors and source indexes
│   ├── tools\        # tool-specific knowledge
│   ├── canvases\     # Obsidian canvas files
│   └── meta\         # maintenance rules and audits
├── _templates\
├── _attachments\
├── .obsidian\
├── WIKI.md
└── CLAUDE.md
```

## Rules

- Default view is Obsidian, not generated HTML.
- `.raw/` is read-only source material.
- `wiki/` pages may be created and maintained by the AI.
- FW technical content belongs under `wiki/fw/`.
- New analysis or technical docs must update `wiki/index.md` and the relevant domain/subdomain index.
- Prefer wikilinks, frontmatter, and short focused pages.
- Update `wiki/log.md` and `wiki/hot.md` after significant ingest/restructure work.

## Current Domain

GraceC CP MAS v1.4 and FW CP firmware.