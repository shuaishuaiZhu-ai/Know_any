---
created: 2026-04-08
last_updated: 2026-04-08
source_session: retros/2026-04-08-1730.md
tags: [architecture, static-cache, MMIO, bitmask, embedded]
---

# Static Bitmask Cache Stale-Bit Hazard

## Pattern

When a static bitmask variable (`candidate`) gates an expensive operation (MMIO read) via `== 0` check, any code path that processes a bit without clearing it creates a permanent blockage. The gate condition never triggers again, and all consumers of the refreshed data are starved.

## Concrete Instance

V7 cmd.c: `candidate` (static uint32) caches MMIO result. MMIO refresh only when `candidate == 0`. Pending HCQD handlers went through `goto skip` which didn't clear candidate bit. Hardware event bit persists through MMIO re-reads → bit re-enters cache → `candidate != 0` forever → no refresh → other HCQDs starved.

## Fix Principle

**Every bit consumer must clear its bit, regardless of processing outcome.** If multiple paths process the same entity (pending handler, candidate dispatch, stop handler), the clearing should happen at a single convergence point (e.g., a shared label like `skip:`) rather than distributed across each path.

## Detection Heuristic

When reviewing code with a static bitmask cache:
1. Identify all paths that process a specific bit
2. For each path: does it execute `cache &= ~BIT` before reaching the loop boundary?
3. If any path skips the clear → stale-bit hazard exists
4. Special attention to hardware bits that don't auto-clear (event peek vs read)
