# Session Retrospective: 2026-04-07

## Summary
Analyzed a performance issue in V5 cmd_entry where CTZ jump causes a redundant MMIO read of candidate bitmask. User proposed caching candidate outside the while loop. Designed an improved "Cached Candidate with Consume" architecture (V6 candidate) that caches the bitmask, uses bit-clear after handling each HCQD, and only re-reads MMIO when cache is empty.

## Key Analysis
- V5 problem: CTZ jump from hcqd0 to hcqd3 saves iteration but hcqd3 still reads MMIO again (redundant)
- User's initial idea had a contradiction: "read after handling" negates the caching benefit
- Proposed solution: cache candidate as static var, clear bit after consume (`candidate &= ~(1U << hcqd_id)`), only read MMIO when candidate==0

## Risks Identified
- **Stale candidate**: new HCQDs arriving while processing cached candidates won't be seen until cache empties. Acceptable because pending checks are memory-only (no MMIO) and run every iteration
- **Event cmd**: candidate bit stays 1 in register even after peek-only; but pending check catches it before candidate branch, so no double-peek
- **Flush invalidation**: must set `candidate = 0` on flush to prevent stale cache

## Status
- Architecture proposal presented, awaiting user confirmation before updating design document
