# 订阅登录

订阅模式和普通 API-key 计费不同。它通常需要本地 adapter，因为 Claude Code 仍然是把请求发给本地 Anthropic-compatible proxy。

## ChatGPT 订阅

使用：

```sh
ccproxy model set --provider chatgpt-subscription --model ChatGPT5.5
ccproxy run -- -p "reply ccproxy-ok"
```

首次使用时，`ccproxy` 会准备托管的 ChatGPT adapter，并启动登录流程。默认是 device-code 登录：

1. 打开终端打印的 URL。
2. 输入一次性 code。
3. 回到终端。
4. 等待 `ccproxy model set` 或 `ccproxy run` 继续。

日常使用建议用 device-code 登录。浏览器 callback 登录可能受浏览器状态、consent 页面加载、callback 端口或扩展影响。

## MiniMax Token Plan

使用：

```sh
ccproxy model set --provider minimax-subscription --model MiniMax-M2.7
ccproxy run -- -p "reply ccproxy-ok"
```

它使用推荐的 MiniMax OpenAI-compatible endpoint，并复用 `MINIMAX_API_KEY` 这条密钥路径。

## 其他订阅 Adapter

`deepseek-subscription`、`kimi-subscription`、`zhipu-subscription` 是本地 adapter profile。只有当你已经有一个兼容的本地 adapter，并暴露 OpenAI-compatible `/v1/chat/completions` 时才使用它们。

如果没有现成 adapter，先使用同平台的 API-key provider。

## 登录诊断

```sh
ccproxy doctor --profile chatgpt-subscription
```

它会输出 adapter 状态、认证提示、保存的 key 状态和 callback 端口诊断。

## 常见误区

| 误区 | 正确做法 |
| --- | --- |
| 设置完之后直接运行 `claude` | 使用 `ccproxy run`，这样 Claude Code 才会拿到 `ANTHROPIC_BASE_URL`。 |
| 浏览器 consent 页面一直加载 | 停止本次运行，使用默认 device-code 登录，不传 `--browser-login`。 |
| callback 提示端口占用 | 关闭重复登录进程，旧进程退出后再运行 `ccproxy model set`。 |
| adapter 无法连接 | 启动对应 adapter，或切换到 API-key provider。 |
