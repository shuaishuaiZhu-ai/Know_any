---
type: learning-card
created: 2026-05-09
source: "[[wiki/sources/local-md/C-home-shuaishuai.zhu/ajthunk/.claude/learnings/feishu-requires-auth|Feishu Documents Require Authentication]]"
category: "sources/local-md"
---

# Feishu Documents Require Authentication

## 原文

- 原文链接：[[wiki/sources/local-md/C-home-shuaishuai.zhu/ajthunk/.claude/learnings/feishu-requires-auth|Feishu Documents Require Authentication]]
- 原始路径：wiki\sources\local-md\C-home-shuaishuai.zhu\ajthunk\.claude\learnings\feishu-requires-auth.md
- 分类：`sources/local-md`

## 什么时候用

- 用户给飞书文档链接，普通抓取或 WebFetch 只能看到登录页。
- 需要判断是让用户粘贴内容、让用户登录浏览器，还是请对方设置公开访问。
- 需要避免把登录页、权限页当成文档内容整理。

## 操作步骤

1. 先尝试判断链接是否公开；如果跳登录，按需要鉴权处理。
2. 优先请用户粘贴文档内容，这是最快、最少权限问题的路径。
3. 用户不方便粘贴时，使用 [[wiki/sources/local-md/C-home-shuaishuai.zhu/ajthunk/.claude/learnings/agent-browser-windows-edge-workaround|agent-browser on Windows: Use Edge Instead of Chrome]] 的 Edge 方案打开浏览器。
4. 让用户扫码/登录；若仍无权限，请用户设置公开访问或提供导出内容。
5. 只整理确认可见的正文，并标注来源方式。

## 常见失败

- WebFetch 访问飞书文档，拿到的是登录页，不是正文。
- 以为 agent-browser 自动绕过权限，实际仍需要用户登录或文档授权。
- 未区分“链接存在”和“内容可读”。

## 验证标准

- 输出内容来自用户粘贴、公开正文或已登录浏览器可见正文。
- 没有把登录提示、二维码页、权限错误页作为文档摘要。
- 若无法读取，明确要求用户粘贴或开放权限，而不是继续猜。

## 关联页面

- [[工具与登录环境经验|工具与登录环境经验]]
- [[wiki/sources/local-md/C-home-shuaishuai.zhu/ajthunk/.claude/learnings/agent-browser-windows-edge-workaround|agent-browser on Windows: Use Edge Instead of Chrome]]