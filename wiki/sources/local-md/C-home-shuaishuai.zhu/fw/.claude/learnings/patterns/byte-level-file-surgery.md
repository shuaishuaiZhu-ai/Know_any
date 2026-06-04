---
created: 2026-04-08
last_updated: 2026-04-08
source_session: retros/2026-04-08-1830.md
tags: [SSH, Python, binary, byte-array, C-string, corruption, diagnosis]
---

# Byte-Level File Surgery: Diagnosis and Replacement

## Context

When a C source file on a remote server contains a corrupted byte sequence (literal newline inside a string literal, null byte, etc.) that must be fixed via SSH Python, and all text-mode or chr()-based approaches have failed or produced false positives. This pattern provides a reliable three-step workflow: measure, replace, verify.

## Key Insight

All ambiguity in remote file editing via SSH comes from multiple escaping layers (shell quoting, Python string parsing, heredoc processing). `bytes([decimal, integers, ...])` is the one construct that passes through all layers unchanged because it contains no escape sequences — only Python integer literals. Combined with explicit post-write verification, this eliminates both false negatives (fix not applied) and false positives (script claims success but file unchanged).

## Application

### Step 1: Measure — read exact decimal byte values

```python
# ssh 192.168.80.116 python3 << 'EOF'
f = open("/path/to/file", "rb")
content = f.read()
f.close()
# Find approximate location first
idx = content.find(b"some_nearby_unique_text")
if idx < 0:
    print("anchor not found")
else:
    print(f"idx={idx}")
    print(list(content[idx:idx+50]))
# EOF
```

Interpret the output: `10` = 0x0A literal newline, `92` = 0x5C backslash, `110` = 0x6E letter n, `34` = `"`, `0` = null byte.

### Step 2: Replace — construct search and replacement from the measured values

```python
# ssh 192.168.80.116 python3 << 'EOF'
f = open("/path/to/file", "rb")
content = f.read()
f.close()

# Paste exact values from Step 1 for broken sequence
broken  = bytes([...decimal values for corrupted sequence...])
# Build correct sequence by substituting the target bytes
correct = bytes([...decimal values for fixed sequence...])

if broken not in content:
    print("ERROR: pattern not found -- re-run Step 1")
else:
    count = content.count(broken)
    print(f"found {count} occurrence(s)")
    content = content.replace(broken, correct, 1)  # replace first only unless count==1
    open("/path/to/file", "wb").write(content)
    print("written")
# EOF
```

### Step 3: Verify — re-read and confirm

```python
# ssh 192.168.80.116 python3 << 'EOF'
content = open("/path/to/file", "rb").read()
idx = content.find(b"some_nearby_unique_text")
print(list(content[idx:idx+50]))
# Confirm target position now shows 92, 110 (backslash-n) not 10 (newline)
# EOF
```

### When to use this pattern

Use when:
- A file contains bytes that cannot be expressed unambiguously as Python string literals through SSH
- A previous fix attempt (chr(), b"\\n", text-mode replace) printed "fixed ok" but `cat -A` still shows a line break
- The exact byte sequence around the corruption is unknown and needs to be measured first

Do not use when a simple text-mode line-number replacement (`lines[N] = "..."`) is sufficient — that is faster and more readable.

## Related

- `learnings/errors/ssh-python-byte-escaping.md` — detailed failure analysis of the false-positive trap
- `learnings/errors/ssh-heredoc-backslash-expansion.md` — earlier Tier 3 fix using `chr(92)+chr(110)`; this pattern supersedes chr() for cases where even chr() produces ambiguity
- `learnings/patterns/ssh-remote-file-editing.md` — decision tree (Tiers 1–3); this pattern is effectively Tier 4
