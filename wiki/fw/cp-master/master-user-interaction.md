---
type: note
title: "CP Master 与 CP User 交互"
created: 2026-05-09
updated: 2026-05-09
tags:
  - fw
  - cp-master
  - cp-user
  - interaction
  - stop
  - hcqd
status: active
source:
  - "remote:/home/shuaishuai.zhu/fw/aigc_sdk/grace/applications/cp/master"
  - "remote:/home/shuaishuai.zhu/fw/aigc_sdk/grace/applications/cp/user"
---

# CP Master 与 CP User 交互

CP Master 和 CP User 的边界可以按“绑定、执行、停止、释放”四段理解。

## 总览

![总览 lark-whiteboard 图解](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/01-总览-flowchart.png)

> 图解源文件：[`01-总览-flowchart.mmd`](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/01-总览-flowchart.mmd)。由 lark-whiteboard `whiteboard-cli` 从原 Mermaid 渲染。

## 绑定路径

![绑定路径 lark-whiteboard 图解](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/02-绑定路径-sequenceDiagram.png)

> 图解源文件：[`02-绑定路径-sequenceDiagram.mmd`](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/02-绑定路径-sequenceDiagram.mmd)。由 lark-whiteboard `whiteboard-cli` 从原 Mermaid 渲染。

## 执行路径

CP User 的 `cmd_entry()` 每轮：

1. 只有 `candidate == 0` 才读一次 `ib_get_candidate_bitmask()`。
2. 构造 `active = candidate | pending_mask | sf_get_stop_bitmask()`。
3. 单独读取 `flush_bm = sf_get_flush_cxt_bitmap()`。
4. flush 优先级最高，先按 context 处理所有 pending flush。
5. 非 flush 时用 `cmd_find_next_hcqd(active, rr_start)` 选 HCQD。
6. 优先处理 stop，再处理 atomic/event/wait_host/block pending，最后处理 candidate dispatch。

这解释了为什么 Master 侧 stop/release 必须等 User ack：User 可能已经 peek 或 pending 了某个 HCQD 的 packet，Master 不能只看 HCQD active 就 release。

## stop/release 路径

![stop/release 路径 lark-whiteboard 图解](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/03-stop-release-路径-sequenceDiagram.png)

> 图解源文件：[`03-stop-release-路径-sequenceDiagram.mmd`](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/03-stop-release-路径-sequenceDiagram.mmd)。由 lark-whiteboard `whiteboard-cli` 从原 Mermaid 渲染。

## flush 路径

Master 侧 `top_reg_context_flush(context_id)` 当前存在，但 destroy context 中调用被注释。User 侧 flush 逻辑已经完整：

1. `sf_flush_isr()` 读 `TOP_REG_FLUSH_ASID`。
2. bit[5] 表示 flush valid，bit[4:0] 是 context id。
3. 遍历本 core 8 个 HCQD，读 `HCQD_ATTRI.asid` 和 `HCQD_ACTIVE`。
4. 生成 `flush_hcqd_bitmap[cxt_id]`，置 `flush_cxt_bitmap`。
5. `cmd_entry()` 在锁内优先 drain 所有 pending context。
6. `sf_handle_flush()` drop 对应 HCQD 的 IB-resident packets，清 stop 状态，写 `CPE_FW_HCQD_STOPPED`。

![flush 路径 lark-whiteboard 图解](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/04-flush-路径-flowchart.png)

> 图解源文件：[`04-flush-路径-flowchart.mmd`](../../../_attachments/fw/cp-master/master-user-interaction/whiteboard-mermaid/04-flush-路径-flowchart.mmd)。由 lark-whiteboard `whiteboard-cli` 从原 Mermaid 渲染。

## Master 与 User 的关键寄存器契约

| 方向 | 寄存器/接口 | 含义 |
|---|---|---|
| Master -> HCQD/User | `TOP_REG_STOP_HCQDID` | 请求 HCQD 停止 fetch/execute |
| User 读 | `CPE_HCQD_STOPPED` | stop bitmap，User ISR 用来生成 `stop_bitmask` |
| User -> Master | `CPE_FW_HCQD_STOPPED` | User 已 drop resident packet，并完成 stop/flush 侧处理 |
| Master -> HCQD | `TOP_REG_RELEASE_HCQDID` | release HCQD 绑定 |
| Master/User 共享 | `HCQD_STATUS` | stop complete、idle、OSD count、bus idle 判断 |

## 读波形时的顺序

1. 看 Master 是否写 `STOP_HCQDID`。
2. 看 User 是否进入 `sf_stop_isr()` 或 `sf_flush_isr()`。
3. 看 `cmd_entry()` 是否优先选择 stop/flush 对应 HCQD/context。
4. 看 User 是否写 `CPE_FW_HCQD_STOPPED`。
5. 看 Master 是否随后写 `RELEASE_HCQDID` 并清 `STOP_HCQDID`。

如果第 4 步没有发生，Master 侧 release 等待是合理的；如果第 4 步发生但 Master 没 release，应检查 `top_reg_get_hcqd_stop_complete()` 里的 OSD/bus idle 条件。