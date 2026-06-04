---
type: codex-reflection
title: "2026-05-26 到 2026-06-01 项目 Session 复盘"
created: 2026-06-01
updated: 2026-06-01
tags:
  - codex
  - reflection
  - session-review
  - projects
status: active
scope: project
source:
  - "C:\Users\18355\.codex\session_index.jsonl filtered 2026-05-26..2026-06-01 Asia/Shanghai"
  - "34 unique session JSONL files under C:\Users\18355\.codex\sessions"
  - "C:\Users\18355\.codex\memories\MEMORY.md targeted rules"
  - "codex-reflection-archiver and source-command-verify"
---

# 2026-05-26 到 2026-06-01 项目 Session 复盘

## 1. 结论

这次不是索引级空泛复盘，而是按用户要求读取了 `session_index.jsonl`，筛出 2026-05-26 到 2026-06-01 Asia/Shanghai 窗口内的 35 条记录，并展开了对应的 34 个唯一 session JSONL。`fw` 相关记录在 index 里有两个标题，但对应同一个 session 文件。

主项目可以分成五组：

1. `ctrlclaw / ComfyUI / 生成媒体`：最大工作量，覆盖服务链路盘点、后端/前端草稿、Flux/Wan readiness、图片参数、UI 改造、OpenPose 工作流、模型上传和工作流修复。
2. `Codex/Hermes skills 与会话迁移`：覆盖 pm-mode、feature-dev 等 skill 包装，Hermes/ctrlclaw docs，旧项目/会话迁移和 memory export。
3. `fw / kernel / UMD`：覆盖 CP wait-host zero-address 修复、kernel test workspace 初始化、compiler/header 安装验证与 UMD 方向停止。
4. `钉钉到飞书文档迁移`：覆盖图片缺失修复、PDF/普通文件灰色问号、空文档、流程图/表格缺失根因排查。
5. `C2C / Obsidian 知识库`：覆盖 SoC 数据 vs BIST 数据解释并写入 C2C loopback 文档。

总体评价：Codex 在执行和排查上有明显产出，尤其是 ctrlclaw 与文档迁移；但项目管理层面仍有问题：多 worker 并行后缺少总收敛，Daily Review 断档，部分任务只有本地验证或只读诊断，远端 live 状态和部署一致性不能从 session 直接推断。

## 2. Session 覆盖清单

| 项目组 | Session |
|---|---|
| ctrlclaw / ComfyUI / 生成媒体 | 恢复 ComfyUI 模型下载；盘点 ctrlclaw.online 服务链路；实现后端代码草稿；实现前端草稿；调查 Flux 视频工作流；检查前端需求满足情况；审查生成媒体 UI；梳理图片参数暴露；排查 wan2.2 模型缺失；整理 image API 安全清单；改造后端参数与模型就绪；重做生成工作台前端；审查 ComfyUI 改动；添加参数记忆和动作图库；修复后端文件名与默认参数；排查 ctrlclaw 视频模型问题；新增 MajicMIX OpenPose 工作流；添加 BRA v7 OpenPose 工作流；添加 Lemix OpenPose 工作流；修复其它工作流恢复问题；上传 Z-Image ControlNet patch；删除 Z-Image 工作流和相关模型 |
| Codex/Hermes skills 与会话迁移 | 迁移 hermes 调试会话；迁移 develop_proj session；创建全局PM技能；调查上下文压缩卡住；Export stored memories |
| fw / kernel / UMD | 复制 fw session 信息 / fw；迁移 kernel test on emu 会话；排查 UMD 测试报错 |
| 钉钉到飞书文档迁移 | 迁移钉钉文档到飞书；排查 PDF 迁移问题；排查 CHJ 空文档；排查文档迁移缺失 |
| C2C / Obsidian 知识库 | 迁移总结反思和学习会话中的 SoC 数据 vs BIST 数据 |

## 3. ctrlclaw / ComfyUI / 生成媒体

### 完成了什么

