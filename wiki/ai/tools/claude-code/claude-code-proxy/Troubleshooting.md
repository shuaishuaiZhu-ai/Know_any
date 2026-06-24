# Troubleshooting

Start with:

```sh
ccproxy doctor
ccproxy model current
```

## Common Symptoms

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Claude Code says `Not logged in` | Claude was launched directly. | Run `ccproxy run -- -p "reply ccproxy-ok"`. |
| `/skills` shows no skills | Claude was launched with `--bare`, or an old wrapper forced bare mode. | Update the project and use normal `ccproxy run`. Use `--bare` only for minimal smoke tests. |
| `Invalid tool parameters` | Upstream returned malformed tool calls, or the install is stale. | Update the project; current builds validate tool calls before forwarding. |
| API key setup exits early | Old setup behavior or empty key input. | Run `ccproxy model set` again and paste the key when prompted. |
| Browser consent page keeps loading | Browser callback login is blocked or challenged. | Use default device-code login. Do not pass `--browser-login`. |
| `EADDRINUSE` on callback port | Another login callback listener is already running. | Close the duplicate process, then rerun `ccproxy model set`. |
| Upstream adapter is not reachable | Local adapter is not running. | Start the adapter or choose the API-key profile. |
| PowerShell blocks `.ps1` | Local execution policy blocks scripts. | Use the installed `ccproxy` command for normal runs, or run install with `-ExecutionPolicy Bypass`. |
| `fatal: not a git repository` | Command was run outside the cloned repo. | `cd` into the cloned `claude-code-proxy` directory before git commands. |

## Port Conflicts

The default local proxy port is `8082`.

```sh
ccproxy run --port 8090 -- -p "reply ccproxy-ok"
```

ChatGPT subscription mode also uses a managed local adapter on `127.0.0.1:8317`.

## API Key State

Environment variables win over saved keys:

```text
OPENAI_API_KEY
DEEPSEEK_API_KEY
KIMI_API_KEY
ZHIPU_API_KEY
MINIMAX_API_KEY
CCPROXY_CUSTOM_API_KEY
```

Pasted keys are stored in `~/.ccproxy/secrets.toml`.

## Claude Code Arguments

Everything after `--` is passed to Claude Code:

```sh
ccproxy run -- --model sonnet -p "reply ccproxy-ok"
```

For normal work, do not add `--bare`; it disables Claude Code's normal tool,
plugin, and skill surface.
