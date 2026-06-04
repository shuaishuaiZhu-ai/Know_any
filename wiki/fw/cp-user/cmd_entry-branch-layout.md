---
type: note
title: "cmd_entry 优先级判断分支布局方案（实测版）"
created: 2026-05-11
updated: 2026-05-11
tags:
  - fw
  - cp-user
  - cmd_entry
  - branch-prediction
  - performance
  - riscv
  - nuclei
  - benchmarked
status: active
source:
  - "[[wiki/fw/cp-user/cmd_entry|CP User — cmd_entry 调度器]]"
  - "[[CP 分支预取与 cmd_entry 布局优化]]"
related:
  - "[[cmd_entry]]"
last_verified: 2026-05-11
verified_commit: e7c0f5f
verified_toolchain: "Nuclei riscv64-unknown-elf-gcc (GCC 13.1.1)"
---

# cmd_entry 优先级判断分支布局方案（实测版）

> 在 `commit e7c0f5f` 真实 `cmd_entry` 上对照 6 个变体的反汇编。结论：**用 `asm goto` 直接发射机器指令是当前最优解**——成本 +9 行（≈ +2%），换来 GCC 完全无法翻转的硬锁 layout。

## TL;DR — 最终推荐

✅ **Variant D：用 `asm goto` 替换简单条件检查的 `if (cond) goto label;`**

```c
#define ASM_GOTO_BNEZ(cond, lbl) \
    asm goto ("bnez %0, %l[" #lbl "]" :: "r"((unsigned long)(cond)) :: lbl)

#define ASM_GOTO_BEQ(va, vb, lbl) \
    asm goto ("beq %0, %1, %l[" #lbl "]" \
              :: "r"((unsigned long)(va)), "r"((unsigned long)(vb)) :: lbl)

/* in cmd_entry: */
ASM_GOTO_BNEZ(sf_get_stop_bitmask() & BIT(hcqd_id), handle_stop);
ASM_GOTO_BEQ (cmd_status[hcqd_id].cur_atomic_handle_status,
              CMD_ATOMIC_HANDLE_WAIT, handle_atomic);
ASM_GOTO_BEQ (cmd_status[hcqd_id].cur_event_wait_handle_status,
              CMD_EVENT_WAIT_HANDLE_DEPENDENCY, handle_event);
ASM_GOTO_BEQ (cmd_status[hcqd_id].cur_event_barrie_handle_status,
              CMD_EVENT_BARRIE_HANDLE_WAIT, handle_event);
ASM_GOTO_BEQ (cmd_status[hcqd_id].wait_host.cur_status,
              CMD_WAIT_HOST_HANDLE_WAIT, handle_wait_host);
ASM_GOTO_BEQ (cmd_status[hcqd_id].wait_host.cur_status,
              CMD_WAIT_HOST_TRIG_DONE, handle_wait_host);
ASM_GOTO_BEQ (cmd_status[hcqd_id].cur_block_mask_handle_status,
              CMD_BLOCK_MASK_HANDLE_WAIT, handle_block_mask_wait);

/* candidate dispatch 是 hot path，保持原写法让 GCC 自由优化 */
if (candidate & (1U << hcqd_id))
    goto handle_candidate_dispatch;
```

理由：
1. `asm goto` 让编译器**必须**发射指定的 `bnez` / `beq` 机器指令
2. GCC 的 `bb-reorder` / `partition-blocks` 不能翻转方向
3. 跨 -O0 / -O2 表现一致（都是 +9 行）
4. 不依赖编译器启发法（`bb-reorder` 不再有任何选择权）

## 实测设置

- 仓库：`/home/shuaishuai.zhu/fw`，commit `e7c0f5f`，分支 `zss/UpdateSchedule`
- 工具链：`/data3/jianhong.luo/toolchain/nuclei_gcc/bin/riscv64-unknown-elf-gcc` (GCC 13.1.1)
- Target：`-march=rv64imac -mabi=lp64 -mtune=nuclei-900-series`
- Debug：`-O0 -ggdb`；Release：`-O2`
- 构建：`./gpu_fw_build.sh -p grace -b {debug|release} -f cp_user -t gcc -l backdoor -m 3d-dram -d 1-die`
- 单次构建：5–7 秒（增量缓存）

