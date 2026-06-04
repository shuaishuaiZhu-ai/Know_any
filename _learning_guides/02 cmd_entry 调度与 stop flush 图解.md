# cmd_entry 调度与 stop flush 图解

这页是 `cmd_entry()`、candidate/pending、stop/flush 的 hot path 总览。先记住一条主线：`cmd_entry()` 每轮先用无锁预检判断有没有值得处理的事，再进锁内优先 drain flush，最后才在 HCQD active 集合里选一个 HCQD 做 stop / pending / candidate dispatch。

## 背景：为什么 stop/flush 要重构

stop/flush 不是普通 packet，而是控制面事件。它们一旦发生，就要求 firmware 立刻调整 queue 状态；如果还按照普通 candidate dispatch 继续走，可能出现旧 packet 被继续执行、pending 状态被误清、或者多个 context flush 互相覆盖。

这次改动的核心收益：

- 正确性：stop 不依赖 candidate，也能通过 `stop_bitmask` 被调度到。
- 并发性：flush 不再用单体全局信息，而是 `flush_cxt_bitmap + flush_hcqd_bitmap[cxt_id]`，避免多 context 覆盖。
- 性能：hot loop 常态只做 bitmap 判断，不扫描 stop flag 或 32 个 context。
- 隔离性：flush 后只清被影响的 HCQD，不全量 reset 其他 queue。

## 必读页面

- [[CP cmd_entry Candidate V7 调度设计]]
- [[CP stop flush 与 queue 切换]]
- [[CP candidate peek 热路径优化]]
- [[CP 分支预取与 cmd_entry 布局优化]]
- [[CP queue scheduling stop flush]]

## 一图看主循环

```mermaid
flowchart TD
    LOOP([cmd_entry while 1]) --> EXC{"exception?"}
    EXC -- yes --> YIELD["rt_thread_yield<br/>下一轮"]
    EXC -- no --> P1

    subgraph P1["Phase 1: 无锁预检"]
        C0{"candidate == 0?"} -- yes --> RC["candidate = ib_get_candidate_bitmask()"]
        C0 -- no --> ACTIVE
        RC --> ACTIVE["active = candidate | pending_mask | stop_bitmask"]
        ACTIVE --> FBM["flush_bm = sf_get_flush_cxt_bitmap()"]
        FBM --> IDLE{"active == 0 && flush_bm == 0?"}
        IDLE -- yes --> CONT["continue<br/>不进锁"]
    end

    IDLE -- no --> P2

    subgraph P2["Phase 2: 关中断后处理"]
        LOCK["disable irq"] --> FRESH["重新读取 flush_cxt_bitmap"]
        FRESH --> FQ{"有 pending flush context?"}
        FQ -- yes --> DRAIN["while cxt_bm<br/>cxt_id = ctz(cxt_bm)"]
        DRAIN --> HF["sf_handle_flush(cxt_id)"]
        HF --> CLEAN["reset 被 flush 的 HCQD<br/>candidate/pending 清对应 bit"]
        CLEAN --> DRAIN
        DRAIN --> UNLOCK1["enable irq<br/>continue"]
        FQ -- no --> PICK["cmd_find_next_hcqd(active, rr_start)"]
        PICK --> STOP{"stop bit?"}
        STOP -- yes --> HS["sf_handle_stop(hcqd_id)"]
        STOP -- no --> DISPATCH["pending helper<br/>或 candidate peek/dispatch"]
        HS --> SKIP["skip: clear candidate bit<br/>rr_start = hcqd_id + 1"]
        DISPATCH --> SKIP
        SKIP --> UNLOCK2["enable irq"]
    end
```

## bitmask 关系

```mermaid
flowchart LR
    subgraph HCQD["HCQD-id space: bit index = hcqd_id"]
        C["candidate<br/>硬件新命令缓存"]
        P["pending_mask<br/>软件待重试"]
        S["stop_bitmask<br/>stop 请求"]
        A["active<br/>candidate | pending_mask | stop_bitmask"]
        C --> A
        P --> A
        S --> A
        A --> RR["ctz / round-robin<br/>选 1 个 hcqd_id"]
    end

    subgraph CXT["context-id space: bit index = cxt_id"]
        FCB["flush_cxt_bitmap<br/>哪些 context 有 flush"]
        FHB["flush_hcqd_bitmap[cxt_id]<br/>该 context 覆盖哪些 HCQD"]
        FCB --> FH["sf_handle_flush(cxt_id)"]
        FHB --> FH
        FH --> BM["返回 hcqd_bitmap"]
    end

    BM --> CLR["按 HCQD bit 精确清<br/>cmd_status / candidate / pending_mask"]
```

## 改动收益图

```mermaid
flowchart TD
    OLD["旧问题"] --> A["stop 状态分散"]
    OLD --> B["flush 单体信息覆盖"]
    OLD --> C["OSD 等待阻塞 hot loop"]
    OLD --> D["flush 全量 reset"]

    A --> A1["stop_bitmask<br/>O(1) 进入 active"]
    B --> B1["flush_cxt_bitmap + per-context HCQD bitmap"]
    C --> C1["单次 drop + notify<br/>不在 fw hot loop 等待"]
    D --> D1["processed bitmap<br/>精确清理 HCQD"]

    A1 --> G["收益：更正确、更快、更容易验证"]
    B1 --> G
    C1 --> G
    D1 --> G
```

## 关联源文

- [[wiki/fw/cp-user/CP cmd_entry Candidate V7 调度设计|CP cmd_entry Candidate V7 调度设计]]
- [[wiki/fw/cp-user/CP stop flush 与 queue 切换|CP stop flush 与 queue 切换]]
- [[wiki/sources/local-md/C-home-shuaishuai.zhu/fw/docs/cp_user_sf_cmd_changes|CP User：Stop/Flush 与 cmd_entry 优化]]
- [[wiki/sources/local-md/C-home-shuaishuai.zhu/fw/cmd_entry_roundrobin_design|CP User cmd_entry Candidate-Driven Dispatch 设计说明 V7]]
## 关键不变量

- `candidate`、`pending_mask`、`stop_bitmask` 都是 HCQD-id space，能合成 `active`。
- `flush_cxt_bitmap` 是 context-id space，只能用来枚举 `cxt_id`，不能混进 `active`。
- `flush_hcqd_bitmap[cxt_id]` 是 context 到 HCQD bitmap 的映射，`sf_handle_flush(cxt_id)` 返回 HCQD bitmap 后，`cmd_entry()` 才能精确清软件缓存。
- flush 高于 stop/pending/candidate dispatch。进入 Phase 2 后只要看到 flush，就先 drain 所有 pending context。
- stop 加入 `active`，所以即使没有新 candidate，也能被 `cmd_entry()` 调度到。
- 每轮只处理一个普通 HCQD；flush 是例外，它在锁内按 context drain。

## 容易误解点

- `candidate` 不是“命令一定能执行完”，它只是“这个 HCQD 值得 peek”。event、atomic、wait_host、block_mask 都可能转入 pending。
- pending 安全依赖于“pending 检查在 candidate 分支之前”，不是依赖 candidate bit 保留。
- trace 里看到 `ib_wait_idma_idle` 一类地址，不一定代表真实执行；要结合 valid bit 判断它是不是分支/ret 目标未解析时的 wrong-path fetch。
- stop 是 HCQD 级控制；flush 是 context 级控制，处理后再落回 HCQD bitmap 清理。

