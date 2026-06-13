---
type: note
title: "aigc_cp_ring — CP 硬件环"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - queue
  - cp
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_cp_ring.c"
---

# aigc_cp_ring — CP 硬件环

**文件**: `kmd/aigc/kmdlib/aigc_cp_ring.c`
**关联**: [[wiki/kmd/queue/index|命令队列与调度]] | [[aigc_sched]]

> `aigc_cp_ring.c` 是提交链路的最底层。一个 CP 环是固定大小、按对齐切槽的字节环，软件当生产者写、硬件当
> 消费者读，靠写 wptr（doorbell）告诉 GPU「有新活了」。

---

## 环长什么样

CP 环（`struct aigc_ring_desc`）是固定大小的字节环，槽大小为对齐尺寸（`CP_RING_ALIGNMENT`）。每个调度器一页大，
由 `aigc_mr_cp_ring_create()` 创建：分配后备页，把 ring 基址和大小写进 CP 寄存器，并使能 CP 固件：

```
CP_REG_BASE_LOW / CP_REG_BASE_HI   ring 基址
CP_REG_SIZE                        ring 大小（字节）
CP_REG_RPTR / CP_REG_WPTR          读 / 写指针
CP_REG_FW                          固件使能（写 0x01 启动）
```

## 环机制（生产者/消费者）

```mermaid
flowchart LR
  W["wptr 软件生产者偏移"] -->|插入命令包| SLOT["槽位"]
  SLOT -->|CP 取走| R["rptr 硬件消费者偏移"]
  W -. 满判定 (wptr+unit)%bytes==rptr .-> R
```

- `wptr` 是软件**生产者**偏移；`rptr` 是硬件**消费者**偏移。
- 环永远留**一个槽当永久间隙**，好区分「满」和「空」：满的条件是 `((wptr + unit) % bytes) == rptr`。
- `aigc_cp_insert_ring()` 校验 `rptr` 槽对齐、命令能放进一个槽、环没满（否则 `-EAGAIN`），然后在环锁下把命令的
  包拷进 `wptr` 处的槽，再把 `wptr` 前进一个槽（模环大小）。
- NOP 填充：`__cp_ring_fill_nop()` 可把槽的尾部用 NOP 包填上（让 CP 跳过），或在命令非 4 对齐时清零。
  （本 build 这个调用被注释掉了——每次插入直接覆盖槽。）
- **doorbell**：插入后，调用方经 `aigc_cp_update_ring_wptr()` 把 `wptr` 发布到 `CP_REG_WPTR`。**写 wptr 就是
  告诉 GPU 有新命令的动作。**

环 ops 表 `cp_ring_ops` 接 `insert_ring`/`get_ring_rptr`/`update_ring_wptr`；`aigc_set_ring_funcs()` 给硬件
引擎 0（CP/计算引擎）选用它。

> 本 build 注意点：读硬件 rptr（`aigc_cp_get_ring_rptr`）是返回 0 的桩，所以「满判定」实际是和 rptr 0 比。

## 延伸

- [[wiki/kmd/queue/index|命令队列与调度]]：命令和 CP 包怎么构建。
- [[aigc_sched]]：调度 kthread 调用 insert + 写 wptr。
- [[wiki/kmd/interrupt/index|中断与 Fence]]：命令完成怎么通知回来。
