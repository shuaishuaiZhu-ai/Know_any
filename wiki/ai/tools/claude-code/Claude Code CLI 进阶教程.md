# Claude Code CLI 进阶教程

> 这是《Claude Code CLI 使用教程》的**进阶篇**。基础篇解决"会用"，这一篇解决"用得专业"：
> 命令行参数与无头模式、会话管理与回滚、权限与配置全解、hooks/skills/subagents/MCP/plugins 的**编写**而非仅使用、并行多开、CI 自动化、成本观测。
> 阅读前提：你已经会基础篇里的日常循环（plan 模式、`/clear`、CLAUDE.md、装 plugin）。
> Claude Code 迭代很快，一切以本机 `claude --help`、`/help` 和官方文档 `docs.claude.com/en/docs/claude-code` 为最终标准。生成/更新日期：2026-06-12。

---

## 进阶速查（先收藏）

**命令行（会话外）：**

| 命令 | 作用 |
|---|---|
| `claude -p "..."` | 无头模式：跑完一次任务直接打印结果退出 |
| `claude -c` / `claude --continue` | 续上**本目录最近一次**会话 |
| `claude -r` / `claude --resume` | 打开会话选择器，挑一个历史会话续 |
| `claude --model opus` | 指定本次会话模型 |
| `claude --permission-mode plan` | 直接以 plan 模式启动 |
| `claude --add-dir ../other-repo` | 额外挂载一个目录进工作区 |
| `claude mcp add/list/remove` | 管理 MCP server |
| `claude doctor` | 环境体检 |
| `claude update` | 手动升级 |

**会话内进阶键位 / 前缀：**

| 操作 | 作用 |
|---|---|
| `!命令` | 直接跑 shell 命令，输出进入对话上下文（bash 模式） |
| `#一句话` | 追加进 CLAUDE.md 记忆 |
| `Esc` `Esc`（连按两下） | 打开回滚：跳回历史某条消息重来 |
| `Ctrl+B` | 把正在跑的长命令丢到后台继续 |
| `Ctrl+R` | 展开完整输出 / 搜索历史 |
| `Shift+Tab` | 循环权限模式 |
| `/vim` | vim 风格编辑输入框 |
| `/rewind` | 回滚代码 / 对话到检查点 |
| `/context` | 可视化看上下文窗口被什么占着 |
| `/statusline` | 自定义底部状态栏 |
| `/output-style` | 切换输出风格（教学模式等） |
| `/export` | 导出当前对话 |

---

## 0. 这篇教程的地图

进阶能力可以分成四个方向，按需跳读：

| 方向 | 你想要什么 | 看哪几节 |
|---|---|---|
| **脚本化** | 把 Claude Code 当 Unix 工具用：管道、CI、定时任务 | §1 无头模式、§12 CI、§13 SDK |
| **可控性** | 精确控制它能干什么、出错了能回退 | §2 会话管理、§4 权限全解、§5 配置与环境变量 |
| **扩展性** | 自己写命令 / skill / subagent / hook / MCP / plugin | §6～§10 |
| **规模化** | 多实例并行、团队协作、成本观测 | §11 并行、§14 观测 |

---

## 1. 无头模式：把 Claude Code 当 Unix 工具用

交互界面只是 Claude Code 的一张皮。加 `-p`（print）它就变成一个**可组合的命令行工具**：读 stdin、干活、把结果写 stdout、退出。

![无头模式管道：stdin → claude -p → stdout（text/json/stream-json）→ 下游脚本，权限须预先授权](<../../../../_attachments/tools/claude-code/headless-pipeline.svg>)

### 1.1 基本用法

```bash
# 一次性提问，结果直接打印
claude -p "用一句话总结这个项目是做什么的"

# 接管道：把任意输出喂给它
cat error.log | claude -p "找出根因，按可能性排序"
git diff | claude -p "为这个 diff 写一条规范的 commit message，只输出 message 本身"

# 处理文件
claude -p "把 @docs/api.md 里所有过时的 v1 接口标记出来"
```

### 1.2 输出格式：text / json / stream-json

```bash
claude -p "..." --output-format text         # 默认，纯文本
claude -p "..." --output-format json         # 结构化：含 result、cost、duration、session_id
claude -p "..." --output-format stream-json  # 逐事件流式输出（每行一个 JSON）
```

