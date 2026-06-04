# Learning: Candidate Bitmask Caching Pattern

## Category: patterns

## Context
V5 HCQD round-robin reads `ib_get_candidate_bitmask()` (MMIO) every iteration that reaches the candidate branch. CTZ jump saves iterations but the jumped-to HCQD still re-reads MMIO redundantly.

## Pattern: Cached Candidate with Consume
- Cache `candidate` as a static variable (not local)
- Only read MMIO when `candidate == 0` (cache empty)
- After handling an HCQD: `candidate &= ~(1U << hcqd_id)` (consume the bit)
- CTZ jump reuses cached candidate directly — no redundant MMIO
- Flush must invalidate cache: `candidate = 0`

## Key Invariants
1. `candidate == 0` → must read MMIO (prevents permanent stale)
2. Event cmd pending check is BEFORE candidate branch → no double-peek even if register bit=1
3. Flush resets `candidate = 0` → prevents stale cache across flush boundaries

## MMIO Savings
- 3 candidates in one batch: V5 needs ~6 MMIO, cached needs ~2
- CTZ jump scenario (hcqd0→hcqd3): V5 needs 2 MMIO, cached needs 1

## Tags
firmware, HCQD, MMIO-optimization, candidate-bitmask, caching, round-robin
