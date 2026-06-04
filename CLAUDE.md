# for_ai — Obsidian Knowledge Vault

Purpose: persistent engineering knowledge base for GraceC CP MAS, FW CP firmware, and related investigations.

## Default Interface

Use Obsidian by default. The vault root is:

`C:\home\for_ai`

Open this folder as an Obsidian vault. Do not regenerate or rely on standalone HTML graph files unless explicitly requested.

## Read Order

When needing context from this vault:

1. Read `wiki/hot.md`.
2. Read `wiki/index.md`.
3. For FW topics, read `wiki/fw/index.md` and then the relevant sub-index.
4. Read source material under `wiki/sources/` only when checking evidence.
5. Keep edits surgical and update cross-links.

## Write Rules

- Put raw inputs in `.raw/`.
- Put AI-written knowledge in `wiki/`.
- Put FW technical pages under `wiki/fw/`.
- Do not modify `.raw/` source material.
- Use wikilinks, frontmatter, and short focused pages.
- Any new analysis, technical document, or debugging conclusion must update:
  - `wiki/index.md`
  - the relevant domain index, for example `wiki/fw/index.md`
  - the relevant sub-index, for example `wiki/fw/cli/index.md`
  - `wiki/log.md`
  - `wiki/hot.md` if it is recent active context

Detailed maintenance rules: `wiki/meta/wiki-maintenance-rules.md`.