# 供应商与模型

`ccproxy model set` 是主要切换命令。它会把当前 provider 和模型保存到 `~/.ccproxy`，之后 `ccproxy run` 会使用这组选择。

## Provider 菜单

| Provider | 模式 | 适合 | 默认模型 |
| --- | --- | --- | --- |
| `openai-key` | API key | OpenAI Platform 计费 | `gpt-4.1` |
| `chatgpt-subscription` | 托管本地 adapter | ChatGPT 订阅登录 | `ChatGPT5.5` |
| `deepseek` | API key | DeepSeek API | `deepseek-v4-pro` |
| `deepseek-subscription` | 本地 adapter | 已有 DeepSeek 订阅 adapter | adapter 模型 |
| `kimi` | API key | Kimi / Moonshot API | `moonshot-v1-128k` |
| `kimi-subscription` | 本地 adapter | 已有 Kimi 订阅 adapter | adapter 模型 |
| `zhipu` | API key | 智谱 GLM API | `glm-4-plus` |
| `zhipu-subscription` | 本地 adapter | 已有 GLM 订阅 adapter | adapter 模型 |
| `minimax-cn` | API key | MiniMax 中国区 endpoint | `MiniMax-M2.7` |
| `minimax-global` | API key | MiniMax 国际区 endpoint | `MiniMax-M2.7` |
| `minimax-subscription` | Token Plan key | MiniMax Token Plan | `MiniMax-M2.7` |
| `custom` | 本地 adapter | 你自己的 OpenAI-compatible adapter | adapter 模型 |

普通菜单里 MiniMax 推荐使用 OpenAI-compatible endpoint。Anthropic-compatible 的 MiniMax profile 仍保留给高级用户，但不会出现在交互式菜单里。

## API Key 页面

当 key 缺失时，`ccproxy model set` 会打印对应平台的 key 页面，并等待你粘贴 key。

| Provider | API key 页面 |
| --- | --- |
| OpenAI | https://platform.openai.com/api-keys |
| DeepSeek | https://platform.deepseek.com/api_keys |
| Kimi / Moonshot | https://platform.kimi.com/console/api-keys |
| 智谱 GLM | https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys |
| MiniMax 中国区 | https://platform.minimaxi.com/user-center/basic-information/interface-key |
| MiniMax 国际区 | https://platform.minimax.io/user-center/basic-information/interface-key |

粘贴保存的 key 会写入 `~/.ccproxy/secrets.toml`。环境变量优先级高于保存的 key。

## 非交互示例

```sh
ccproxy model set --provider openai-key --model gpt-4.1
ccproxy model set --provider chatgpt-subscription --model ChatGPT5.5
ccproxy model set --provider deepseek --model deepseek-v4-pro
ccproxy model set --provider kimi --model moonshot-v1-128k
ccproxy model set --provider zhipu --model glm-4-plus
ccproxy model set --provider minimax-cn --model MiniMax-M2.7
```

## 自定义模型名

如果菜单里没有你要的上游模型名，可以在提示时直接输入，或者使用 `--model`。

```sh
ccproxy model set --provider chatgpt-subscription --model ChatGPT5.4
ccproxy model set --provider custom --model my-adapter-model
```

## Custom Adapter

当另一个工具已经暴露 OpenAI-compatible endpoint 时，使用 `custom`。默认地址是：

```text
http://127.0.0.1:8000/v1
```

对本地 adapter profile，`ccproxy run` 会在启动 Claude Code 前检查 adapter 是否可连接。
