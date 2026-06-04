# Quick Start

This page is for a clean first run on Windows, macOS, Linux, or WSL.

## Requirements

| Requirement | Notes |
| --- | --- |
| Python | Python 3.11 or newer. |
| Claude Code CLI | `claude` must be available on `PATH`. |
| Provider access | API key, ChatGPT subscription login, or a local adapter. |

## Windows PowerShell

```powershell
git clone https://github.com/shuaishuaiZhu-ai/claude-code-proxy.git
cd claude-code-proxy
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
ccproxy model set
ccproxy run -- -p "reply ccproxy-ok"
```

After install, prefer the `ccproxy` command. You should not need to run the
PowerShell scripts for normal provider switching.

## macOS / Linux / WSL

```sh
git clone https://github.com/shuaishuaiZhu-ai/claude-code-proxy.git
cd claude-code-proxy
sh scripts/install.sh
ccproxy model set
ccproxy run -- -p "reply ccproxy-ok"
```

## Switch Provider Or Model

Run the same command again:

```sh
ccproxy model set
```

It asks for provider first, then asks for the model. You can choose an alias
such as `big`, `middle`, or `small`, or type a custom upstream model name.

## Check Current Choice

```sh
ccproxy model current
```

## Run Claude Code

```sh
ccproxy run -- -p "reply ccproxy-ok"
```

Everything after `--` is passed to Claude Code.

Examples:

```sh
ccproxy run -- -p "summarize this repository"
ccproxy run -- --model sonnet -p "reply ccproxy-ok"
```

## Uninstall

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall.ps1
```

macOS / Linux / WSL:

```sh
sh scripts/uninstall.sh
```

The uninstall script removes the installed package and `~/.ccproxy` state. It
does not remove Python, pip, or Claude Code.