- 接管了 80.116 上 ComfyUI/Flux/Wan 模型后台下载，启动后台链式守护，优先保证 Flux 测试所需文件，并保留日志/pid 证据。
- 只读盘点了 `ctrlclaw.online` 服务链路，结论是当时公网在 Cloudflare，站点返回 530，80.116 上未见对应 80/443/4174/18080 监听和 cloudflared/nginx/ngrok 进程。
- 在本地创建并实现 `ctrlclaw-comfy-app` 后端草稿：静态前端、任务队列、结果持久化、Flux t2i/img2img、ComfyUI `/prompt`/`/history`/`/view`/`/upload/image` 封装，Wan 先返回模型缺失类错误。
- 实现前端草稿，并通过浏览器/Node 检查：两个模式、参数、上传、连续生成、剩余任务、折叠结果、预览/下载/删除、移动端适配。
- 只读调查 Flux 图片和 Wan/视频 workflow：确认远端 ComfyUI、服务监听和节点/模型匹配风险；Wan 最小工作流需要 high/low UNET、text encoder、VAE、LoRA 等。
- 只读审查前端需求和 UI 质量，提出参数分层、图片/视频模式隔离、结果花窗和移动端修复建议。
- 只读梳理 image 参数暴露和安全 API 设计，提出 `/api/options/image`、VAE/LoRA 白名单和不透传 ComfyUI `/object_info` 的规则。
- 实现后端参数与 readiness 改造：`GET /api/options/image`、VAE/LoRA 白名单、Flux 工作流按选中项加载，Wan readiness 严格化。
- 重做前端视觉结构：graphite/near-black、cyan/amber 状态、参数分区、指定 DOM/API 保留。
- 添加参数记忆、Reset、动作/姿态库，使用 localStorage 保存参数但不保存上传文件本身。
- 修复输出文件名过长和默认参数，改为短文件名，并调整 Flux 默认参数。
- 只读排查视频模型：后续证据显示 Wan t2v/i2v 已 ready，失败更像 `video_smoke.py` 轮询 30 秒太短，而实际视频约 94 秒。
- 添加 MajicMIX 和 BRA v7 OpenPose 工作流，并补测试、前端选项、文档和 service 环境变量。
- Lemix OpenPose 工作流 session 中能看到配置/文档已补，但 JSONL 里没有最终完成声明，最后停在“接着跑测试、语法检查和残留扫描”。
- 修复非 SD3.5 工作流恢复问题：BRA 默认未接 LoRA 是真实配置断点，已修 `bra_v7_openpose` 默认加载 SD1.5 亚洲脸 LoRA，并补四个非 SD3.5 工作流回归测试。
- 上传 Z-Image OpenPose/Union ControlNet patch，做远端 SHA256 校验，生成正式文件、`.sha256` 和 `.complete` marker。
- 后续 session 又删除了 Z-Image 工作流和相关模型，并部署到 `ctrlclaw.online`。

### 未完成什么

- `ctrlclaw.online` 真实公网恢复状态没有在这些 session 里形成最终闭环。早期盘点是 530；后续有服务部署/模型变更，但没有统一的公网端到端验收表。
- Lemix 工作流没有看到最终完成/测试通过声明，证据不足，无法确认。
- Z-Image 先上传 patch 后又删除工作流/模型，说明需求方向发生变化；最终产品矩阵需要重新收敛。
- ComfyUI 真实图片/视频生成质量没有系统化验收，只能看到局部 smoke/readiness/文件级证据。

### 验证证据

- 后端草稿：AST/import/workflow 构造检查通过；没有真实 ComfyUI 端到端生成。
- 前端草稿：`node --check`，浏览器加载无控制台错误，连续点击和折叠结果 UI 被检查过。
- 参数/readiness：行为检查通过；Wan readiness 后续被远端 `/api/status` 证明 ready。
- BRA：本地验证 18 个服务端/静态测试 OK，`py_compile` 和 `node --check` 通过。
- 非 SD3.5 工作流修复：新增 regression tests 覆盖 visibility、readiness、ControlNet、LoRA isolation、graph nodes。
- Z-Image patch：本地 hash 与远端 uploading sha256 一致，远端正式文件、`.sha256`、`.complete` 存在。

### 风险

