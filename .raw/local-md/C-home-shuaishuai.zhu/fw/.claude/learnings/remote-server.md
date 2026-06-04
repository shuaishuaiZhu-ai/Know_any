---
created: 2026-03-30
last_updated: 2026-03-30
source_session: 2026-03-30-1112
tags: [environment, ssh, remote-server, git]
---

# Learning: Remote Server Access

## Context
User's working directory `C:\home\shuaishuai.zhu\fw` maps to a remote server at **192.168.80.116**.
All git operations (show, log, diff, etc.) must be done via SSH:

```bash
ssh 192.168.80.116 "cd /home/shuaishuai.zhu/fw && git <command>"
```

## Impact
- Local path is NOT a git repository
- Attempting local git commands will always fail
- Must always SSH to 192.168.80.116 first

## Date Confirmed
2026-03-30 (user confirmed, previously mentioned multiple times)
