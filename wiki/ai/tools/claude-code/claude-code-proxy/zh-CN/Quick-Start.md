# 快速开始

这一页用于在 Windows、macOS、Linux 或 WSL 上快速跑通。

## 需要准备

| 需要 | 说明 |
| --- | --- |
| Python | Python 3.11 或更新版本。 |
| Claude Code CLI | `claude` 需要能在命令行里运行。 |
| 模型入口 | API key、ChatGPT 订阅登录，或本地 adapter。 |

## Windows PowerShell

```powershell
git clone https://github.com/shuaishuaiZhu-ai/claude-code-proxy.git
cd claude-code-proxy
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
ccproxy model set
ccproxy run -- -p "reply ccproxy-ok"
```

安装之后，日常切换和运行都优先使用 `ccproxy` 命令，不需要反复运行 PowerShell 脚本。

## macOS / Linux / WSL

```sh
git clone https://github.com/shuaishuaiZhu-ai/claude-code-proxy.git
cd claude-code-proxy
sh scripts/install.sh
ccproxy model set
ccproxy run -- -p "reply ccproxy-ok"
```

## 切换 Provider 或模型

重新运行：

```sh
ccproxy model set
```

它会先让你选择 provider，再选择模型。可以选 `big`、`middle`、`small` 这样的别名，也可以直接输入上游真实模型名。

## 查看当前选择

```sh
ccproxy model current
```

## 启动 Claude Code

```sh
ccproxy run -- -p "reply ccproxy-ok"
```

`--` 后面的参数都会原样传给 Claude Code。

示例：

```sh
ccproxy run -- -p "summarize this repository"
ccproxy run -- --model sonnet -p "reply ccproxy-ok"
```

## 卸载

Windows：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall.ps1
```

macOS / Linux / WSL：

```sh
sh scripts/uninstall.sh
```

卸载脚本会删除已安装的包和 `~/.ccproxy` 状态目录，不会删除 Python、pip 或 Claude Code。
