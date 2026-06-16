---
type: note
title: "Claude Code 会话策略与跨 session 记忆机制"
created: 2026-06-16
updated: 2026-06-16
tags: [tools, claude-code, session, memory, best-practice]
status: active
---

# Claude Code 会话策略与跨 session 记忆机制

> 两个问题合在一页:
> 1. **每个任务做完就新开 session,还是一个 session 长期用?**
> 2. 既然新开 session 后"之前执行的东西都没了",**有哪些机制能把有用的东西带给下一个任务?**
>
> 配套:[Claude Code CLI 使用教程](<./Claude Code CLI 使用教程.md>)、[Claude Code CLI 进阶教程](<./Claude Code CLI 进阶教程.md>)(命令/按键细节在那两篇)。
> 一切以本机 `claude --help`、`/help` 和官方文档为准。整理日期:2026-06-16。

---

## 一、结论

**默认:一个任务做完就新开 session(或 `/clear`),而不是一个 session 长期用。** 这是 Anthropic 官方的默认推荐。长 session 只在"当前上下文还在为下一步实际帮忙"时才划算。

判断标准不是"任务相不相关",而是:

> **当前窗口里的上下文,还在帮忙吗(still load-bearing)?**

- 还在被引用 → 留着,别花钱重建。
- 已经是噪声 → 清掉。

### 为什么默认新开:context rot(上下文腐烂)

模型性能会随上下文增长而**下降**:注意力被摊薄到越来越多 token 上,早期、不相关的内容会稀释并干扰当前任务。结果是——**一个干净的、带精炼 brief 的新 session,几乎总是优于一个堆满纠正记录的长 session**。

---

## 二、新开 vs 长期 —— 对比

| 维度 | 每任务新开 Session | 单一长期 Session |
|---|---|---|
| 模型准确率/稳定性 | **高**(零腐烂) | 随时长下降(context rot) |
| Token 成本 / 速度 | **低 / 快** | 越来越高 / 慢 |
| 上下文连续性 | 需手动重建 | **天然连续,不用重读** |
| 上手负担 | 要写 brief | 几乎无 |
| 适合场景 | 切换到新任务 / 不相关工作 | 紧密相关的连续子任务 |
| 主要风险 | 重复读文件 | 噪声累积、靠不断纠正硬撑 |
| 官方定位 | **默认推荐** | 例外(上下文仍承重时) |

**新开的代价**主要是"重建上下文要重读文件,慢且费一次";**长期的代价**是腐烂、变贵变慢、噪声累积。所以紧密链条(刚实现完马上写它的文档/测试)适合留在同一 session,其余默认新开。

---

## 三、在一个进程里管理上下文(混合策略)

不必二选一,真正的做法是用工具调上下文:

| 情况 | 工具 | 理由 |
|---|---|---|
| 走错了方向 | `/rewind` | 保留有用的文件读取,丢掉失败那段尝试 |
| 会话臃肿、有陈旧内容 | `/compact` | 低成本;模型自己总结后替换历史(有损,可定向 `/compact 聚焦 X,丢 Y`) |
| 开始新任务 | `/clear` | 零腐烂;由你写 3~5 行 brief 决定带什么进新窗口 |
| 中间输出很多、只要结论 | 子 agent | 噪声留在子上下文,主窗口干净 |

**清理时机:** `commit` 之后最理想(已完成、已测、已推,是天然 checkpoint);活跃工作约每 30~45 分钟或每完成一个里程碑 compact 一次。

---

## 四、跨 session 记忆机制(问题 2 的正面回答)

"新开 session 后之前的东西就没了" —— **不完全对**。从"原样保留"到"提炼沉淀",Claude Code 有一整套从强到弱的机制。按持久性和用途分层:

### A. 直接续上原会话(上下文原样回来)

最直接:之前的对话**根本没丢**,可以续。

- `claude -c` / `claude --continue` —— 续上**本目录最近一次**会话。
- `claude -r` / `claude --resume`(会话内 `/resume`)—— 打开选择器,挑任意历史会话续。
- 续上时会同时加载**完整对话历史 + CLAUDE.md**,零重新解释。
- 代价:把腐烂也一起带回来了。适合"继续同一条进行中的工作线",不适合"开全新任务"。

### B. 项目记忆 CLAUDE.md(稳定、跨所有 session 自动加载)

每次启动自动读取的 markdown,是最常用的"长期记忆"。

