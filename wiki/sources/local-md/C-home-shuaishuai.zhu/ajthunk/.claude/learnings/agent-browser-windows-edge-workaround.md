---
created: 2026-03-30
last_updated: 2026-03-30
source_session: 2026-03-30-1935
tags: [agent-browser, windows, edge, executable-path]
---

# agent-browser on Windows: Use Edge Instead of Chrome

## Problem
`agent-browser open <url>` fails with:
```
Auto-launch failed: Chrome not found. Run `agent-browser install` to download Chrome, or use --executable-path.
```
This happens because Chrome for Testing is not installed locally.

## Root Cause
agent-browser defaults to Chrome for Testing. Without running `agent-browser install` (which downloads Chrome), it cannot find a browser.

## Solution
Use `--executable-path` to point to the system Edge browser (Chromium-based, fully compatible):

```bash
agent-browser open <url> --executable-path "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
```

## Additional Notes
- Edge path on this machine: `/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`
- npm global bin: `/c/Users/18355/AppData/Roaming/npm/`
- Node.js must be in PATH for npm postinstall: `PATH="/c/Program Files/nodejs:$PATH"`
- Full working command pattern:
  ```bash
  PATH="/c/Program Files/nodejs:/c/Users/18355/AppData/Roaming/npm:$PATH" agent-browser open <url> --executable-path "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ```
