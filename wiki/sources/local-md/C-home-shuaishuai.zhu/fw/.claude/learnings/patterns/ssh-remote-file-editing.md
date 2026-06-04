---
created: 2026-04-03
last_updated: 2026-04-15
source_session: retros/2026-04-15-1345.md
tags: [SSH, remote-editing, escaping, Python, heredoc, SCP]
---

# SSH Remote File Editing -- Patterns and Pitfalls

## Context
Source files live on remote server 192.168.80.116. The local Windows path `C:\home\shuaishuai.zhu\fw\` is a network mount where local Read/Glob tools sometimes fail. All editing must go through SSH. This learning consolidates hard-won patterns from multiple sessions, especially around shell escaping.

## Key Insight
There are four tiers of reliability for remote file editing via SSH, depending on what the content contains:

### Tier 0: Write locally + SCP (most reliable for whole-file replacement)
When replacing an entire file (not a surgical edit), bypass all SSH escaping layers entirely. Use the local Write tool to create the file content, then SCP it to the remote server. This is immune to all quote, backslash, and heredoc issues because the file content never passes through a shell.

```bash
# Step 1: Use Write tool to create the file locally at a temp path or target path
# Step 2: SCP to remote
scp "C:/home/shuaishuai.zhu/fw/path/to/file.c" 192.168.80.116:/home/shuaishuai.zhu/fw/path/to/file.c
```

**When to use**: whole-file replacement, file content contains quotes or backslashes or heredoc-hostile characters, or any situation where the complete file is being constructed from scratch (e.g., version revert with selective merges).

**Limitation**: requires the local network mount to be writable, which it usually is even when reads are flaky.

### Tier 1: Python via SSH heredoc (default approach for surgical edits)
Works for most content. Fails when content contains backslash escape sequences (`\n`, `\t`, etc.).

```bash
ssh 192.168.80.116 python3 << 'PYEOF'
lines = open("/path/to/file").readlines()
# ... modify lines by index ...
open("/path/to/file", "w").writelines(lines)
PYEOF
```

### Tier 2: Line-number-based replacement (preferred over content matching)
Exact content matching fails silently when trailing whitespace or invisible characters differ. Always prefer replacing by line number.

```python
# Good: line-number replacement
lines[41] = "    new content here\n"

# Fragile: content matching
content = content.replace("old text", "new text")  # fails on invisible whitespace diffs
```

### Tier 3: chr() construction for escape-sensitive content (robust for single lines)
When content contains `\n`, `\t`, or other backslash sequences that must appear literally in the output file, construct them character by character using `chr()`. This bypasses all shell/heredoc/SSH escaping layers.

```bash
ssh 192.168.80.116 python3 << 'PYEOF'
lines = open("/path/to/file").readlines()
bslash_n = chr(92) + chr(110)   # produces literal \n
lines[50] = f'    printf("value: %d{bslash_n}", x);\n'
open("/path/to/file", "w").writelines(lines)
PYEOF
```

## Application

**Before editing**: Always read the target region with `cat -A` to see exact whitespace:
```bash
ssh 192.168.80.116 "sed -n '40,60p' /path/to/file | cat -A"
```

**Decision tree for choosing approach**:
1. Replacing the entire file (revert, reconstruction, large rewrite)? --> Use Tier 0 (Write + SCP)
2. Does the content contain `\n`, `\t`, `\\`, or other backslash sequences? --> Use Tier 3 (chr())
3. Is content matching likely fragile (whitespace-sensitive code)? --> Use Tier 2 (line numbers)
4. Simple bulk replacement with no special characters? --> Use Tier 1 (Python heredoc)

**What NOT to do**:
- Do not use `sed` with multi-line append (`/pattern/a\`) through SSH -- the syntax corrupts through the escaping layers
- Do not use base64-encoded Python when the decoded content itself contains `\n` literal -- the decode produces valid bytes but the Python string literal still breaks
- Do not use Python one-liners with `-c` for anything involving quotes and backslashes -- the quoting becomes unmanageable
- Do not use bash heredoc to transfer whole C source files -- single quotes, backslashes, and preprocessor directives in the content interact unpredictably with the heredoc

**Recovery**: If an edit corrupts a file, immediately revert:
```bash
ssh 192.168.80.116 "cd /home/shuaishuai.zhu/fw && git checkout -- path/to/file"
```

## Related
- `learnings/remote-server.md` -- basic SSH access setup
- `learnings/remote-file-editing.md` -- original (simpler) version of this learning
- `learnings/errors/ssh-heredoc-backslash-expansion.md` -- detailed failure analysis
- `learnings/patterns/selective-version-revert.md` -- revert strategy that uses Tier 0 for file transfer
