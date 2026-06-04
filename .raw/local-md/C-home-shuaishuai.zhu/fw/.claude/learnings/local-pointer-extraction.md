---
created: 2026-03-31
last_updated: 2026-03-31
source_session: retros/2026-03-31-1916.md
tags: [firmware, scheduling, bitmask, HCQD, pending-mask]
---

# Local Pointer Extraction: pending_mask Bitmask Pattern

## Context
In HCQD round-robin scheduling, we need to know which HCQDs are currently in a pending state (event_wait, atomic_wait, wait_host, block_mask_wait) so the round-robin selector can skip them.

## Key Insight
Build a `pending_mask` bitmask during the for-loop that scans pending states. Then use bitwise AND with the NOT of this mask to filter the candidate bitmask:

```c
available = candidate & ~pending_mask;
```

This extracts only the "truly available" HCQDs — those with data AND not currently blocked by a pending operation.

## Application
```c
rt_uint32_t pending_mask = 0;
for (hcqd_id = 0; hcqd_id < 8; hcqd_id++) {
    if (/* any pending condition */) {
        handle_pending(hcqd_id);
        pending_mask |= BIT(hcqd_id);
        continue;
    }
}
// After loop: filter candidate bitmask
rt_uint32_t available = ib_get_candidate_bitmask() & ~pending_mask;
hcqd_id = cmd_find_next_hcqd(available, cmd_last_hcqd);
```

## Why This Matters
- Event CMD keeps candidate bit=1 during pending (peek doesn't consume)
- Without pending_mask filtering, round-robin would re-peek the same event
- With filtering, pending HCQDs are skipped, and other HCQDs get scheduled normally

## Related
- `.claude/learnings/struct-deduplication.md`
- `cmd_entry_roundrobin_design.md` V3
