# 故障排查

先运行：

```sh
ccproxy doctor
ccproxy model current
```

## 常见现象

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| Claude Code 显示 `Not logged in` | 直接运行了 Claude，没有走 proxy。 | 使用 `ccproxy run -- -p "reply ccproxy-ok"`。 |
| `/skills` 显示没有 skills | Claude 以 `--bare` 启动，或旧 wrapper 强制 bare mode。 | 更新项目并使用普通 `ccproxy run`。`--bare` 只用于最小 smoke test。 |
| 报 `Invalid tool parameters` | 上游返回了异常 tool call，或安装版本过旧。 | 更新项目；当前版本会在转发前校验 tool call。 |
| API key 设置直接退出 | 旧版本行为或输入了空 key。 | 重新运行 `ccproxy model set`，按提示粘贴 key。 |
| 浏览器 consent 页面一直加载 | 浏览器 callback 登录受阻。 | 使用默认 device-code 登录，不传 `--browser-login`。 |
| callback 端口 `EADDRINUSE` | 已有另一个登录 callback listener。 | 关闭重复进程，再重新运行 `ccproxy model set`。 |
| 上游 adapter 无法连接 | 本地 adapter 没启动。 | 启动 adapter，或选择 API-key profile。 |
| PowerShell 阻止 `.ps1` | 本机执行策略拦截脚本。 | 日常使用安装后的 `ccproxy` 命令；安装脚本用 `-ExecutionPolicy Bypass`。 |
| `fatal: not a git repository` | 在仓库目录外运行 git 命令。 | 先 `cd` 到克隆出的 `claude-code-proxy` 目录。 |

## 端口冲突

默认本地 proxy 端口是 `8082`。

```sh
ccproxy run --port 8090 -- -p "reply ccproxy-ok"
```

ChatGPT 订阅模式还会使用托管本地 adapter：`127.0.0.1:8317`。

## API Key 状态

环境变量优先于保存的 key：

```text
OPENAI_API_KEY
DEEPSEEK_API_KEY
KIMI_API_KEY
ZHIPU_API_KEY
MINIMAX_API_KEY
CCPROXY_CUSTOM_API_KEY
```

粘贴保存的 key 位于 `~/.ccproxy/secrets.toml`。

## Claude Code 参数

`--` 后面的内容都会传给 Claude Code：

```sh
ccproxy run -- --model sonnet -p "reply ccproxy-ok"
```

正常工作时不要添加 `--bare`；它会关闭 Claude Code 的常规工具、插件和 skill surface。
