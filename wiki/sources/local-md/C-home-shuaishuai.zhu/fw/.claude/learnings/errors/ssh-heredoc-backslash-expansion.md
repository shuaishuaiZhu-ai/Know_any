---
created: 2026-04-03
last_updated: 2026-04-03
source_session: retros/2026-04-03-1058.md
tags: [SSH, heredoc, escaping, backslash, printf]
---

# Backslash-N Expansion Through SSH Heredoc Layers

## Context
When editing C source files containing `printf("...\n")` through SSH heredoc, the `\n` gets expanded to a literal newline character before Python receives it. This causes either a SyntaxError (unterminated string) or silently corrupted output.

## Key Insight
Even with a single-quoted heredoc delimiter (`<< 'PYEOF'`), which prevents variable expansion, the `\n` inside a Python string literal that is itself inside the heredoc can still be misinterpreted. The problem occurs because:

1. The local shell passes the heredoc content to SSH
2. SSH transmits it to the remote shell
3. The remote shell feeds it to Python's stdin

At step 3, if the Python code contains a string like `'printf("value\n")'`, Python correctly interprets `\n` as a newline -- but this is the Python-level interpretation, which means the C source file gets an actual newline instead of the two-character sequence `\n`.

The approaches that FAILED:
- Raw Python heredoc with the literal `\n` in a Python string
- Python one-liner via `python3 -c '...'` (quote nesting becomes impossible)
- sed replacement (same expansion problem)
- base64-encoded Python script (decodes fine, but the Python source still has `\n` in string literals)
- Direct `\\n` (sometimes double-escaped, sometimes still expanded depending on shell layer)

## Application
Use `chr(92) + chr(110)` in Python to construct the literal two-character sequence `\n`:

```python
bslash_n = chr(92) + chr(110)   # backslash + letter n
line = f'    printf("count: %d{bslash_n}", cnt);\n'
```

This is immune to all escaping layers because `chr()` operates at Python runtime, long after all shell processing is complete.

**When to use this**: Any time the target file content must contain a literal backslash followed by another character (`\n`, `\t`, `\r`, `\\`, `\0`, etc.) and the edit is performed through SSH.

## Related
- `learnings/patterns/ssh-remote-file-editing.md` -- full decision tree for remote editing approaches
