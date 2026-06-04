# 测试

这一页用于验证安装、provider 配置或代码改动。

## 用户 Smoke Test

```sh
ccproxy doctor
ccproxy model current
ccproxy run -- -p "reply ccproxy-ok"
```

预期结果：Claude Code 通过本地 proxy 启动，并回复 `ccproxy-ok`。

## 真实 Claude Code Smoke

```sh
ccproxy test --profile custom --claude
```

它会启动 proxy，调用真实 Claude Code CLI，并检查输出中是否包含期望文本。

## Mock Provider 测试

一个终端里启动：

```sh
python scripts/mock_openai_provider.py --port 8000
```

另一个终端里运行：

```sh
ccproxy model set --provider custom --model custom-big
ccproxy run -- -p "reply ccproxy-ok"
```

## 维护者验证

```sh
python -m unittest discover -s tests
python -m compileall src tests scripts
git diff --check
```

只有在对应 API key 或 adapter 可用时，才运行真实 provider 测试。

## Runtime 改动后要检查什么

| 范围 | 为什么重要 |
| --- | --- |
| 普通 `ccproxy run` | 验证用户真正使用的命令可用。 |
| `--bare` smoke path | 验证最小 Claude Code 路径仍可用。 |
| 工具调用 | 验证 streaming translation 不会破坏 Claude Code 工具。 |
| wrapper 脚本 | 验证 Windows 和 Unix 辅助脚本没有回归。 |
| README 和 wiki | 验证公开文档里的命令和真实 CLI 一致。 |