- 多 worker 并行导致配置方向冲突：先添加 Z-Image，后删除 Z-Image；先添加多个 OpenPose workflow，后又修其它 workflow 恢复问题。
- 远端服务和本地代码可能不一致，需要以 80.116 当前 repo/service 为 source of truth 重新验证。
- 文件上传和模型删除属于高风险运维操作，虽然有 hash 和 marker 证据，但需要最终模型清单和 service status 做收敛。

### Codex 表现

- 做得好：多数 session 能遵守边界，只读任务不改文件；修改任务有测试/语法/浏览器验证；远端模型上传有 hash 证据。
- 做得不好：并行 worker 总收敛不足；少数 session 出现 PowerShell 引号错误、误触发远端 `npm`、SSH RemoteForward warning；Lemix session 没有完成态总结。

### 下一步

1. 对 ctrlclaw 做一次总收敛：当前可用工作流、远端模型文件、`.complete` marker、`/api/status`、systemd service、公网 URL 全部放入同一张表。
2. 对 UI/API 跑一次最小 E2E：图片生成、参考图、OpenPose、视频 smoke 超时时间调整后再跑。
3. 清理产品矩阵：明确保留哪些 workflow，删除/隐藏哪些历史残留。

## 4. Codex/Hermes skills 与会话迁移

### 完成了什么

- 清理了之前由 Codex 启动但普通用户停不掉的 ComfyUI Docker/containerd 容器，解释了为什么 `pkill`/普通删除失败，并停止/删除容器和 root 写出的相关目录。
- 迁移 `develop_proj` 中的 `claude-code-proxy` 项目到新的本地工作区，只复制 Git 跟踪文件和旧 session 快照，不复制 `.git`、缓存或本地配置，并更新 README/AGENTS。
- 创建全局 `pm-mode` skill，并进一步扫描/包装多个 Claude workflow 为 Codex skill：`code-modernization`、`github-pr-code-review`、`code-simplifier`、`commit-workflow` 等。
- 导出 stored memories，按用户要求输出过往 instructions/preferences/context。
- 调查上下文压缩卡住的 session 实际也承载了删除 Z-Image workflow 的工作，因此归入 ctrlclaw 的完成项中。

### 未完成什么

- 新包装 skills 是否都在当前新会话显式 skill 列表稳定出现，证据不足，无法确认。
- `pm-mode` 的 planner/router/verifier 流程是否在后续所有复杂任务被稳定调用，证据不足，无法确认。

### 验证证据

- `develop_proj` 迁移：74 个文件源/目标 SHA256 一致，旧 session JSONL UTF-8 解析检查通过。
- skills 包装：创建了多个 `SKILL.md` / `agents/openai.yaml` 风格的全局 skill 包装，MEMORY.md 有对应沉淀。
- Hermes/ctrlclaw service facts：MEMORY.md 记录过 `ctrlclaw-comfy-app.service`、app bind `127.0.0.1:18080`、ComfyUI `127.0.0.1:8191`、`/api/status ok: true`，但公网反代仍需 live 验证。

### 风险

- “配置存在”不等于“当前会话可调用”，这已经是明确历史教训。
- skill 包装增加后，触发重名和重复来源风险变高，需要技能地图或 AGENTS 规则兜底。

### Codex 表现

- 做得好：能把 plugin/cache 概念和真正 Codex-callable `SKILL.md` 区分开；迁移时排除 `.git`/缓存，做 hash 验证。
- 做得不好：一些会话的真实任务和标题不一致，例如“调查上下文压缩卡住”实际做了 Z-Image 删除，后续复盘容易误分类。

### 下一步

1. 生成一份当前已安装 Codex skills 的触发地图，标出重名来源、首选 skill 和不要重复包装的对象。
2. 对 `pm-mode` 做一次小任务实测，确认它在新会话中能被主动调用。

## 5. fw / kernel / UMD

### 完成了什么

- 在 80.116 的 fw 远端仓库中修复 CP user wait-host cmd：`trig_addr == 0` 时跳过 trigger write，`polling_addr == 0` 时跳过 polling read，避免 zero address 访问把 CP 跑死。
- 为 kernel test on emu 初始化本地维护入口，新增 `AGENTS.md` 和 `README.md`，明确本地只是协调入口，真正 source of truth 是 80.116 的远端 repo。
- UMD/compiler 方向中，用户明确“不需要跑 UMD 用例”，Codex 停止 UMD 用例方向，仅完成 compiler build/install 与头文件/库检查。

