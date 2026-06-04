---
type: learning-card
created: 2026-05-09
source: "[[wiki/sources/local-md/C-home-shuaishuai.zhu/ajthunk/.claude/learnings/agent-browser-windows-edge-workaround|agent-browser on Windows: Use Edge Instead of Chrome]]"
category: "sources/local-md"
---

# agent-browser on Windows: Use Edge Instead of Chrome

## 原文

- 原文链接：[[wiki/sources/local-md/C-home-shuaishuai.zhu/ajthunk/.claude/learnings/agent-browser-windows-edge-workaround|agent-browser on Windows: Use Edge Instead of Chrome]]
- 原始路径：wiki\sources\local-md\C-home-shuaishuai.zhu\ajthunk\.claude\learnings\agent-browser-windows-edge-workaround.md
- 分类：`sources/local-md`

## 什么时候用

- Windows 上 `agent-browser open <url>` 报 Chrome not found。
- 不想安装 Chrome for Testing，准备复用系统自带 Microsoft Edge。
- 需要打开登录页、企业文档或本地 web 页面并保留浏览器会话。

## 操作步骤

1. 确认 Edge 路径：`/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`。
2. 如果 Node 或 npm global bin 不在 PATH，临时补：`/c/Program Files/nodejs` 和 `/c/Users/18355/AppData/Roaming/npm`。
3. 打开页面时显式指定：

```bash
PATH="/c/Program Files/nodejs:/c/Users/18355/AppData/Roaming/npm:$PATH" agent-browser open <url> --executable-path "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
```

4. 页面需要登录时，让用户在打开的 Edge 会话里扫码或输入账号。

## 常见失败

- 只运行 `agent-browser open <url>`，默认找 Chrome for Testing，失败。
- Windows 路径含空格，未加引号导致命令拆裂。
- 只修 PATH 不指定 `--executable-path`，仍然找不到浏览器。
- 登录态只存在浏览器里，不能自动迁移给 WebFetch。

## 验证标准

- 浏览器实际打开目标 URL，而不是只返回命令成功。
- 打开的不是 Chrome not found 错误，也不是空白页。
- 若用于资料抓取，已确认页面正文可见，或已说明需要用户粘贴/授权。

## 关联页面

- [[工具与登录环境经验|工具与登录环境经验]]
- [[wiki/sources/local-md/C-home-shuaishuai.zhu/ajthunk/.claude/learnings/feishu-requires-auth|Feishu Documents Require Authentication]]