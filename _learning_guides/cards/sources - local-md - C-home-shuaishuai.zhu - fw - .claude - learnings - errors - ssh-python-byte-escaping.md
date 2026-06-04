---
type: learning-card
created: 2026-05-09
source: "[[wiki/sources/local-md/C-home-shuaishuai.zhu/fw/.claude/learnings/errors/ssh-python-byte-escaping|SSH Python Binary-Mode Replacement: False-Positive Trap]]"
category: "sources/local-md"
---

# SSH Python Binary-Mode Replacement: False-Positive Trap

## 原文

- 原文链接：[[wiki/sources/local-md/C-home-shuaishuai.zhu/fw/.claude/learnings/errors/ssh-python-byte-escaping|SSH Python Binary-Mode Replacement: False-Positive Trap]]
- 原始路径：wiki\sources\local-md\C-home-shuaishuai.zhu\fw\.claude\learnings\errors\ssh-python-byte-escaping.md
- 分类：`sources/local-md`

## 什么时候用

- SSH Python 脚本在二进制模式下替换 C 字符串或日志文本，脚本打印成功但文件没变。
- 需要解释为什么 `content.replace()` 没报错却没有替换。
- 需要复盘 `b"\\n"`、真实 0x0A、字面 backslash+n 在多层转义中的区别。

## 操作步骤

1. 不先修，先测量：用 `rb` 读取目标附近字节并打印 decimal list。
2. 确认文件里的实际目标：`10` 是换行，`92,110` 是字面 `\n`。
3. 不用字符串转义构造 pattern；直接用 `bytes([...])`。
4. 写入前断言 pattern 存在，替换后立刻重读。
5. 把“为什么旧脚本假成功”写入复盘，防止下一次沿用。

## 常见失败

- `replace()` 返回原内容，脚本仍打印 fixed ok。
- 把 Python 源码里的 `b"\\n"` 和文件里的实际字节混为一谈。
- 只检查 exit code，不检查替换次数、重读字节或编译结果。
- 前一次部分修复改变了上下文字节，旧 pattern 已不匹配。

## 验证标准

- 结论必须包含替换前后的字节证据，而不只是命令输出。
- 写入脚本检查 `count` 或 `assert broken in content`。
- 修复后能在同一窗口看到目标字节，且必要构建通过。
- 若 pattern 不存在，输出“重新测量”，不继续写入。

## 关联页面

- [[AI 协作远程编辑经验|AI 协作远程编辑经验]]
- [[wiki/sources/local-md/C-home-shuaishuai.zhu/fw/.claude/learnings/patterns/byte-level-file-surgery|Byte-Level File Surgery: Diagnosis and Replacement]]
- [[wiki/sources/local-md/C-home-shuaishuai.zhu/fw/.claude/learnings/patterns/ssh-remote-file-editing|SSH Remote File Editing -- Patterns and Pitfalls]]