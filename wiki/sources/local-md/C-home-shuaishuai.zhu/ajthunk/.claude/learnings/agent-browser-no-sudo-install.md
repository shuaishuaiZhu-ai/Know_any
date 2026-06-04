---
created: 2026-03-30
last_updated: 2026-03-30
source_session: 2026-03-30-1935
tags: [agent-browser, npm, remote-server, installation]
---

# agent-browser Installation Without sudo

## Context
Remote Linux server where user has no sudo access.

## Solution
Use `--prefix` to install to user-local directory:
```bash
npm install --prefix ~/.local agent-browser
agent-browser install  # downloads Chrome, no sudo needed
```

## Details
- Binary path: `~/.local/node_modules/.bin/agent-browser`
- Chrome installed to: `~/.agent-browser/browsers/`
- `--with-deps` flag requires sudo for system libs — skip it; Chrome works without
- Verified working: version 0.23.0, Chrome 147.0.7727.24
