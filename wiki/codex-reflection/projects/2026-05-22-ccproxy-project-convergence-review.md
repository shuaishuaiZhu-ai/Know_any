---
type: project-convergence-review
date: 2026-05-22
project: ccproxy / Claude Code Proxy
repo: C:\Users\18355\Documents\Codex\2026-05-20\chrome-plugin-chrome-openai-bundled-chrom
skills:
  - ccproxy-project-convergence-review
  - codex-reflection-archiver
---

# ccproxy / Claude Code Proxy 收敛 Review

## 证据边界

- 当前 repo 文件是本次判断的主证据。
- 昨天 session 摘要只作为历史验证线索；本次没有重新运行 build/test/live provider。
- 未读取 git diff/status/log；本次按用户要求不把 git 作为复盘主线。
- 读取原始 session 时遇到疑似敏感历史内容，已停止展开原文；后续只用 session_index 标题和已沉淀摘要。

## 总结论

当前代码、测试、文档已经覆盖大部分产品化能力：provider/model 选择、API key 引导、ChatGPT subscription device-code 登录、安装卸载脚本、README/wiki、`ccproxy run` 非 bare 路径、tool-call 校验和 bare regression。真正的收敛重点不是继续补大段代码，而是做真实环境验证矩阵，并把 Windows/macOS/Linux、真实 provider、Claude Code skills/tool surface 分开验。

## 子任务证据矩阵

| 子任务 | 代码是否存在 | 测试是否存在 | 文档是否存在 | 缺少的 live 验证 |
|---|---|---|---|---|
| model mapping | `src/ccproxy/presets.py` 定义 provider 模型；`src/ccproxy/translator.py` 选择模型；`src/ccproxy/config.py` 保存 active model | `tests/test_translator.py`、`tests/test_model_state.py` | README、`docs/providers.md`、wiki Providers | 真实请求捕获每个 provider alias 是否映射到预期 upstream model |
| provider CLI | `src/ccproxy/cli.py` 的 `model set/current/clear`、隐藏高级 MiniMax profile、API key prompt | `tests/test_cli.py`、`tests/test_provider_setup.py`、`tests/test_secrets.py` | README/provider docs | Windows/macOS/Linux 下 key 缺失、粘贴、保存、重新读取；真实 provider API smoke |
| OAuth consent / ChatGPT subscription | `src/ccproxy/adapter.py` 默认 device-code；browser callback 作为 fallback；doctor 诊断 callback port 和 consent endpoint | `tests/test_adapter.py`、`tests/test_cli.py` | README、wiki Subscription/Troubleshooting | 干净账号 device-code 登录；`--browser-login` consent 卡住回退；auth2api install/start；callback port busy |
| install/uninstall | `scripts/install.ps1/.sh`、`scripts/uninstall.ps1/.sh` | `tests/test_install_scripts.py` | README、wiki Quick Start | Windows PowerShell、Linux shell、macOS shell 实机安装卸载；PATH、Python launcher、pip/network 失败路径 |
| README 产品化 | README、README.zh-CN、docs assets、wiki | 文档本身无自动渲染测试 | README/wiki 已覆盖 provider 表、quick start、troubleshooting | 新用户按 README 从空环境跑一遍；图片和链接渲染检查 |
| `ccproxy run` payload | `src/ccproxy/cli.py` 启 proxy 后运行 Claude；`src/ccproxy/env.py` 构造 Claude env；`src/ccproxy/client.py` 转发 tools | `tests/test_cli.py`、`tests/test_cli_windows.py`、`tests/test_server.py` | README/wiki Testing | 当前 checkout 重新跑非 bare request capture，确认 tools/system prompt 仍存在 |
| tool execution | `src/ccproxy/translator.py` 转换 tool use/result，并校验 missing/wrong type/unknown tool | `tests/test_translator.py` | README/Troubleshooting | 在 trusted workspace 真实跑 PowerShell/Bash/Read/Write/Edit/Skill，确认 Claude 侧参数不再为空 |
| bare regression | 普通 run wrapper 不带 `--bare`，smoke wrapper 保留 `--bare` | `tests/test_install_scripts.py`、`tests/test_cli_windows.py` | README/Troubleshooting | 非 bare `/skills` 可见；bare smoke 仍最小化；POSIX wrapper 可执行位和 shell 行为 |
| Claude Code skills/runtime | `_claude_command` Windows shim 处理；wrapper 保持非 bare；translator 阻断无效工具参数 | `tests/test_cli_windows.py`、`tests/test_translator.py` | README/wiki Troubleshooting | Claude Code 2.1.146 或当前版本下 `/skills`、插件、工具调用真实验证 |

## 优先级收敛清单

1. P0：跑一次当前 checkout 的真实非 bare `ccproxy run`，捕获 request，确认 system prompt 和 tools 数量存在；这是判断 `/skills`、tool execution、bare regression 的共同入口。
2. P0：对 ChatGPT subscription 做 device-code 登录 live 验证，再单独验证 browser callback/consent 卡住时的 fallback 文案和 doctor 诊断。
3. P0：在 Windows PowerShell、Linux shell、macOS shell 分别验证 install/uninstall；不要用单元测试替代脚本真实执行。
4. P1：对 OpenAI/DeepSeek/Kimi/Zhipu/MiniMax 至少各跑一个真实 provider smoke；没有真实 key 的 provider 只能标记为未验证。
5. P1：对 model alias 做 request capture，验证 active model 覆盖、big/middle/small alias、自定义模型名三类路径。
6. P1：用 trusted workspace 验证 Claude 工具调用，包括 PowerShell/Bash/Read/Write/Edit/Skill，确认 invalid tool 被 proxy 阻断而不是传给 Claude。
7. P2：README 按新用户路径做 dry-run，检查英文/中文命令、图片、wiki 链接和 troubleshooting 是否一致。

## 需用户确认项

- 是否允许使用真实 provider key 做 live smoke。没有批准时不得读取或输出 token/API key。
- 是否允许在本机安装/卸载 `claude-code-proxy` 来验证脚本副作用。
- 是否需要把当前 repo 推向 release-ready 状态，包括 tag、release notes、PyPI/npm 分发边界。
- MiniMax Token Plan、DeepSeek/Kimi/Zhipu subscription adapter 是否要声明为正式支持，还是只写成本地 adapter profile。

## 必须真实运行验证项

- `python -m unittest discover -s tests`
- `python -m compileall src tests scripts`
- 当前 checkout 的 `ccproxy run` 非 bare request capture
- `ccproxy test --profile custom --claude`
- Windows/macOS/Linux install/uninstall
- ChatGPT subscription device-code login
- 至少一个真实 API-key provider smoke

## 历史验证线索

已沉淀摘要显示，昨天曾完成：`python -m unittest discover -s tests` 77 tests OK、compileall OK、`git diff --check` OK、`ccproxy test --profile custom --claude` 返回 `ccproxy-ok`、直接 `ccproxy run` 捕获到非 bare 31 tools，并推送过 `7fd33a8 Harden Claude run tool support`。这些是历史证据，不等于今天已重新验证。