### 未完成什么

- wait-host 修复是否已 commit/push，证据不足，无法确认。
- kernel test 本地入口只有未跟踪文件，尚未看到 commit 或远端同步。
- UMD 原始 RTC 报错是否在真实 UMD 用例中消失，用户不要求跑，所以证据不足，无法确认。

### 验证证据

- fw wait-host：静态检查确认 guard 存在，`git diff --check` 通过，远端 `gpu_fw_build.sh` 构建通过。
- kernel test entry：本地读取新 `AGENTS.md`/`README.md`，`git status` 只显示这两个未跟踪文件。
- UMD/compiler：`ninja -j16` 完成 `[1322/1322]`，install 返回 `install_rc=0`，目标头文件包含 `cp_async_bulk_wait_group*`，comgr 库时间更新。

### 风险

- fw 远端代码必须重新读取当前分支和 diff，不能只靠本复盘。
- UMD 没跑用例是用户要求，但最终问题是否修复仍不能声称。

### Codex 表现

- 做得好：fw 修改有构建验证；UMD 方向遵守用户“不需要跑用例”的停止要求。
- 做得不好：最终状态还缺 commit/变更归属整理，后续容易忘记未提交变更。

### 下一步

1. 进入 80.116 远端 fw repo 做一次 `git status/diff` 总收敛。
2. 对 wait-host fix 做代码 review，确认 zero address skip 不破坏 record/fence/finish 流程。

## 6. 钉钉到飞书文档迁移

### 完成了什么

- 对用户点名的飞书文档图片缺失和排版问题做了修复：根因是旧审计规则用图片数 + 表格数判断视觉元素，表格掩盖了流程图缺失；另有 DingTalk iframe/虚拟滚动、0 尺寸 SVG、tainted canvas 问题。
- 修复多份同类页面，补回流程图，并更新迁移 skill/审计规则。
- 只读排查 PDF/普通文件灰色问号：本地文件没坏，飞书对象上传时丢了扩展名，导致无扩展名 file 不能正常预览。
- 只读排查 CHJ 空文档：源 Markdown 和 DWS 源内容非空，但飞书 fetch 只有标题和空段落；根因是 `docs +create --doc-format markdown --content @md` 返回 `degrade_code=1011`，脚本仍标记 migrated，缺少创建后 fetch 校验。
- 只读排查 CP interrupt / bring up 表格缺失：问题来自 DingTalk Markdown 路径本身丢了流程图/表格，Markdown 只有占位或空数组，不是飞书导入单点失败。

### 未完成什么

- PDF/普通文件扩展名问题、CHJ 空文档、Markdown 源缺失问题在这些只读 agent session 中没有直接修复。
- 全量迁移质量是否已全部复验，证据不足，无法确认。

### 验证证据

- 图片缺失修复：报告中列出补回页面和全量同类复审结果。
- PDF 灰问号：本地文件头、ZIP/PDF 证据与飞书标题缺扩展名对照。
- CHJ 空文档：本地 Markdown 33KB、80 图片、54 标题；飞书 fetch 正文 0、图片 0、表格 0；manifest 中有 `degrade_code=1011` 线索。
- 流程图缺失：Markdown 源直接显示 `[我的流程图]` 或孤立 `[]`，没有表格/图片/mermaid。

### 风险

- 迁移脚本如果不加 post-create fetch 校验，还会把空文档标成成功。
- DingTalk Markdown 抽取链路对流程图、表格、虚拟滚动内容不可靠，需要 Word/DWS/截图/附件多路径兜底。

### Codex 表现

- 做得好：只读 agent 边界清楚；能把“飞书导入失败”和“DingTalk Markdown 源已缺失”区分开。
- 做得不好：早期审计规则设计不足，导致视觉元素缺失被表格数掩盖；需要更严格的迁移门禁。

### 下一步

