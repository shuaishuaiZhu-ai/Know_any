---
created: 2026-03-31
last_updated: 2026-04-03
source_session: retros/2026-03-31-1916.md
tags: [remote-server, SSH, file-access, network-mount]
---

# Remote File Editing via SSH

## Context
Source files at `aigc_sdk/grace/` live on remote server 192.168.80.116. The local path `C:\home\shuaishuai.zhu\fw\` is a Windows network mount that is unreliable -- Glob and Read tools frequently fail to find files.

## Key Insight
Use SSH with `cat -n` for reliable file access. Do NOT rely on local Glob/Read or Explore subagents for remote-mounted files.

## Application
```bash
# Read a file reliably
ssh 192.168.80.116 "cat -n /home/shuaishuai.zhu/fw/aigc_sdk/grace/applications/cp/user/cmd.c"

# Always use the remote path, not the local Windows mapped path
# Remote: /home/shuaishuai.zhu/fw/...
# Local (unreliable): C:\home\shuaishuai.zhu\fw\...
```

## Related
- `learnings/remote-server.md` -- basic SSH and git access
- `learnings/patterns/ssh-remote-file-editing.md` -- **comprehensive guide** covering editing patterns, escaping pitfalls, and the `chr()` technique for escape-sensitive content
- `learnings/errors/ssh-heredoc-backslash-expansion.md` -- detailed failure analysis for `\n` expansion through SSH heredoc