## 六个变体

| 变体 | 改动 |
|---|---|
| **Baseline** | 现状代码（`if (cond) goto handle_X;` + 末尾 `handle_X:`） |
| **A** | + `__builtin_expect((cond), 0)` 包 5 条 priority 检查 |
| **B** | + `__attribute__((cold))` 在 5 个 cold handler label |
| **C** | A + B |
| **D** | 把 5 条 priority 检查改成 `asm goto` 直接发射机器指令 |
| **E** | `__attribute__((hot))` 给 candidate dispatch label + `cold` 给 cold handlers（极化） |

## 反汇编对照结果

`objdump -d --disassemble=cmd_entry` 输出行数：

| 变体 | Debug -O0 | Release -O2 | Layout 锁定 |
|---|---|---|---|
| Baseline | **462** | **310** | 🟡 软（依赖 GCC 源码顺序） |
| A: `__builtin_expect` | 482 (**+20**) | 374 (+64) | ❌ |
| B: `cold` label | 462 (=) | 374 (+64) | 🟡 弱（启发） |
| C: 两者 | 482 (+20) | 374 (+64) | 🟡 弱 |
| **D: `asm goto`** | **471 (+9)** | **319 (+9)** | 🟢 **硬锁** |
| E: hot+cold 极化 | 462 (=) | 349 (+39) | 🟡 弱 |

## 关键观察

### 1. `asm goto` 是唯一**硬锁** layout 的方式

其他变体（A/B/C/E）都依赖 GCC 启发法（`bb-reorder` / `partition-blocks` / `freorder-blocks-and-partition`）。这些 pass 在不同优化级别 / 不同 GCC 版本下行为可能改变。

`asm goto` 直接告诉编译器**发射这条具体指令**，跳到这个具体 label。GCC 只能选择寄存器分配，**完全无法改变分支方向或目标**。

```text
Variant D 实测分支（debug -O0）：
0x1978:  bnez a5, 0x1ad4   # stop → forward (0x1ad4 > 0x1978) ✓
0x19a8:  beq  a5, a4, 0x1b32  # atomic → forward ✓
0x19fc:  beq  a5, a4, 0x1b56  # event_wait dep → forward ✓
0x1a08:  beq  a5, a4, 0x1b56  # event_barrie wait → forward ✓
0x1a40:  beq  a5, a4, 0x1b7a  # wait_host WAIT → forward ✓
0x1a4c:  beq  a5, a4, 0x1b7a  # wait_host TRIG → forward ✓
0x1a7c:  beq  a5, a4, 0x1b9e  # block_mask → forward ✓
0x1a9e:  bnez a5, 0x1c46     # candidate (still plain C) → forward ✓
```

### 2. `asm goto` 成本极低

- Debug -O0：+9 行 = ~3 字节 ≈ 1 条压缩指令/检查（asm goto 需要把操作数载入寄存器）
- Release -O2：+9 行 = 几乎可忽略

对比：
- Variant A (`__builtin_expect`)：debug +20 行（每条多 3 条物化布尔指令），release +64 行
- Variant B (`cold`)：debug 无变化，release +64 行
- Variant E (hot+cold)：release +39 行

`asm goto` 在两个优化级别下都保持低成本，行为可预测。

### 3. 为什么 `asm goto` 比启发式 hint 更小？

启发式 hint（cold / `__builtin_expect` / hot）激活 GCC 的复杂代码重组：

- 触发 inline 决策改变
- 触发寄存器分配改变
- 触发函数 prologue/epilogue 重写
- 触发 .text 段内的 cold block partition 尝试

→ 副作用难以预测，常常让函数变大。

`asm goto` 是"声明式"的：
- 只说明分支方向，不引入概率
- GCC 没有任何"重新组织"的余地
- 副作用仅限于寄存器约束