- 层级:企业级 / 项目级(repo 根 `CLAUDE.md`)/ 用户级(`~/.claude/CLAUDE.md`)/ 本地。
- 会话内打 `# 一句话` 可即时追加进 CLAUDE.md;`/memory` 编辑。
- 定位:放**稳定、项目级**的东西——技术栈、约定、架构决策、踩坑结论。**手写、手维护**,适合沉淀"下一个任务也该知道"的规则。

### C. 自动记忆 / Session Memory(后台自动提炼)

后台自动运行的系统,无需你输入:观察对话、抽取要点、把结构化摘要写到磁盘,下次自动 recall(终端会显示 "Recalled / Wrote memories",约 v2.1.30/2.1.31、2026 年初开始显眼)。

- 本仓库就启用了这一机制:`/root/.claude/projects/-root-workspace-wiki/memory/`,以 `MEMORY.md` 为索引,每条记忆一个文件 + frontmatter(type: user/feedback/project/reference)。
- 定位:跨 session 自动携带"我是谁、给过什么反馈、项目约束"等,不用每次重讲。

### D. 交接 / brief 文件(显式手写沉淀)

把"下一个 session 该接着干什么"显式写到文件,新 session 第一件事就读它。

- `/remember`(remember skill)—— 把会话状态写成交接文件;本仓库的 SessionStart hook 指定写到 `.remember/remember.md`,并有 `now.md / today-*.md / recent.md / archive.md / core-memories.md` 的历史分层。
- `cross-session-learning` —— 把"踩过的坑/项目模式"沉淀到 `.claude/learnings/`,新任务遇到类似问题时复用。
- 这就是"`/clear` 前写 3~5 行 brief"的持久化版本。

### E. 写进磁盘的产物(最持久、与工具无关)

最可靠的跨 session 记忆其实不是会话功能,而是**把结论落成文件**:设计文档、计划、代码注释,以及——**像本仓库这样的 wiki**。任何新 session(甚至换一台机器、换一个 AI)都能读到。本页本身就是一次这样的沉淀。

### F. MCP 记忆服务器(可选,跨项目/结构化)

通过 MCP 接入知识图谱式记忆服务器,可做跨项目、可查询的长期记忆。属于进阶/可选项,按需引入。

### 选型速查

| 你想要什么 | 用哪个 |
|---|---|
| 原样接着上次干 | `--continue` / `--resume`(A) |
| 让每个新 session 都知道的项目规则 | CLAUDE.md(B) |
| 自动携带"我是谁/反馈/约束" | 自动记忆 Session Memory(C) |
| 明确告诉下一个 session"接着做 X" | `/remember` 交接文件(D) |
| 永久、可被任何人/任何工具读到的知识 | 写成文档 / wiki(E) |
| 跨项目结构化记忆 | MCP 记忆服务器(F) |

**组合用法(推荐):** 任务做完 → commit → 把可复用结论写进 CLAUDE.md(规则)或 wiki(知识)→ `/clear` 开新任务,首条消息贴一段 brief。这样既零腐烂,又不丢有用的东西。

---

## 五、落到本仓库

这个 vault **天生适合"每任务新开"**,因为它已有现成的"brief 机制":CLAUDE.md 规定的读取顺序 `hot.md → index.md → 子 index`。新 session 照这个顺序读,就能极低成本重建上下文——"新开"的最大缺点(重建)被仓库结构基本抵消。

- 一篇知识页写完、提交后 → 直接新开(或 `/clear` + 一句 brief),下一篇从 `hot.md` 进入。
- 只有"分析完某模块、马上要基于刚读的源码继续写它的页面"这种紧密链条,才值得留在同一 session(刚读的源码仍在承重,重读不划算)。
- 想让结论跨 session 留存,就**落成 wiki 页(本页所属层) + 必要时进 CLAUDE.md**,而不是指望 session 历史。

**一句话:默认新开;把"长 session"当成"上下文还在帮忙"时的有意识例外。要带给下一个任务的东西,沉淀到 CLAUDE.md / 自动记忆 / 交接文件 / wiki,而不是留在会话里。**

---

## 来源

- [Best practices for Claude Code — Claude Code Docs](https://code.claude.com/docs/en/best-practices)
- [Using Claude Code: session management and 1M context — Claude 官方博客](https://claude.com/blog/using-claude-code-session-management-and-1m-context)
- [How to Continue Previous Chats: --continue and --resume — explainx.ai](https://explainx.ai/blog/claude-code-continue-resume-previous-conversation-2026)
- [Claude Code Session Memory: Automatic Cross-Session Context — claudefa.st](https://claudefa.st/blog/guide/mechanics/session-memory)
- [Claude Code Context Management Guide — SitePoint](https://www.sitepoint.com/claude-code-context-management/)
