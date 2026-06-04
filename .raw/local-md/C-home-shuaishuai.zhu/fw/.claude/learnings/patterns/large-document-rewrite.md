---
created: 2026-04-08
last_updated: 2026-04-08
source_session: retros/2026-04-08-1630.md
tags: [documentation, rewrite, design-doc, patterns]
---

# Large Document Rewrite Pattern

## When to Use
- Document needs near-total rewrite (>70% of content changes)
- Multiple interdependent sections must stay consistent (e.g., pseudocode matches actual code, comparison tables reflect all versions)

## Pattern
1. **Read all source material first**: current document + actual code + plan file
2. **Verify data points**: grep/search the codebase for concrete facts (e.g., all `pending_mask` set/clear points) before writing
3. **Write in one pass**: Use the Write tool to replace the entire file rather than incremental Edit — prevents drift between early and late sections
4. **Cross-reference**: Ensure pseudocode in the document matches actual code; ensure comparison tables cover all versions mentioned

## Anti-patterns
- Incremental section-by-section Edit on a major rewrite — risks inconsistency between early sections (written first) and later sections
- Writing documentation without reading the actual code — risks inaccuracy in lifecycle tables, pseudocode, etc.

## Observed in Session
- V6→V7 document rewrite: 719 lines V6 → full V7 rewrite with 10 sections + appendix
- Verified 20 `pending_mask` references via SSH grep before writing lifecycle table
- One-pass write ensured all Mermaid diagrams, pseudocode, and comparison tables were internally consistent
