# Providers And Models

`ccproxy model set` is the main switching command. It stores the active provider
and model under `~/.ccproxy`, then `ccproxy run` uses that choice.

## Provider Menu

| Provider | Mode | Best for | Default model |
| --- | --- | --- | --- |
| `openai-key` | API key | OpenAI Platform billing | `gpt-4.1` |
| `chatgpt-subscription` | Managed local adapter | ChatGPT subscription login | `ChatGPT5.5` |
| `deepseek` | API key | DeepSeek API access | `deepseek-v4-pro` |
| `deepseek-subscription` | Local adapter | Existing DeepSeek subscription adapter | adapter model |
| `kimi` | API key | Kimi / Moonshot API access | `moonshot-v1-128k` |
| `kimi-subscription` | Local adapter | Existing Kimi subscription adapter | adapter model |
| `zhipu` | API key | Zhipu GLM API access | `glm-4-plus` |
| `zhipu-subscription` | Local adapter | Existing GLM subscription adapter | adapter model |
| `minimax-cn` | API key | MiniMax China endpoint | `MiniMax-M2.7` |
| `minimax-global` | API key | MiniMax global endpoint | `MiniMax-M2.7` |
| `minimax-subscription` | Token Plan key | MiniMax Token Plan | `MiniMax-M2.7` |
| `custom` | Local adapter | Your own OpenAI-compatible adapter | adapter model |

MiniMax uses the OpenAI-compatible endpoint in the normal menu. The
Anthropic-compatible MiniMax profiles are still available in config for advanced
users, but they are hidden from the interactive menu to keep setup simple.

## API Key Pages

`ccproxy model set` prints the key page when a key is missing and waits for you
to paste the key.

| Provider | API key page |
| --- | --- |
| OpenAI | https://platform.openai.com/api-keys |
| DeepSeek | https://platform.deepseek.com/api_keys |
| Kimi / Moonshot | https://platform.kimi.com/console/api-keys |
| Zhipu GLM | https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys |
| MiniMax China | https://platform.minimaxi.com/user-center/basic-information/interface-key |
| MiniMax Global | https://platform.minimax.io/user-center/basic-information/interface-key |

Saved keys live in `~/.ccproxy/secrets.toml`. Environment variables take
priority over saved keys.

## Non-Interactive Examples

```sh
ccproxy model set --provider openai-key --model gpt-4.1
ccproxy model set --provider chatgpt-subscription --model ChatGPT5.5
ccproxy model set --provider deepseek --model deepseek-v4-pro
ccproxy model set --provider kimi --model moonshot-v1-128k
ccproxy model set --provider zhipu --model glm-4-plus
ccproxy model set --provider minimax-cn --model MiniMax-M2.7
```

## Custom Model Names

If the menu does not include the exact upstream model you want, type the model
name directly when prompted, or pass it with `--model`.

```sh
ccproxy model set --provider chatgpt-subscription --model ChatGPT5.4
ccproxy model set --provider custom --model my-adapter-model
```

## Custom Adapter

Use `custom` when another tool already exposes an OpenAI-compatible endpoint.
The default endpoint is:

```text
http://127.0.0.1:8000/v1
```

For local adapter profiles, `ccproxy run` checks that the adapter is reachable
before starting Claude Code.