→ 干净。

### 4. `__builtin_expect` 在 -O0 下不是 no-op（推翻直觉）

`if (__builtin_expect(cond, 0))` 强制 GCC 把表达式物化为 0/1 布尔：

| 写法 | 生成 |
|---|---|
| `if (status == WAIT) goto X;` | `li a4, WAIT; beq a5, a4, X` |
| `if (__builtin_expect(status == WAIT, 0)) goto X;` | `li a4, WAIT; xor; seqz; bnez a5, X` |

每条检查多 ~3 条指令。8 条检查 × 3 = ~24 条额外指令/循环迭代。

### 5. `cold` label 在 -O0 下完全 no-op，在 -O2 让函数膨胀但无收益

```bash
$ diff /tmp/baseline-debug.dis /tmp/coldlabel-debug.dis
# (empty — byte-identical)
```

-O2 下 cold 增加 +64 行但 priority 分支方向和 baseline 相同，hot path 长度没变。

### 6. 这套 toolchain 没启用 `-freorder-blocks-and-partition`

```text
$ objdump -h release.elf | grep cold
# (no .text.cold section)
```

所以即使加了 cold 也不会真的把 handler 搬到独立 section。**这削弱了 cold 的所有期望价值**。

## 推荐落地代码

### 宏定义（放 `cmd.c` 或公共 header）

```c
/* asm goto 强制发射 bnez/beq 指令，GCC 无法翻转方向或重排
 * 仅 GCC 支持；clang 也接受同样的语法。
 */
#define ASM_GOTO_BNEZ(cond, lbl) \
    asm goto ("bnez %0, %l[" #lbl "]" \
              :: "r"((unsigned long)(cond)) \
              : : lbl)

#define ASM_GOTO_BEQ(va, vb, lbl) \
    asm goto ("beq %0, %1, %l[" #lbl "]" \
              :: "r"((unsigned long)(va)), "r"((unsigned long)(vb)) \
              : : lbl)
```

### cmd_entry 主体

