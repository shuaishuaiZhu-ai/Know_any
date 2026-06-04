---
created: 2026-04-15
last_updated: 2026-04-15
source_session: retros/2026-04-15-1345.md
tags: [revert, git, version-management, cherry-pick, firmware]
---

# Selective Version Revert: Base + Cherry-Pick Strategy

## Context
When reverting a file from version N back to version N-1, but version N contains some improvements (bug fixes, cleanup) that should be preserved. Surgically removing N's changes line by line is error-prone and risks leaving residual artifacts. Discovered during V7-to-V6 revert of cmd.c scheduling module.

## Key Insight
Instead of editing the current (V_N) file to remove unwanted changes, start from the known-good V_(N-1) base and selectively add back only the improvements worth keeping. This inverts the problem: instead of "remove everything bad" (risk: miss something), it becomes "add only what's good" (risk: miss an improvement, which is safer and easier to catch).

## Application

### Workflow
1. **Identify the base commit**: `git log --oneline` to find the last V_(N-1) commit
2. **Extract the base file**: `git show <commit>:<path>` to get the clean V_(N-1) content
3. **Catalog V_N improvements**: `git diff <V_N-1>..<V_N> -- <path>` to see all changes; classify each hunk as "scheduling change (revert)" vs "bug fix (keep)" vs "cleanup (keep)"
4. **Also check working tree**: `git diff -- <path>` for uncommitted changes that should be preserved
5. **Construct final file**: V_(N-1) base + manually merged improvements
6. **Verify no residuals**: grep for V_N-specific identifiers (variable names, function names, macros) to confirm clean revert
7. **Build and test**: compilation is the minimum acceptance gate

### When to use
- The set of changes to keep is small relative to the set of changes to revert
- V_N made structural changes (new variables, new functions, reordered logic) that are hard to surgically remove
- You need high confidence that no V_N artifacts remain

### When NOT to use
- The changes to revert are isolated to a few lines -- a simple `git checkout <commit> -- <path>` or targeted edit is faster
- V_N and V_(N-1) have diverged in surrounding context so much that the base is no longer compatible with the rest of the codebase

### Scope clarification is critical
Before executing, confirm with the user exactly which files to revert and which to leave untouched. In this session: cmd.c was reverted, but ib.c/ib.h stayed at V7 because V6 code could consume V7's ib interface without issues.

## Related
- `learnings/patterns/ssh-remote-file-editing.md` -- Tier 0 (Write + SCP) used for transferring the reconstructed file
