# Session Retrospective: 2026-04-08

## Summary
Implemented V7 Candidate-Driven Dispatch for CP HCQD scheduling module. V7 eliminates round-robin miss iterations by building `active = candidate | pending_mask | stop_mask` and using CTZ to directly locate valid HCQDs. N active HCQDs = N iterations, zero misses.

## Context Recovery
- V7 was designed in a previous session (577eeaa8, Apr 7) but the patch wasn't preserved
- Plan existed at `curried-roaming-garden.md` but no code artifacts survived
- Current code was V6 (static candidate cache + chain CTZ) with uncommitted changes on `zss/UpdateSchedule` branch
- Had to reconstruct V7 context from session JSONL references and existing plan file

## Changes Made

### File: `aigc_sdk/grace/applications/cp/user/cmd.c`

1. **New static variable**: `pending_mask` tracks HCQDs in pending state
2. **Flush handler**: resets `pending_mask = 0` alongside `candidate = 0`
3. **cmd_entry main loop**: complete rewrite from V6 round-robin to V7 candidate-driven:
   - Build `active = candidate | pending_mask | stop_mask`
   - CTZ locate target HCQD via `cmd_find_next_hcqd(active, rr_start-1)`
   - Pending checks use `goto skip` (sets `rr_start = (hcqd_id+1) % 8`)
   - Removed: else-branch CTZ jump, chain CTZ (no longer needed)
4. **Handler `pending_mask` operations** (7 set + 8 clear across all handlers):
   - `cmd_handle_atomic_packet`: set on WAIT, clear on DONE (2 branches each)
   - `cmd_handle_event_packet`: set on BARRIE_WAIT/DEPENDENCY, clear on DONE/UNDEPENDENCY
   - `cmd_handle_wait_host_trig`: set on TRIG_DONE
   - `cmd_handle_wait_host_packet`: set on HANDLE_WAIT
   - `cmd_handle_wait_host_poll`: clear on HANDLE_DONE
   - `cmd_entry` block_mask paths: set on new WAIT, clear on re-check DONE

## Bug Found and Fixed During Review
- **block_mask re-check ordering**: `cmd_handle_packet` was called before `pending_mask &= ~BIT`, causing a race where a newly-set pending bit (from inner handler) would be immediately cleared
- **Fix**: moved `pending_mask &= ~BIT` and `status = DONE` before `cmd_handle_packet`

## Verification
- Build passed: `./gpu_fw_build.sh -p grace -b debug -f cp_user -t gcc -l backdoor -m 3d-dram -d 1-die`
- Code review: all pending_mask set/clear paths verified symmetric
- Binary size: 61064 bytes (same as V6, no regression)

## Patterns Used
- Python script via SCP for reliable multi-line edits (avoids SSH heredoc escaping issues)
- Line-range replacement for large block changes
- chr(92)+chr(110) for `\n` in LOG_D strings (known SSH escaping issue)
- Separate review agent for independent code audit
