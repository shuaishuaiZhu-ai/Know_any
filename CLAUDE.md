# for_ai — Obsidian Knowledge Vault

Purpose: persistent engineering knowledge base for GraceC CP MAS, FW CP firmware, and related investigations.

## Default Interface

Use Obsidian by default. The vault root is:

`C:\home\for_ai`

Open this folder as an Obsidian vault. Do not regenerate or rely on standalone HTML graph files unless explicitly requested.

## Working in Claude Code (this environment)

When the vault is opened by Claude Code (headless Linux) instead of the Obsidian desktop app:

- Working copy is `/root/workspace/wiki`; the Windows vault root `C:\home\for_ai` is the same vault on another machine. In-repo paths (`wiki/`, `.raw/`, `_attachments/`) are relative and match either way.
- No Obsidian UI runs here: edit Markdown directly and resolve `[[wikilinks]]` by file basename yourself. Do not expect plugins, graph view, or Templater to execute.
- Single branch `wiki` (no `main`/`master`). Commit and push to `origin/wiki`; access is over SSH (`git@github.com:shuaishuaiZhu-ai/Know_any.git`).
- `.gitattributes` enforces `eol=lf`. Files authored on Windows may show as modified right after checkout — that is CRLF→LF normalization, not a content change; don't "fix" it unless asked.
- Reference firmware source is remote: `shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw/` (per `wiki/hot.md`).

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