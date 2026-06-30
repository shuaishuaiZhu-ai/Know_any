---
type: note
title: "附录 · 代码评审记录"
created: 2026-06-13
updated: 2026-06-29
tags:
  - kmd
  - review
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc"
---

# 附录 · 代码评审记录

> **范围**：`kmd/aigc/*.c` + `kmd/aigc/kmdlib/*.c`（不含 `kmd/test/`）。**视角**：高级内核工程师，目标是让应届生
> 也能读懂、不踩坑。这是一份注释/可维护性评审记录，配合正文各章读。

## 结论先行
整体注释质量**良好**：文件头齐全、约 70% 复杂函数有前置说明、注释已全英文（无残留中文）。主要改进点三类：
① 复杂逻辑缺**行内**解释；② 39 处 TODO/FIXME 表述笼统；③ 约 92 处 `#if 0` 缺「为什么停用」。

## 总体度量
| 维度 | 现状 | 评价 |
|---|---|---|
| 文件头注释 | 核心文件都有 9–15 行 | ✅ 优秀 |
| 函数前置注释 | kmdlib 核心约 70% 复杂/导出函数有 | ✅ 良好 |
| 行内算法解释 | 复杂循环（页表清理、中断派发、队列填充）偏少 | ⚠️ 部分 |
| 注释语言 | 100% 英文，无 CJK | ✅ 优秀 |
| TODO/FIXME | 39 处，部分笼统（裸 `/*TODO:*/`） | ⚠️ 需澄清 |
| `#if 0` 停用块 | 约 92 处，多数缺停用原因 | ⚠️ 需注明 |

注释最佳：`aigc_page_table.c`、`aigc_mem_handle.c`、`aigc_gcache.c`、`aigc_fops.c`。
最该补：`aigc_queue_manager.c`、`aigc_cmd.c`、`aigc_interrupt.c`、`aigc_default_scheduler.c`。

## 按子系统的发现（要点）
- **ioctl/fops（`aigc_fops.c`）**：8 处 TODO、19 处 `#if 0`（全文件最多，多为未完成特性：SDMA、chunk-based VA、
  kernel VM）。建议给整段停用子系统加 `/* DISABLED: <特性> — <原因> */`。路径本身清晰（两级派发，见 [03](<../03-ioctl-abi.md>)）。
- **页表（`aigc_page_table.c`）**：注释密度最高，但最复杂的循环（VM 销毁时 PL0→PL1→PL2 三层强制清理）缺行内不变量
  说明。建议补「每级代表 L1/L2/L3、父节点由上轮引用保住、ctx 已注销故强制释放安全」。（见 [04](<../04-memory-and-pagetables.md>)）
- **内存句柄（`aigc_mem_handle.c`）**：`:359` 的 TODO 曾混入中文逗号「，」（已修为英文标点）。
- **队列与调度**：`fill_mcqd_info()` 是关键函数（doorbell id = `vmid*32+qid`），但 MCQD 字段含义缺行内说明；
  `allocate_hqd()` 当前恒返回 pipe0/queue0 应注明是测试占位。（见 [05](<../05-submission-events-interrupts.md>)）
- **中断与 fence**：向量号（39/40/41/46–61/109/111）建议在 top-half 处用表格固化（正文 [05](<../05-submission-events-interrupts.md>) 已固化）。
  `aigc_kmd_fence.c` 的 `fence_va` 暂未赋真实值是 bring-up 项。
- **HAL**：`aigc_hal.c` 的 `/*TODO: FIXME in the future*/` 是「多后端派发未实现，目前无条件走 Grace」；grace 各块
  真/桩状态已在正文 [06](<../06-hal-grace.md>) 用表格固化。

## 优先级清单
**P1（对应届生帮助最大）**：① 页表 VM 强制清理三层循环补行内不变量；② 固化中断向量含义与上/下半部职责；
③ `fill_mcqd_info` 字段含义行内注释。
**P2（中）**：④ 笼统 `/*TODO:*/`/`/*FIXME*/` 改成「要做什么、为什么」；⑤ 整段停用 `#if 0` 补 `/* DISABLED: ... */`。
**P3（润色）**：⑥ 删/合并过时注释；⑦ 修注释里的非英文标点。

## 已落地的注释改动（仅注释、不改代码语义）
> 原则：只动注释；每轮远端 `make FALLBACK_ENABLE=y -j` 通过、`git diff` 仅注释、`grep` 无残留中文。

- **首轮（13 处，7 个核心 .c）**：`aigc_mem_handle.c:359` 中文逗号→英文；`aigc_interrupt.c:207` 删重复旧注释；
  `aigc_hal.c:20/28` 写清多后端 TODO；`aigc_fops.c:1041/2373`、`aigc_queue_manager.c:69`、`aigc_drv.c:884/891/1332/1426`、
  `aigc_gcache.c:164/464` 等裸 TODO/FIXME 澄清。
- **P1**：`aigc_page_table.c` 的 `_vm_pgt_cleanup()` 补函数头 + 三层循环行内不变量。
- **P2（约 83 处）**：核心层所有 `#if 0` 批量补 `/* DISABLED: <原因> */`（`aigc_fops.c`、`aigc_page_table.c`、
  `aigc_devm.c` 及其余 14 个文件）。
- 远端 `docs/kmd-commenting` 提交：`0c2596e`、`49bc1fa`、`f9ac555`。

## 返回
- [KMD 知识库入口](<../index.md>) · [术语表](<./glossary.md>) · [面试向深入问答](<./interview-qa.md>)