```c
static void cmd_entry(void* parameter)
{
    rt_uint32_t hcqd_id;
    rt_base_t   level;

    while (1) {
        /* ---- Phase 1: lockless pre-check (unchanged) ---- */
        if (exception_get_flag() != EXCEPTION_NONE) { rt_thread_yield(); continue; }
        if (candidate == 0U) candidate = ib_get_candidate_bitmask();

        rt_uint32_t active   = candidate | pending_mask | sf_get_stop_bitmask();
        rt_uint32_t flush_bm = sf_get_flush_cxt_bitmap();
        if (active == 0U && flush_bm == 0U) continue;

        /* ---- Phase 2: work phase ---- */
        level = rt_hw_interrupt_disable();

        /* flush handling unchanged ... */

        hcqd_id = cmd_find_next_hcqd(active, rr_start % IB_MAX_HCQD_NUM_PER_CORE);
        RT_ASSERT(hcqd_id < IB_MAX_HCQD_NUM_PER_CORE);

        /* ===== Priority checks via asm goto: 硬锁 forward branch ===== */

        ASM_GOTO_BNEZ(sf_get_stop_bitmask() & BIT(hcqd_id), handle_stop);

        ASM_GOTO_BEQ(cmd_status[hcqd_id].cur_atomic_handle_status,
                     CMD_ATOMIC_HANDLE_WAIT, handle_atomic);

        ASM_GOTO_BEQ(cmd_status[hcqd_id].cur_event_wait_handle_status,
                     CMD_EVENT_WAIT_HANDLE_DEPENDENCY, handle_event);
        ASM_GOTO_BEQ(cmd_status[hcqd_id].cur_event_barrie_handle_status,
                     CMD_EVENT_BARRIE_HANDLE_WAIT, handle_event);

        ASM_GOTO_BEQ(cmd_status[hcqd_id].wait_host.cur_status,
                     CMD_WAIT_HOST_HANDLE_WAIT, handle_wait_host);
        ASM_GOTO_BEQ(cmd_status[hcqd_id].wait_host.cur_status,
                     CMD_WAIT_HOST_TRIG_DONE, handle_wait_host);

        ASM_GOTO_BEQ(cmd_status[hcqd_id].cur_block_mask_handle_status,
                     CMD_BLOCK_MASK_HANDLE_WAIT, handle_block_mask_wait);

        /* candidate dispatch 是 hot path：保留 plain C 让 GCC 自由优化 */
        if (candidate & (1U << hcqd_id))
            goto handle_candidate_dispatch;

        /* stale pending_mask cleanup */
        pending_mask &= ~(1U << hcqd_id);
        goto skip;

    handle_stop:
        sf_handle_stop(hcqd_id);
        rt_memset(&cmd_status[hcqd_id], 0, sizeof(cmd_hcqd_ctx_t));
        pending_mask &= ~(1U << hcqd_id);
        goto skip;

    handle_atomic:
        cmd_handle_atomic_packet(hcqd_id, &cmd_peek_pkt[hcqd_id]);
        goto skip;

    handle_event:
        cmd_handle_event_packet(hcqd_id, &cmd_peek_pkt[hcqd_id]);
        goto skip;

    handle_wait_host:
        cmd_handle_wait_host_packet(hcqd_id, &cmd_peek_pkt[hcqd_id]);
        goto skip;

    handle_block_mask_wait:
        if (cmd_check_block_mask_osd(hcqd_id,
            cmd_peek_pkt[hcqd_id].hdr.header.block_mask)) {
            cmd_status[hcqd_id].cur_block_mask_handle_status = CMD_BLOCK_MASK_HANDLE_DONE;
            pending_mask &= ~(1U << hcqd_id);
            cmd_handle_packet(hcqd_id, &cmd_peek_pkt[hcqd_id]);
        }
        goto skip;

    handle_candidate_dispatch:
        ib_peek_packet(hcqd_id, &cmd_peek_pkt[hcqd_id]);
        if (cmd_peek_pkt[hcqd_id].hdr.header.block_mask != 0x0) {
            if (!cmd_check_block_mask_osd(hcqd_id,
                cmd_peek_pkt[hcqd_id].hdr.header.block_mask)) {
                cmd_status[hcqd_id].cur_block_mask_handle_status = CMD_BLOCK_MASK_HANDLE_WAIT;
                pending_mask |= (1U << hcqd_id);
                goto skip;
            }
        }
        cmd_handle_packet(hcqd_id, &cmd_peek_pkt[hcqd_id]);

    skip:
        candidate &= ~(1U << hcqd_id);
        rr_start = (hcqd_id + 1U) % IB_MAX_HCQD_NUM_PER_CORE;
        rt_hw_interrupt_enable(level);
    }
}
```

## 设计要点与风险

### 1. 为什么 candidate dispatch 保留 plain C？

`candidate dispatch` 是 hot path（多数轮次会命中）。我们**希望** GCC 自由优化，包括：
- 把后续 packet 处理代码 inline 进去
- 重新整理 candidate 检查的局部寄存器

加 `asm goto` 会强制成 forward branch，反而限制 GCC 的优化空间。所以这一条保留原 `if (cond) goto;` 即可。

### 2. `asm goto` 不支持复合表达式短路

`if (a || b) goto X;` 在 baseline 下 GCC 会生成两条 `beq` 到同一 label。`asm goto` 必须手动展开成两条单独的 asm goto。代码会稍微变长（每个 || 多一行），但代码生成确定。

### 3. 跨编译器可移植性

- **GCC**：支持 `asm goto`（4.5+），完整 RISC-V 支持
- **Clang/LLVM**：支持 `asm goto`（10+，需要 `-fasm-goto-with-outputs` 在某些版本）
- **MSVC**：不支持
- **其他编译器**：通常不支持

CP firmware 仅用 GCC（Nuclei toolchain）所以这不是问题。但要在 header 加 `#ifdef __GNUC__` 防御性 fallback：

