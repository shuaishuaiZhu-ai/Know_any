---
created: 2026-04-08
last_updated: 2026-04-08
source_session: retros/2026-04-08-1830.md
tags: [SSH, Python, binary-mode, byte-escaping, false-positive, C-string]
---

# SSH Python Binary-Mode Replacement: False-Positive Trap

## Context

When a C source file contains a corrupted byte (e.g., literal 0x0A newline inside a string literal) and a fix is attempted via SSH Python script in binary mode, the script can report success while the file is unchanged. Discovered while fixing `cmd.c` LOG_D string that had a literal newline introduced by a prior edit.

## Key Insight

Two distinct failure modes exist when fixing byte-level corruption via SSH Python:

**Mode 1: Silent text-mode no-op**
`content.replace(pattern, replacement)` returns the original string unchanged when the pattern is not found. If the script checks only exit code (not whether a substitution occurred), it prints "fixed ok" regardless. The `chr(92)+chr(110)` construction works correctly in isolation, but fails if the assembled pattern does not match the actual file content at call time (e.g., a previous partial fix changed surrounding bytes).

**Mode 2: Binary-mode escape confusion**
`b"\\n"` in a Python source string embedded in a shell command string is 0x5C 0x6E (backslash + n), NOT 0x0A. However, if the file actually contains 0x0A, the pattern won't match and the replace is a silent no-op. The confusion arises because the developer expects `\\n` to represent the two-char sequence but is uncertain whether another escaping layer has already reduced it.

In both modes, the script exits 0 and the developer receives no signal that nothing changed.

## Application

**Step 1: Diagnose before fixing.**
Read the exact bytes around the suspected corruption using decimal integers — no escaping ambiguity:

```python
# Run via: ssh host python3 << 'EOF'
f = open("/path/to/file", "rb")
content = f.read()
f.close()
idx = content.find(b"hcqd")   # narrow approximate location
print(list(content[idx:idx+40]))
# Output like: [104, 99, 113, 100, 32, 10, 34, ...]
#   10 = 0x0A literal newline  <-- corrupted
#   92, 110 = 0x5C 0x6E backslash-n  <-- correct
```

**Step 2: Build search/replace from decimal byte lists.**
Construct `bytes([...])` directly from the values seen in Step 1. No string literals, no chr(), no escape sequences:

```python
broken  = bytes([104, 99, 113, 100, 32, 10, 34])   # ... hcqd \x0A "
correct = bytes([104, 99, 113, 100, 32, 92, 110, 34])  # ... hcqd \n "
assert broken in content, "pattern not found -- re-diagnose"
content = content.replace(broken, correct, 1)
open("/path/to/file", "wb").write(content)
```

**Step 3: Verify post-write.**
Re-read the file and confirm the target bytes are now correct before declaring success:

```python
verify = open("/path/to/file", "rb").read()
assert bytes([92, 110]) in verify[idx:idx+50], "fix not applied"
print("verified ok")
```

## Related

- `learnings/errors/ssh-heredoc-backslash-expansion.md` — shell-layer expansion of `\n`; `chr()` as fix (Tier 3). The current learning is distinct: it covers Python-layer escape confusion in binary mode, and the false-positive trap when `replace()` silently no-ops.
- `learnings/patterns/byte-level-file-surgery.md` — integrated diagnostic + fix workflow
- `learnings/patterns/ssh-remote-file-editing.md` — decision tree for choosing remote edit approach (Tiers 1–3)
