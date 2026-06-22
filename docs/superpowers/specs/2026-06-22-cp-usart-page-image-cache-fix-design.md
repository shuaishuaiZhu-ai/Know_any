# CP USART 设计文档页 GitHub 图片缓存修复 — 设计文档

- 日期：2026-06-22
- 方案：A（文件名加版本号）
- 目标页：`wiki/fw/cli/cp-usart-clock-imc-init-design-review.md`
- 目标图目录：`_attachments/fw/cli/cp-usart-imc-unified-init/`

## 1. 背景与问题

该设计文档页的 4 张内嵌图在 **GitHub `main` 网页上不显示**（Obsidian 也报"找不到 `../../../_attachments/...png`"）。

已逐项排除以下可能：

- 文件缺失 / 路径错误：4 张 PNG/SVG 都在 `origin/main` 上，路径与引用完全一致。
- frontmatter 非法：第 18 行用的是中文弯引号（合法 YAML）。
- markdown 缺陷：代码围栏成对闭合（4 个 = 2 对），均在首图之后；无裸 HTML。
- 相对路径不被支持：其它页用**相同**的 `![](../../../_attachments/...)` 写法在 GitHub 上能正常显示。
- Git LFS：`*.png binary` 仅普通二进制属性，非 LFS；raw 返回真实 199KB PNG（HTTP 200）。

## 2. 根因

这 4 张图被**重渲染过但文件名未变**，GitHub 的页面渲染 / 图床（camo）缓存按未变的文件名继续返回旧缓存，导致这一页（且仅这一页）图不显示。

佐证：本库能正常显示的页用的是**带版本号的文件名**（如 `usart-layered-overview-v3.png`、`usart-init-sequence-v3.png`）——这些 `-v2`/`-v3` 后缀正是以前重画图时为绕开 GitHub 缓存而加的，是本库既有的解法。

## 3. 目标 / 成功标准

- 该页 4 张图在 **GitHub `main` 网页** 与 **Obsidian** 中都能正常显示。
- 不破坏其它页；保留相对路径写法（Obsidian 离线可用、可移植、与全库风格一致）。

## 4. 方案（A：文件名加版本号）

把 4 张图（PNG + SVG 成对）改名加 `-v2` 后缀，并更新该页全部引用：

| 旧名 | 新名 |
|---|---|
| `cp-usart-driver-split.{png,svg}` | `cp-usart-driver-split-v2.{png,svg}` |
| `cp-usart-address-map.{png,svg}` | `cp-usart-address-map-v2.{png,svg}` |
| `cp-usart-boot-sequence.{png,svg}` | `cp-usart-boot-sequence-v2.{png,svg}` |
| `cp-usart-old-new-overview.{png,svg}` | `cp-usart-old-new-overview-v2.{png,svg}` |

**不重渲染**（图内容已是正确的新版，仅改名）。

## 5. 范围

- **重命名 8 个文件**（`git mv` 保留历史）：`_attachments/fw/cli/cp-usart-imc-unified-init/` 下 4 对 png/svg。
- **更新引用：仅** `wiki/fw/cli/cp-usart-clock-imc-init-design-review.md`，共 8 处（4 个 PNG 内嵌 + 4 个 SVG 源文件链接；其中第 145 行含 boot-sequence 与 old-new-overview 两个 SVG 链接）。
- 已 `grep` 确认全库 `.md` 中无其它引用点（索引/log 只链接页面、不引用图文件名）。

## 6. 非目标

- 不改其它页、不改索引（它们不引用这些图文件名）。
- 不改用绝对 `raw.githubusercontent.com` URL（保留相对路径）。
- 不动无关的 `.raw/mas/L2C/...txt` 未提交改动。

## 7. 步骤

1. `git mv` 8 个文件，加 `-v2` 后缀。
2. 在目标 doc 中把 8 处引用的 basename 改为 `-v2`。
3. 本地校验：`grep` 确认无残留裸旧名引用；4 个 `-v2` PNG/SVG 在磁盘存在且引用解析到位。
4. 提交；经用户同意后推送 `main`；用 raw URL 校验 `-v2` 图返回 200；用户在 GitHub 硬刷新确认 4 图显示。

## 8. 风险与缓解

| # | 风险 | 缓解 |
|---|---|---|
| R1 | 改名后别处（grep 未覆盖的非 `.md`）仍引用旧名 | 已 grep `.md`；目录内 png/svg 互不引用；风险低 |
| R2 | SVG 仅为源文件超链接（非内联渲染），本可不改名 | 为与 PNG 配对一致、符合 `-vN` 惯例，一并改名 |
| R3 | 旧文件名的历史外链失效 | 内部知识库，可接受 |

## 9. 验证

- `grep -rn 'cp-usart-\(driver-split\|address-map\|boot-sequence\|old-new-overview\)\.' wiki/` 仅剩 `-v2` 引用，无裸旧名。
- 4 对 `-v2` 文件在磁盘存在；doc 中 8 处引用全部解析到存在文件。
- 推送后 raw URL（`-v2`）返回 200；GitHub `main` 网页该页 4 图正常显示。