```c
#ifdef __GNUC__
  #define ASM_GOTO_BNEZ(cond, lbl) asm goto (...)
  #define ASM_GOTO_BEQ (va, vb, lbl) asm goto (...)
#else
  #define ASM_GOTO_BNEZ(cond, lbl) do { if (cond) goto lbl; } while (0)
  #define ASM_GOTO_BEQ(va, vb, lbl) do { if ((va) == (vb)) goto lbl; } while (0)
#endif
```

### 4. 调试时的反汇编可读性

asm goto 的源码-反汇编对应非常清晰：每条 `ASM_GOTO_BNEZ` 必然对应一条 `bnez`。所以 debug 时可以**反向**从反汇编单步到 C 源码很自然。

### 5. 编译器 sanity check

如果未来 GCC 版本对 `asm goto` 语法有微调（罕见但发生过），编译期就会报错，不会静默退化。这比 baseline 的"layout 静默漂移"更安全。

## CI 回归脚本

```bash
#!/bin/bash
# verify_cmd_entry_asm_goto.sh
set -euo pipefail
OBJDUMP=/data3/jianhong.luo/toolchain/nuclei_gcc/bin/riscv64-unknown-elf-objdump
ELF="${1:?usage: $0 <elf>}"

# 抓 cmd_entry 反汇编
DIS=$($OBJDUMP -d --disassemble=cmd_entry "$ELF")

# 断言 1：至少有 7 条 forward conditional branch（5 cold handlers + candidate + 可能的两次 ||）
FORWARD_COUNT=$(echo "$DIS" | awk '
    /<cmd_entry>:/ { in_fn=1; entry_pc = strtonum("0x"$1); next }
    /^$/ { in_fn=0 }
    in_fn && /bnez|beq[^z ]/ {
        src_pc = strtonum("0x"$1)
        # 目标地址在指令第二个空白后的 "<...+0xNNN>"
        match($0, /<cmd_entry\+0x([0-9a-f]+)>/, arr)
        if (arr[1] != "") {
            tgt_off = strtonum("0x" arr[1])
            if (entry_pc + tgt_off > src_pc) fwd++
        }
    }
    END { print fwd }
')

if [ "$FORWARD_COUNT" -lt 7 ]; then
    echo "FAIL: expected >= 7 forward branches, got $FORWARD_COUNT"
    exit 1
fi

# 断言 2：函数总指令数在合理范围
SIZE=$(echo "$DIS" | grep -cE '^\s+[0-9a-f]+:')
if (( SIZE > 600 )); then
    echo "FAIL: cmd_entry is $SIZE insns, suspicious bloat (asm goto should keep it ~470)"
    exit 1
fi

echo "OK: cmd_entry layout OK ($FORWARD_COUNT forward branches, $SIZE insns)"
```

## 历史教训

1. **第一版方案**推荐 `__builtin_expect` + `cold` 双重 hint。**实测后发现**：`__builtin_expect` 在 -O0 下不是 no-op，会强制布尔物化；`cold` 在 -O2 下让函数膨胀 +20% 但 hot path 没改善。
2. **第二版方案**回到"保留 baseline"。**正确但不够**：baseline 依赖 GCC 启发法，未来升级可能静默退化。
3. **第三版（当前）**：`asm goto` 是 GCC 提供的最强 layout 控制工具，成本最低、保证最强。

教训：layout 优化必须靠**实测反汇编**，而且要测**多个变体**才能找到真正的最优。Hint 看似"免费的保险"，实际可能是隐性成本；`asm goto` 看似"重武器"，实际是最干净的工具。

## 关联

- [[cmd_entry]] — entity 定义
- [[wiki/fw/cp-user/cmd_entry|CP User — cmd_entry 调度器]] — 当前实现
- [[CP 分支预取与 cmd_entry 布局优化]] — 历史经验汇总
- [[CP candidate peek 热路径优化]] — 同一热路径的另一项优化
