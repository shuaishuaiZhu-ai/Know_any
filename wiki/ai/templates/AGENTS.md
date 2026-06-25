# AGENTS.md

## Bootstrap Contract Propagation

When entering any project or vault, inspect the top-level `CLAUDE.md` and `AGENTS.md` first. If neither file contains a read-order constraint for the relevant wiki or documentation indexes, add that constraint before doing substantive work, or explicitly report that it is missing when edits are not allowed.

For this vault, the required constraint is: read `wiki/index.md`, then `wiki/ai/index.md` when the task involves AI tools, solved bugs, workflows, reflections, project-scoped AI notes, templates, or server passwords; if a task names a concrete project, check `wiki/ai/projects/index.md`; then read `wiki/hot.md` for recent context. Do not rely on random file-tree browsing when a relevant index exists.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

## Think Before Coding

- State assumptions explicitly when they affect implementation.
- If multiple interpretations exist, surface them before choosing.
- If something is unclear and cannot be discovered locally, ask before editing.

## Simplicity First

- Write the minimum code that solves the requested problem.
- Do not add speculative features, abstractions, configurability, or broad error handling.
- Match the existing project style even if another style is personally preferred.

## Surgical Changes

- Touch only files needed for the request.
- Do not clean up unrelated code, comments, formatting, or dead code.
- Remove only imports, variables, or helpers made unused by your own changes.

## Goal-Driven Execution

For multi-step work, use verifiable goals:

1. Reproduce or locate the current behavior.
2. Make the smallest targeted change.
3. Run the narrowest meaningful verification.
4. Report what was verified and what remains unverified.

## Project-Specific Notes

- Add source-of-truth paths here.
- Add build/test commands here.
- Add deployment or remote-host boundaries here.
- Add documentation/index update rules here.
- Add project-scoped AI knowledge under `wiki/ai/projects/<project>/` when retrieval should start from the project name.
