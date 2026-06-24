---
type: secrets
title: "Server Passwords"
created: 2026-06-24
updated: 2026-06-24
tags: [ai, secrets, server-passwords]
status: active
---

# Server Passwords

This cloud-safe page records server hosts and login users. Do not echo password values in final chat responses.

Allowed here: server login passwords when the repository is kept local-only.
Not allowed here for GitHub push: real plaintext passwords, API tokens, OAuth tokens, SSH private keys, cookies.

## Default Credential Policy

The user confirmed on 2026-06-24 that all servers use the same login user/password set unless a row below says otherwise. The actual password value is intentionally not stored in this GitHub-pushed version.

## Known Servers

| server | host | user | password | purpose | last_verified | notes |
|---|---|---|---|---|---|---|
| Grace/FW/KMD remote | 192.168.80.116 | shuaishuai.zhu | REDACTED_FOR_CLOUD_PUSH | firmware source verification; KMD/tiny-kmd work; ctrlclaw/ComfyUI maintenance; fw_kernel_launch_test verification | 2026-06-24 | User provided the shared password in chat, but it is not committed to the GitHub-pushed version. |
| GitLab / registry host | 192.168.90.119 | shuaishuai.zhu | REDACTED_FOR_CLOUD_PUSH | GitLab remotes and Docker registry host referenced by FW/KMD/tiny-kmd workflows | 2026-06-24 | User provided the shared password in chat, but it is not committed to the GitHub-pushed version. Git remotes may still use `git@...` and publickey auth for repository access. |

## Update Rules

- Store only server login passwords here when the repository remains local-only.
- Do not push real plaintext passwords, API tokens, OAuth tokens, SSH private keys, cookies, or application secrets to GitHub.
- If a password is unknown or intentionally omitted from cloud history, write `UNKNOWN` or `REDACTED_FOR_CLOUD_PUSH` instead of inventing or deriving one.
- When a password is filled in a local-only copy, update `last_verified` with the date it was actually used or confirmed.