1. 为迁移脚本增加 post-create fetch 校验：正文、图片、表格、视觉占位都要检查。
2. 为 file upload 修复上传名扩展名，并回补已上传的无扩展名文件标题。
3. 对 Markdown 抽取失败的文档，走 Word 导出/截图/附件替代路径。

## 7. C2C / Obsidian 知识库

### 完成了什么

- 在“迁移总结反思和学习会话”中回答了 SoC 数据与 BIST 数据区别，并更新了 C2C loopback 近端/远端文档相关章节。
- 做了 wiki 可见复查：检查文件大小、CJK 字符数、图片引用、目标段落等。

### 未完成什么

- 这类 wiki 更新没有从 session_index 里形成独立的新 session 条目，说明 session_index 可能不能完整代表所有 June 1 活动。
- C2C 文档技术正确性仍需要源文档或专家 review；本复盘只确认写入和可读性。

### 验证证据

- 本地 wiki 文件存在，CJK 字符统计和图片引用检查通过。
- 目标段落中可检索到 SoC 数据 vs BIST 数据相关内容。

### 风险

- session_index 更新可能滞后或不覆盖旧线程继续更新，因此 Daily Review 若只读 index 会漏掉长期会话。
- wiki 写入必须继续做 frontmatter、中文可读、图片链接和 hot/log/index 可见复查。

### Codex 表现

- 做得好：已经把“写完 wiki 要复查”转成实际执行，避免只写不看。
- 做得不好：仍依赖手动复查，缺少独立 quality gate skill。

### 下一步

1. 对 wiki 写入建立固定检查脚本或 skill。
2. 对 C2C loopback 文档做源证据复核，避免解释型内容漂移。

## 8. 跨项目问题

| 问题 | 影响 | 证据 |
|---|---|---|
| Daily Review 断档 | 5/26 以后多项目工作没有自动日报覆盖 | `notes/codex-daily` 停在 2026-05-25 |
| 多 worker 缺总收敛 | ctrlclaw 工作流方向反复变化，容易覆盖或残留 | Z-Image 先上传后删除；OpenPose 多模型并行添加 |
| 验证层次混杂 | 本地测试、远端状态、公网服务、模型质量经常被放在不同 session | 多数 session 有局部验证，但缺一张项目级验收表 |
| session title 与真实任务不总一致 | 后续复盘容易误分类 | “调查上下文压缩卡住”实际删除 Z-Image |
| 敏感信息风险 | 原始 JSONL 和迁移日志可能含 token/path/auth 信息 | 本次只做脱敏摘要，未输出具体敏感值 |

## 9. 总体评价

Codex 做得好的地方：

- 能在复杂远端环境中执行实际工作，并留下命令、日志、hash、测试和状态证据。
- 能在只读任务中保持边界，尤其是文档迁移排查 agent。
- 能逐渐把经验沉淀为 skills、AGENTS.md、runbooks 和 Obsidian 文档。

Codex 做得不好的地方：

- 多项目并行后没有主动做总收敛，导致用户必须追问“你的复盘有什么用”。
- 一些配置/运维任务出现引号、权限、远端端口转发 warning 等摩擦。
- 对 automation/Daily Review 的断档没有自动报警。
- 某些 session 没有最终完成态总结，影响后续复盘可信度。

## 10. 推荐下一步

1. 先做 `ctrlclaw / ComfyUI` 总收敛 review：远端代码、服务、模型、workflow、API、前端、E2E 全部核对。
2. 修复 Daily Codex Self-Review automation 断档，让这些项目级复盘不再依赖手动触发。
3. 为钉钉到飞书迁移增加三个门禁：上传文件扩展名、文档创建后 fetch 校验、Markdown 视觉占位扫描。
4. 为 session 复盘沉淀 `codex-session-safe-summary` 或等价脚本，固定做脱敏、分组、完成态/验证证据提取。
5. 对 fw wait-host 修复做一次远端 diff/commit 状态核对。

## 11. Secret Handling

本次展开了必要 session JSONL，但只提取脱敏后的目标、结论和验证证据。未输出 token、账号、密码、auth.json、cookie、私钥或环境变量敏感值。Feishu/DingTalk 文档 token、私密路径和命令中疑似敏感片段均未作为复盘事实展开。