`json` 配合 `jq` 就能写出健壮的脚本：

```bash
result=$(claude -p "审查 @src/auth.py 的安全问题" --output-format json)
echo "$result" | jq -r '.result'        # 取回答正文
echo "$result" | jq -r '.total_cost_usd' # 顺便记一下这次花了多少钱
echo "$result" | jq -r '.session_id'     # 记下会话 ID，之后还能续（见 §2）
```

`stream-json` 是给程序消费的：每个工具调用、每段文本都是一行 JSON 事件，适合做自己的 UI 或日志管道。

### 1.3 无头模式下的权限

无头模式没人坐在屏幕前点"同意"，所以**必须预先授权**，否则碰到需要确认的操作会直接失败：

```bash
# 方式一：精确白名单（推荐）
claude -p "跑测试并修复失败项" \
  --allowedTools "Bash(npm test:*)" "Read" "Edit"

# 方式二：指定权限模式
claude -p "重构 utils 目录" --permission-mode acceptEdits

# 方式三：全放行 —— 仅限隔离容器/一次性环境
claude -p "..." --dangerously-skip-permissions
```

还有一个更优雅的口子：`--permission-prompt-tool` 可以指定一个 MCP 工具来代替人工点确认，实现"程序化审批"（比如发到你的审批机器人）。

### 1.4 其它常用启动参数

| 参数 | 作用 |
|---|---|
| `--model <名字>` | 本次用哪个模型 |
| `--append-system-prompt "..."` | 在系统提示后追加你的指令（无头模式最常用） |
| `--max-turns 5` | 限制 agent 循环轮数，防失控 |
| `--add-dir <路径>` | 把仓库外的目录挂进工作区（可多次） |
| `--mcp-config <file>` | 加载指定的 MCP 配置 |
| `--settings <file>` | 加载指定的 settings 文件 |
| `--verbose` | 打印逐轮详细日志，调试用 |
| `--input-format stream-json` | stdin 也走流式 JSON（双向流） |

一个完整的"CI 里自动修 lint"的例子：

```bash
claude -p "跑 npm run lint，把所有可以安全自动修复的问题修掉，不要改逻辑" \
  --allowedTools "Bash(npm run lint:*)" "Edit" "Read" \
  --max-turns 10 \
  --output-format json > lint-fix-report.json
```

---

## 2. 会话管理：续、分叉、回滚

![会话生命周期：检查点串成会话，-c 续写、--fork-session 分叉、/rewind 回滚](<../../../../_attachments/tools/claude-code/session-lifecycle.svg>)

### 2.1 续会话：`-c` 与 `-r`

每次会话都被持久化在本地（`~/.claude/projects/` 下，按项目目录区分）。

```bash
claude -c                  # 续上当前目录最近一次会话（最常用）
claude -r                  # 打开选择器，从历史会话里挑
claude -r "<session-id>"   # 直接按 ID 续
claude -c -p "继续，把剩下的测试补完"   # 无头模式也能续！
```

最后这条很关键：**交互式开头、脚本化收尾**是个很实用的模式——你在交互里把方向带正，然后用 cron/CI 续着这个会话把体力活跑完。

### 2.2 分叉会话

续会话默认是"接着写"。如果你想**保留原会话、开个平行分支试另一条路**：

```bash
claude -r "<session-id>" --fork-session
```

适合"方案 A 试到一半想试方案 B，但 A 的上下文不想丢"。

### 2.3 回滚：checkpoint 与 `/rewind`

Claude Code 会在每次改动前自动打**检查点（checkpoint）**。两个入口：

- **连按两次 `Esc`**：跳回对话历史中的某条消息，从那里重新说。
- **`/rewind`**：打开回滚面板，可以选择**只回滚代码**、**只回滚对话**、或**两者一起**回到某个检查点。

这意味着你可以放心让它大胆尝试：改崩了就 `/rewind`，比 `git stash` 心智负担小得多。

> 注意：checkpoint 不能替代 git。它跟踪的是 Claude 的编辑，bash 命令产生的副作用（比如 `rm`、数据库写入）不在回滚范围内。重要节点照常 commit。

---

## 3. 交互终端的隐藏技巧

这些小技巧单个不起眼，加起来差别巨大：

