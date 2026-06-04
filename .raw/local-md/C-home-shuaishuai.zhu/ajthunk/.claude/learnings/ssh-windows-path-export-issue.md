---
created: 2026-03-30
last_updated: 2026-03-30
source_session: 2026-03-30-1935
tags: [ssh, bash, windows, path]
---

# SSH One-liner PATH Export Fails with Windows Paths

## Problem
Using `export PATH=...` in SSH one-liners from Windows shell passes the local Windows PATH, causing bash errors like:
```
export: "Code:/c/windows/system32...": not a valid identifier
```

## Solution
Use absolute paths directly instead of modifying PATH:
```bash
# Bad
ssh user@host "export PATH=~/.local/bin:$PATH && agent-browser ..."

# Good
ssh user@host '/home/user/.local/node_modules/.bin/agent-browser ...'
```
