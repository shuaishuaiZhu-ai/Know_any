---
created: 2026-03-31
last_updated: 2026-03-31
source_session: retros/2026-03-31-1916.md
tags: [firmware, design-pattern, scheduling, HCQD, V2-V3-evolution]
---

# Struct Deduplication: Per-HCQD vs Global Pending

## Context
When redesigning HCQD scheduling from V2 to V3, a critical design error was identified: using a single global `has_pending` flag that blocked ALL HCQD scheduling when ANY single HCQD was pending.

## Key Insight
Pending state is **per-HCQD**, not global. Each HCQD's pending condition only affects that specific HCQD. The original code uses `continue` in the for-loop, which skips only the current HCQD and proceeds to the next.

**Wrong (V2):**
```c
rt_bool_t has_pending = RT_FALSE;
for (...) {
    if (pending) { has_pending = RT_TRUE; }
}
if (!has_pending) { /* candidate scheduling */ }  // ALL blocked if ANY pending!
```

**Correct (V3):**
```c
rt_uint32_t pending_mask = 0;
for (...) {
    if (pending) { pending_mask |= BIT(hcqd_id); continue; }
}
available = candidate & ~pending_mask;  // Only pending HCQDs filtered
```

## Application
When designing scheduler changes:
1. Always check the ORIGINAL code's per-element vs global semantics
2. `continue` in a for-loop = per-element skip, NOT global blocking
3. Use per-element bitmask tracking instead of boolean flags when elements are independent
4. Read the actual source code before designing — subagent summaries can miss semantic details

## Related
- `.claude/learnings/local-pointer-extraction.md`
- `cmd_entry_roundrobin_design.md` V3 Section 5