- **`!` bash 模式**：输入框里以 `!` 开头直接跑 shell，比如 `!git log --oneline -5`。输出会进入上下文——这是"主动喂运行时信息"最快的方式，比让 Claude 自己去跑还省一轮。
- **消息排队**：Claude 干活时你可以继续打字、按回车，消息会排队，它做完当前动作就处理。不用干等。
- **`Ctrl+B` 后台任务**：`npm run dev`、长时间编译这类命令丢到后台，Claude 继续干别的，需要时还能读后台输出查日志。
- **贴图**：截图后直接在终端 `Ctrl+V` 粘贴（macOS 注意是 Ctrl 不是 Cmd），UI bug 截图扔给它比文字描述准确十倍。
- **`Ctrl+R`**：展开被折叠的完整输出；也用于反向搜索输入历史。
- **多行输入**：`\` + 回车，或 `Option+Enter` / `Shift+Enter`（按终端而定）；`/terminal-setup` 可以帮你配好。
- **`/vim`**：输入框切换 vim 键位，hjkl 党福音。
- **Tab 补全**：文件路径、命令名都能补全。
- **`/export`**：把当前对话导出成文件，写复盘 / 发给同事都方便。
- **`/add-dir`**：会话中途把另一个仓库挂进来（等价启动参数 `--add-dir`），跨仓库改动必备。

---

## 4. 权限体系全解

基础篇讲了模式和 allow/deny 规则，这里把整个决策链讲透。

### 4.1 一次工具调用的完整决策顺序

Claude 每次想用工具（Edit / Bash / WebFetch…），按这个顺序裁决：

![权限决策链：deny → PreToolUse hook → ask → allow → 按权限模式处理](<../../../../_attachments/tools/claude-code/permission-decision.svg>)

记住两条优先级铁律：**deny > allow**；**hook 是规则之外的最后一道程序化关卡**。

### 4.2 规则语法完整版

格式都是 `工具名` 或 `工具名(匹配器)`：

| 写法 | 含义 |
|---|---|
| `Bash` | 所有 bash 命令 |
| `Bash(npm run test)` | 精确这一条命令 |
| `Bash(npm run test:*)` | 前缀匹配（注意是冒号 `:*`） |
| `Edit(src/**)` | 只允许编辑 src 下的文件（gitignore 风格 glob） |
| `Read(~/.zshrc)` | 家目录下的具体文件 |
| `Read(//tmp/**)` | `//` 开头表示绝对路径 |
| `WebFetch(domain:github.com)` | 只允许抓这个域名 |
| `mcp__github` | 某个 MCP server 的全部工具 |
| `mcp__github__create_issue` | MCP server 的单个工具 |

`ask` 列表是第三类：命中就**必定弹确认**，适合"允许但要看一眼"的灰色操作：

```json
{
  "permissions": {
    "allow": ["Bash(git diff:*)", "Bash(git log:*)"],
    "ask":   ["Bash(git push:*)"],
    "deny":  ["Read(./.env)", "Read(./secrets/**)", "Bash(curl:*)"]
  }
}
```

> **用 deny 保护敏感文件**是最容易被忽略的安全实践：`.env`、密钥目录、生产配置，统统写进 deny 的 `Read` 规则——这比叮嘱它"别看密钥"可靠得多。

### 4.3 sandbox 与容器化

终极隔离方案不在权限系统里，而在环境层面：

- **devcontainer / Docker**：官方提供参考 devcontainer 配置，容器内可以放心 `--dangerously-skip-permissions`，配合防火墙规则只放行白名单域名。
- 原则：**权限规则防误操作，容器防恶意/失控**。两层不互相替代。

---

## 5. settings.json 与环境变量全解

### 5.1 配置文件优先级（高→低）

```text
企业托管策略（managed-settings.json，IT 下发，不可覆盖）
  > 命令行参数
  > .claude/settings.local.json   （项目·个人，进 .gitignore）
  > .claude/settings.json         （项目·团队，入库共享）
  > ~/.claude/settings.json       （个人全局）
```

### 5.2 值得知道的键（基础篇之外）

```json
{
  "model": "opus",
  "env": { "NODE_OPTIONS": "--max-old-space-size=8192" },
  "permissions": {
    "defaultMode": "acceptEdits",
    "additionalDirectories": ["../shared-libs"]
  },
  "hooks": { },
  "enabledPlugins": { "code-review@claude-plugins-official": true },
  "statusLine": { "type": "command", "command": "~/.claude/statusline.sh" },
  "outputStyle": "Explanatory",
  "includeCoAuthoredBy": false,
  "cleanupPeriodDays": 60
}
```

- `permissions.defaultMode`：项目默认权限模式——比如给稳定项目入库一个 `acceptEdits`，团队所有人开箱即是这个模式。
- `permissions.additionalDirectories`：常驻挂载额外目录，免得每次 `--add-dir`。
- `env`：每次会话注入的环境变量，proxy、构建配置都放这。
- `cleanupPeriodDays`：本地会话记录保留多久。

### 5.3 常用环境变量

| 变量 | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` | 认证 / 自建网关 |
| `ANTHROPIC_MODEL` | 默认模型（也可 settings 里 `model`） |
| `CLAUDE_CODE_OAUTH_TOKEN` | CI 用长期 token（`claude setup-token` 生成） |
| `MAX_THINKING_TOKENS` | 限制思考 token 上限 |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 限制单次输出上限 |
| `HTTP_PROXY` / `HTTPS_PROXY` | 走代理 |
| `DISABLE_TELEMETRY=1` | 关遥测 |
| `BASH_DEFAULT_TIMEOUT_MS` | bash 工具默认超时 |

### 5.4 状态栏与输出风格

- **`/statusline`**：让 Claude 帮你生成一个状态栏脚本（显示当前模型、git 分支、本次花费等），本质是 settings 里的 `statusLine.command`——脚本从 stdin 收到一个 JSON（模型、目录、成本等），输出一行文本。
- **`/output-style`**：切换回答风格。内置 `Explanatory`（边干边讲原理）和 `Learning`（留 TODO 让你自己写关键部分，适合学习）；也可以自定义风格存在 `~/.claude/output-styles/`。

---

## 6. 自定义 slash 命令进阶

基础篇讲了 `$ARGUMENTS`，进阶在于 frontmatter 和**预执行**：

```markdown
---
description: 针对指定模块做安全审查
argument-hint: <模块路径>
allowed-tools: Bash(git log:*), Bash(git diff:*), Read, Grep
model: opus
---

## 上下文（自动注入，不用 Claude 再去跑）

- 当前分支：!`git branch --show-current`
- 最近 10 条提交：!`git log --oneline -10`
- 待审改动：!`git diff main...HEAD --stat`

## 任务

对 $1 模块做安全审查，重点检查输入校验和权限判断。
参考上面注入的 diff 范围，只审本分支改动过的文件。
```

四个进阶点：

1. **`!`反引号预执行**：命令文件里 `` !`shell命令` `` 会在**提交给模型之前**先执行，把输出注入 prompt。审查类命令必备——上下文是新鲜的、确定的。
2. **位置参数**：`$1`、`$2` 比 `$ARGUMENTS` 更精确，配 `argument-hint` 提示用法。
3. **`allowed-tools`**：命令自带工具白名单，运行这个命令时临时放行这些工具。
4. **`@` 引用**：命令文件里也能写 `@src/config.ts` 直接带上文件内容。

命令支持子目录命名空间：`.claude/commands/security/audit.md` → `/security:audit`。

---

## 7. 编写自己的 Skill

skill 和 slash 命令的本质区别：**命令是你主动调用的模板，skill 是 Claude 按场景自动选用的操作手册**。当你发现自己反复在 prompt 里粘贴同一段"操作规程"，就该把它变成 skill。

### 7.1 结构

```text
.claude/skills/deploy-checklist/        # 项目级（个人级放 ~/.claude/skills/）
├── SKILL.md            # 主文件：何时用 + 怎么做
├── references/         # 详细资料，按需才读（可选）
│   └── rollback.md
└── scripts/            # 可执行脚本（可选）
    └── healthcheck.sh
```

```markdown
---
name: deploy-checklist
description: 部署本项目到 staging/production 时使用。涵盖部署前检查、执行步骤、健康检查和回滚预案。当用户提到"部署"、"上线"、"发布"时触发。
---

# 部署流程

## 部署前
1. 确认 `npm test` 全绿，无未提交改动
2. 检查 .env.production 的变量与 wiki 清单一致

## 执行
1. `./deploy.sh staging` 先上 staging
2. 跑 `scripts/healthcheck.sh`，全部 200 才继续
3. ...

## 出问题时
读 references/rollback.md，按其中步骤回滚。
```

### 7.2 写好 skill 的三条经验

1. **description 决定一切**。Claude 是靠 description 决定要不要用这个 skill 的——写清楚"什么场景用"+"用户会说哪些关键词"，比正文写得再好都重要。
2. **渐进式披露**。SKILL.md 保持精炼（几百行内），细节拆到 `references/` 子文件里让 Claude 按需读取——skill 平时只有 description 占上下文，被触发才加载正文。
3. **从对话中沉淀**。最好的 skill 不是凭空设计的：哪段流程你已经在对话里成功带 Claude 走过两三次，就让它"把刚才这套流程总结成一个 skill"，立等可取。

---

## 8. Subagents 进阶

### 8.1 完整 frontmatter

```markdown
---
name: code-reviewer
description: 代码写完后主动用它做审查。MUST BE USED after significant code changes.
tools: Read, Grep, Glob, Bash
model: haiku
---

你是严格的代码审查员。只报告高置信度的问题，按严重程度排序。
对每个问题给出：文件:行号、问题描述、建议修法。不要复述正确的代码。
```

- `tools` 不写 = 继承全部工具；**审查/调研类 agent 建议去掉写权限**（不给 Edit/Write），物理上保证它"只看不动"。
- `model`：调研、摘要类配 `haiku` 省钱提速；要深度分析再上 `opus`；写 `inherit` 跟随主会话。
- description 里写 "use proactively" / "MUST BE USED" 会显著提高 Claude 自动派活的积极性。

### 8.2 使用模式

- **显式指派**：`用 code-reviewer 检查我刚才的改动`。
- **并行扇出**：`分别用三个 agent 并行调查 auth、payment、notification 三个模块的入口和依赖`——子代理各有独立上下文，互不污染，总耗时≈最慢的那个。
- **链式流水线**：`先用 researcher 摸清现状，再根据结论用主会话改，最后用 code-reviewer 审`。
- **上下文防火墙**（最重要的心法）：任何"要读一大堆文件但只需要结论"的活都丢给 subagent。主会话的上下文是稀缺资源，subagent 烧的是自己的窗口，带回来的只有几段结论。

---

## 9. Hooks 深入：从"配置"到"编程"

基础篇展示了跑一条命令。hooks 真正的威力在于**它能读上下文、做判断、改变 Claude 的行为**。

### 9.1 工作机制

![hook 工作协议：事件触发脚本，stdin 收 JSON，exit 0 放行 / exit 2 阻止且 stderr 反馈给 Claude](<../../../../_attachments/tools/claude-code/hooks-protocol.svg>)

hook 被触发时，从 **stdin 收到一个 JSON**（含 session_id、工具名、工具参数等），然后用两种方式表达意见：

- **退出码**：`0` = 放行；`2` = **阻止该操作**，并把 stderr 的内容反馈给 Claude（它会读到并调整行为）。
- **stdout 输出 JSON**（高级）：可以精确控制 `permissionDecision`（allow/deny/ask）、注入 `additionalContext` 等。

### 9.2 实战例子一：挡住对敏感文件的一切编辑

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "python3 ~/.claude/hooks/protect.py" }]
      }
    ]
  }
}
```

```python
#!/usr/bin/env python3
# ~/.claude/hooks/protect.py
import json, sys

data = json.load(sys.stdin)
path = data.get("tool_input", {}).get("file_path", "")
BLOCKED = [".env", "secrets/", "prod.config", ".git/"]

if any(b in path for b in BLOCKED):
    print(f"禁止修改受保护文件：{path}", file=sys.stderr)
    sys.exit(2)        # 退出码 2：阻止操作，stderr 会反馈给 Claude
sys.exit(0)
```

### 9.3 实战例子二：编辑后自动格式化（只格式化被改的那个文件）

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "jq -r '.tool_input.file_path' | { read f; case \"$f\" in *.py) black \"$f\" ;; *.ts|*.tsx) npx prettier --write \"$f\" ;; esac; }"
        }]
      }
    ]
  }
}
```

### 9.4 其它高价值事件

| 事件 | 典型用法 |
|---|---|
| `UserPromptSubmit` | 给每条用户消息自动附加上下文 / 拦截含密钥的 prompt |
| `Stop` | Claude 想结束回合时校验"活真干完了吗"（比如测试没过就退出码 2 把它顶回去继续干） |
| `SessionStart` | 会话开始注入动态上下文（当前 sprint 任务、最近 issue） |
| `PreCompact` | 压缩前备份完整对话 |
| `Notification` | Claude 等你输入时发系统通知 / 手机推送 |

> 心法重复一遍：**"每次 X 必须 Y"的规矩，写进 hook 而不是 CLAUDE.md。** CLAUDE.md 是建议（模型可能忘），hook 是法律（必定执行）。

---

## 10. MCP 进阶与 Plugin 编写

### 10.1 MCP 的三个作用域

```bash
claude mcp add github -s user -- npx -y @modelcontextprotocol/server-github
#                      ^^^^^^^ local（默认，仅本项目本人）/ project（写入 .mcp.json，入库共享）/ user（你的所有项目）
```

项目级 `.mcp.json` 支持环境变量展开，密钥不用入库：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

两个容易错过的能力：

- **MCP 资源引用**：`@server:protocol://path` 可以像 @ 文件一样直接引用 MCP server 暴露的资源。
- **MCP prompt 即命令**：server 暴露的 prompt 会变成 `/mcp__server__prompt` 形式的 slash 命令。

### 10.2 把你的扩展打包成 plugin

当你的 `.claude/` 里攒了一批好用的 commands/skills/agents/hooks，就值得打包分发：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # {"name": "my-plugin", "version": "0.1.0", "description": "..."}
├── commands/                # slash 命令
├── skills/                  # skills
├── agents/                  # subagents
├── hooks/
│   └── hooks.json           # hook 配置
└── .mcp.json                # 捆绑的 MCP server（可选）
```

发布 = 推到一个 git 仓库。再建一个 marketplace 仓库（含 `.claude-plugin/marketplace.json` 列出插件清单），别人就能：

```text
/plugin marketplace add 你的名字/你的marketplace仓库
/plugin install my-plugin@你的marketplace
```

本地开发时不用反复推送：`claude --plugin-dir ./my-plugin` 直接加载本地目录调试。

---

## 11. 并行多开：git worktree 与多实例

单实例的天花板是"一次只能干一件事"。突破方式：

![worktree 并行：主仓库 fan-out 到多个 worktree 目录，各跑一个 Claude，最后合回 main](<../../../../_attachments/tools/claude-code/worktree-parallel.svg>)

### 11.1 git worktree（推荐的隔离方案）

```bash
git worktree add ../proj-feature-a feature-a    # 同一仓库检出到另一个目录、另一个分支
cd ../proj-feature-a && claude                  # 这里跑一个独立 Claude
# 原目录里的 Claude 继续干主线的活，两边文件零冲突
```

每个 worktree 是独立的工作区、共享同一个 git 历史。三五个 worktree + 三五个 Claude 并行推进不同 feature，是重度用户的标准姿势。用完 `git worktree remove ../proj-feature-a`。

### 11.2 写手/审查者模式

开两个实例：A 负责写，B 只给读权限负责挑刺（或直接用 `/review`、subagent 审查）。**写和审用不同的上下文**，审查质量明显高于"自己写自己审"——和人类结对评审是一个道理。

### 11.3 fan-out 批处理

对大批量机械任务（迁移 100 个文件、给 50 个模块补注释），用无头模式循环：

```bash
for f in $(cat files-to-migrate.txt); do
  claude -p "把 $f 从 Vue2 语法迁移到 Vue3，保持行为不变" \
    --allowedTools "Edit" "Read" "Bash(npx vitest run:*)" \
    --output-format json >> migration-log.jsonl
done
```

---

## 12. CI 与自动化集成

### 12.1 GitHub Actions

```text
/install-github-app     # 一次性安装，之后 issue/PR 里 @claude 即可用
```

工作流文件里用官方 action，典型场景：

```yaml
# .github/workflows/claude.yml（节选）
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    # @claude 提到时自动响应 issue/PR；也可配置成 PR 自动审查
```

### 12.2 定时任务 / 钩子里的 Claude

无头模式 + cron 的组合空间很大，比如每天早上自动盘点：

```bash
# crontab：每天 9 点总结昨日提交并发到团队群
0 9 * * * cd /repo && claude -p "总结昨天的 git 提交，按模块分组，中文，发给非技术同事也能看懂" --allowedTools "Bash(git log:*)" | ./send-to-chat.sh
```

git 原生钩子也能用：`pre-commit` 里跑 `claude -p` 审查暂存区改动并拦截明显问题。

---

## 13. Agent SDK：把 Claude Code 嵌进你的程序

无头模式再进一步：**Claude Agent SDK**（TypeScript / Python）把 Claude Code 的整个 agent 循环（工具、权限、上下文管理）作为库暴露出来：

```python
from claude_agent_sdk import query

async for message in query(
    prompt="分析这个仓库的测试覆盖盲区",
    options={"allowed_tools": ["Read", "Grep", "Bash"], "max_turns": 8},
):
    print(message)
```

什么时候从 `claude -p` 升级到 SDK：需要**细粒度流式处理**、**自定义工具**、**程序化权限回调**、或把 agent 嵌入你自己的产品时。一次性脚本用 `-p` 足够。

---

## 14. 观测：上下文、成本、遥测

### 14.1 `/context`——给上下文做 X 光

`/context` 可视化显示当前窗口被什么占用：系统提示、CLAUDE.md、MCP 工具定义、对话历史各占多少。**性能莫名变差时先看它**——常见病因是装了一堆 MCP server，光工具定义就吃掉几万 token。治法：用不到的 server 在 `/mcp` 里禁用、或拆到按需启用的项目里。

### 14.2 成本三件套

- `/cost`：本次会话花费（API 计费用户）；`/usage`：订阅额度用量。
- 无头模式 `--output-format json` 里的 `total_cost_usd` 字段：脚本里逐次记账。
- 省钱杠杆排序：**及时 `/clear`（最大头，长对话每轮都重发全部历史）> 调研派 haiku subagent > 模型降档 > 控制思考强度**。

### 14.3 团队级遥测

Claude Code 原生支持 **OpenTelemetry**：`CLAUDE_CODE_ENABLE_TELEMETRY=1` 加 OTEL 标准环境变量，就能把用量、成本、工具调用指标打到 Datadog/Grafana，适合团队管理员做用量看板。

---

## 15. 进阶排错

| 现象 | 排查路径 |
|---|---|
| 回答质量突然变差 | `/context` 看是不是上下文快满/被 MCP 工具定义挤占 → `/compact` 或 `/clear` |
| CLAUDE.md 某条规矩不生效 | `/memory` 确认加载层级；规矩太多会稀释，把"必须执行"的改成 hook |
| hook 没触发 | `claude --debug` 看 hook 执行日志；确认 matcher 拼写（区分大小写）；settings 改完要重启会话 |
| 无头模式卡住不动 | 大概率在等权限确认——补 `--allowedTools` 或 `--permission-mode` |
| MCP server 连不上 | `claude --mcp-debug` 启动看握手日志；`/mcp` 看状态；先在终端单独跑一遍 server 命令 |
| 权限规则不匹配 | `/permissions` 看实际生效的规则集和来源层级；记住前缀匹配是 `:*` 不是 ` *` |
| 会话历史找不回 | `claude -r` 选择器里翻；本地存储在 `~/.claude/projects/<目录映射>/` |
| 升级后行为变化 | `claude --version` + 官方 CHANGELOG；`claude doctor` 体检 |

---

## 16. 关联资源

- 基础篇：《Claude Code CLI 使用教程》（同系列，先读它）
- 官方文档：https://docs.claude.com/en/docs/claude-code
- Agent SDK：https://docs.claude.com/en/api/agent-sdk/overview
- 官方最佳实践长文：https://www.anthropic.com/engineering/claude-code-best-practices
- 官方插件市场：https://github.com/anthropics/claude-plugins-official
- 换后端供应商（DeepSeek / Kimi / GLM…）：https://github.com/shuaishuaiZhu-ai/claude-code-proxy

---

> 同样的免责声明：Claude Code 迭代极快，本文写于 2026-06-12。任何参数、配置键、行为细节与你本机不一致时，以 `claude --help`、会话内 `/help` 和官方文档为准。
