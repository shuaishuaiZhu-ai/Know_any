# Subscription Login

Subscription modes are different from normal API-key billing. They usually need
a local adapter because Claude Code still talks to a local Anthropic-compatible
proxy.

## ChatGPT Subscription

Use:

```sh
ccproxy model set --provider chatgpt-subscription --model ChatGPT5.5
ccproxy run -- -p "reply ccproxy-ok"
```

On first use, `ccproxy` prepares the managed ChatGPT adapter and starts the
login flow. The default path is device-code login:

1. Open the printed URL.
2. Enter the one-time code.
3. Return to the terminal.
4. Wait for `ccproxy model set` or `ccproxy run` to continue.

Use device-code login for normal use. The browser callback flow can be affected
by browser state, consent-page loading, callback ports, or extension behavior.

## MiniMax Token Plan

Use:

```sh
ccproxy model set --provider minimax-subscription --model MiniMax-M2.7
ccproxy run -- -p "reply ccproxy-ok"
```

This uses the recommended MiniMax OpenAI-compatible endpoint and the same
`MINIMAX_API_KEY` secret path.

## Other Subscription Adapters

`deepseek-subscription`, `kimi-subscription`, and `zhipu-subscription` are local
adapter profiles. Use them when you already have a compatible adapter exposing
OpenAI-compatible `/v1/chat/completions`.

If you do not already have such an adapter, use the API-key provider for that
platform first.

## Login Diagnostics

```sh
ccproxy doctor --profile chatgpt-subscription
```

This reports adapter state, auth hints, saved key state, and callback-port
diagnostics.

## Avoid These Common Traps

| Trap | What to do |
| --- | --- |
| Running plain `claude` after setup | Use `ccproxy run` so Claude Code receives `ANTHROPIC_BASE_URL`. |
| Browser consent page spins | Stop the run and use the default device-code login without `--browser-login`. |
| Callback says port is busy | Close the duplicate login process or rerun after the old process exits. |
| Adapter is unreachable | Start the adapter, or switch to the API-key provider. |
