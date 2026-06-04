---
created: 2026-04-08
last_updated: 2026-04-08
source_session: retros/2026-04-08-1730.md
tags: [Python, SCP, remote-editing, line-offset, defensive-coding]
---

# Multi-Point Python Edit Script: Offset Tracking

## Problem

When a Python script applies multiple insertions/deletions to a file sequentially, each change shifts all subsequent line numbers. Arithmetic offset tracking (`original_line + sum_of_offsets`) is error-prone — off-by-one errors are common and hard to spot.

## Correct Approach

1. **Apply changes top-to-bottom** (lowest line number first) so earlier changes don't affect later original line numbers until their offset is computed
2. **Track cumulative offset** after each change: `offset += (new_lines - old_lines)`
3. **Always verify with content matching** at each step — compare `lines[idx]` against expected string before modifying
4. **For critical anchors (labels, unique strings), use content search** instead of offset arithmetic:
   ```python
   for i, line in enumerate(lines):
       if line.strip() == 'skip:':
           # found by content, not by offset
   ```
5. **Abort on mismatch** — never silently apply a wrong change

## Observed Error

H2 fix targeted line 733 (outer block `}`) instead of 732 (if-guard `}`). The prev-line verification caught this before any damage. Fixed by adjusting from 733 to 732 in the formula.

## Recommendation

For high-confidence edits, prefer content search over offset arithmetic. Reserve offset tracking for cases where the target line isn't unique enough for content matching.
