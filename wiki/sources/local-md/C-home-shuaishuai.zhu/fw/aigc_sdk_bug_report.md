# aigc_sdk Bug 扫描报告

**扫描时间：** 2026-03-13
**扫描范围：** `aigc_sdk/grace/`（已排除 test 目录）
**扫描文件数：** ~65 个源文件
**发现 Bug 数：** 22 个（1 Critical · 9 High · 7 Medium · 5 Low）

---

## 汇总表

| Bug ID | 严重程度 | 文件（相对 aigc_sdk/） | 行号 | 类型 | 简述 |
|--------|----------|------------------------|------|------|------|
| BUG-001 | **Critical** | grace/applications/cp/user/sf.c | 218–229 | 未初始化变量 | `hcqd_id` 声明后未赋值便传入函数 |
| BUG-002 | **High** | grace/applications/cp/master/init.c | 75 | 宏定义错误 | `upper_32_bits` 对32-bit操作数右移32位 = UB |
| BUG-003 | **High** | grace/applications/cp/master/qdma.c | 105–135 | 缺少返回值 | `qdma_query_mcqd()` 声明返回 `rt_uint32_t` 但无 return |
| BUG-004 | **High** | grace/applications/cp/master/ipc_cmd.c | 234–248 | 未初始化变量 | `event_info` 仅在 if 块内赋值，else 路径直接使用 |
| BUG-005 | **High** | grace/applications/ipc/ipc_msg.c | 419–421 | 空指针解引用 | `rt_malloc` 返回 NULL 未检查直接 `memcpy` |
| BUG-006 | **High** | grace/applications/imc/nor_flash/spi_flash.c | 329–370 | 缺少返回值 | `nor_flash_init()` 声明返回 `uint32_t` 但无 return |
| BUG-007 | **High** | grace/applications/imc/nor_flash/spi_flash.c | 145–293 | 释放未初始化指针 | XIP 模式下 `buf` 未分配，末尾仍调用 `rt_free(buf)` |
| BUG-008 | **High** | grace/drivers/d2d/drv_d2d.c | 224, 229 | 空指针解引用 | `drv_misc_get_boot_info()` 可返回 NULL 未检查直接解引用 |
| BUG-009 | **High** | grace/board/lib/sys_timer.c | 353, 361 | 空指针解引用 | `drv_misc_get_boot_info(0)` 可返回 NULL 未检查直接解引用 |
| BUG-010 | **High** | grace/applications/cp/master/top_reg.c | 45–67 | 无限循环 | `top_reg_wait_query_status()` 轮询无超时条件 |
| BUG-011 | **Medium** | grace/applications/cp/user/ib.c | 48–52 | 无限循环 | 事件 IRQ 等待 `rd_irq_full` 无超时，可死锁 |
| BUG-012 | **Medium** | grace/applications/ipc/ipc_msg.c | 131 | 越界访问 | 边界检查 `> IPC_CMD_ID_MAX` 应为 `>= IPC_CMD_ID_MAX` |
| BUG-013 | **Medium** | grace/applications/cp/user/exception.c | 153 | 未检查返回值 | `rt_mb_create()` 返回值未检查，NULL mailbox 会宕机 |
| BUG-014 | **Medium** | grace/applications/cp/master/top_reg.c | 266–272 | 缺少返回值 | `top_reg_write_doorbell()` 声明 `rt_uint32_t` 但无 return |
| BUG-015 | **Medium** | grace/applications/cp/user/idma.c | 154–157 | Release下空指针 | `RT_ASSERT` 在非 Debug 版本禁用，malloc 失败后继续使用 NULL |
| BUG-016 | **Medium** | grace/applications/cp/user/exception.c | 26–38 | 竞态条件 | 检查和设置 exception bit 之间无原子保护 |
| BUG-017 | **Medium** | grace/applications/cp/master/ipc_cmd.c | 188 | 代码错误 | 双分号 `;;` 语句 |
| BUG-018 | **Low** | grace/applications/cp/user/ib.c | 92–97 | 死代码 | `INTERACTION_BUFFER_BASE` 为常量非零值，与 NULL 比较恒 false |
| BUG-019 | **Low** | grace/applications/cp/user/event_entry.c | 33–52 | 逻辑错误 | `event_entry_set_counter()` 非 keep 路径将 counter 强制写 0x1 |
| BUG-020 | **Low** | grace/applications/ipc/ipc_msg.c | 498 | 拼写错误 | 日志 "ipc_meaasge_init" 拼写错误 |
| BUG-021 | **Low** | grace/board/cp_user/src/board.c | 46–50 | 无效代码 | `board_system_init()` 调用 `drv_misc_get_boot_info()` 但丢弃结果 |
| BUG-022 | **Low** | grace/applications/cp/user/wait_host_cmd.h | 36–50 | 可移植性 | C bitfield 排列顺序实现未定义，硬件 bit 映射不可移植 |

---

## 详细描述

---

### BUG-001 ⚠️ Critical — `sf_stop_isr()` 中 `hcqd_id` 未初始化就使用

**文件：** `grace/applications/cp/user/sf.c`
**行号：** 218–229
**类型：** 未初始化变量（Uninitialized variable）

**问题代码：**
```c
// line 216
void sf_stop_isr(void)
{
    rt_uint32_t hcqd_id;          // line 218: 声明但从未赋值
    rt_uint32_t core_id = ib_get_core_id();

    /* get stop hcqd id */
    // TODO.
    // hcqd_id =                  // line 226: 赋值被注释为 TODO！

    /* update stop flag */
    sf_set_stop_flag(hcqd_id, SF_STOP);  // line 229: 使用未初始化值 → UB
```

**影响：** 该函数是中断服务程序（ISR）。传入 `sf_set_stop_flag()` 的 `hcqd_id` 是栈上随机值（可能是 0–255 任意值），会错误地设置任意 HCQD 的 stop flag，导致系统状态损坏。这是 **未定义行为（UB）**，在开启优化的编译器下可能引发更严重问题。

**修复建议：**
```c
void sf_stop_isr(void)
{
    rt_uint32_t core_id = ib_get_core_id();
    rt_uint32_t hcqd_id;

    // 从硬件寄存器读取触发 stop 的 HCQD ID
    hcqd_id = top_reg_get_stop_hcqd_id();   // 实现此接口
    if (hcqd_id >= SF_MAX_HCQD) {
        LOG_E(MODULE_CP_USER, "invalid hcqd_id %u in sf_stop_isr\n", hcqd_id);
        return;
    }
    sf_set_stop_flag(hcqd_id, SF_STOP);
    // clear interrupt
}
```

---

### BUG-002 🔴 High — `upper_32_bits` 宏对 32-bit 操作数移位 32 位（未定义行为）

**文件：** `grace/applications/cp/master/init.c`
**行号：** 75
**类型：** 宏定义错误 / 未定义行为

**问题代码：**
```c
#define upper_32_bits(n) ((rt_uint32_t)(((n) >> 16) >> 16))
```

**影响：** 当 `n` 是 32-bit 类型（如 `rt_uint32_t`），`(n) >> 16 >> 16` 等价于 `n >> 32`。C 标准规定对 32-bit 整数移位 ≥ 32 是**未定义行为**。实际结果是将 `n` 本身（而非高 32 位）截断为 0。`fill_mcqd()` 函数中 `mcqd.rb_base_hi` 和 `mcqd.wrptr_addr_hi` 均使用此宏，导致 MCQD 高地址字段恒为 0，DMA 访问错误地址。

**修复建议：**
```c
#define upper_32_bits(n) ((rt_uint32_t)((rt_uint64_t)(n) >> 32))
```

---

### BUG-003 🔴 High — `qdma_query_mcqd()` 缺少 return 语句

**文件：** `grace/applications/cp/master/qdma.c`
**行号：** 105–135
**类型：** 缺少返回值（Missing return statement）

**问题代码：**
```c
rt_uint32_t qdma_query_mcqd(rt_uint32_t proc_id)  // 声明返回 rt_uint32_t
{
    rt_uint64_t mcqd_addr;
    ...
    top_reg_config_query_dma(mcqd_addr, mcqd_mask);
    top_reg_wait_query_status();
    // 函数结束，无 return 语句！
}
```

**影响：** 调用方收到未定义的垃圾值。在 `qdma_query_task()` 的 while(1) 循环中频繁调用，可能导致上层逻辑判断错误。

**修复建议：** 在函数末尾添加 `return stream_id;`（或根据实际语义返回合适值）。

---

### BUG-004 🔴 High — `ipc_cmd_create_event()` 使用未初始化的 `event_info`

**文件：** `grace/applications/cp/master/ipc_cmd.c`
**行号：** 234–248
**类型：** 未初始化变量 / 空指针解引用

**问题代码：**
```c
rt_uint32_t ipc_cmd_create_event(ipc_msg_t *message)
{
    ipc_cmd_event_msg_t *event_info;   // 声明，未初始化

    if (message->pdata == RT_NULL)
    {
        event_info = (ipc_cmd_event_msg_t *) rt_malloc(...);
        RT_ASSERT(event_info);
        message->head.size = ...;
    }
    // 如果 message->pdata != RT_NULL，event_info 仍为未初始化值！
    event_info->event_id = top_reg_get_event_id();  // ← 访问随机指针 → 崩溃
    message->pdata = (rt_uint8_t *) event_info;
```

**影响：** 当 `message->pdata != NULL` 时，`event_info` 是垃圾指针，解引用会导致访问非法内存，程序崩溃。

**修复建议：**
```c
// 将 if 改为 else 路径也赋值 event_info
if (message->pdata == RT_NULL) {
    event_info = rt_malloc(sizeof(ipc_cmd_event_msg_t));
    RT_ASSERT(event_info);
    message->head.size = sizeof(ipc_cmd_event_msg_t) / sizeof(rt_uint32_t);
} else {
    event_info = (ipc_cmd_event_msg_t *) message->pdata;
}
event_info->event_id = top_reg_get_event_id();
```

---

### BUG-005 🔴 High — `ipc_msg_send()` 中 `rt_malloc` 失败后直接 `memcpy`

**文件：** `grace/applications/ipc/ipc_msg.c`
**行号：** 419–421
**类型：** 空指针解引用

**问题代码：**
```c
buf = rt_malloc(sizeof(ipc_msg_hdr_t) + data_size);
rt_memcpy(buf, &message->head, sizeof(ipc_msg_hdr_t));       // buf 可能为 NULL!
rt_memcpy((rt_uint8_t *)(buf + sizeof(ipc_msg_hdr_t)), message->pdata, data_size);
```

**影响：** 内存不足时 `rt_malloc` 返回 NULL，立即 `memcpy` 到 NULL 地址导致硬件异常（非法内存访问）。IPC 消息发送路径崩溃会破坏整个通信机制。

**修复建议：**
```c
buf = rt_malloc(sizeof(ipc_msg_hdr_t) + data_size);
if (buf == RT_NULL) {
    LOG_E(MODULE_IPC, "%s: buf alloc failed\n", __func__);
    return RT_ENOMEM;
}
rt_memcpy(buf, &message->head, sizeof(ipc_msg_hdr_t));
rt_memcpy(buf + sizeof(ipc_msg_hdr_t), message->pdata, data_size);
```

---

### BUG-006 🔴 High — `nor_flash_init()` 无 return 语句

**文件：** `grace/applications/imc/nor_flash/spi_flash.c`
**行号：** 329–370
**类型：** 缺少返回值

**问题代码：**
```c
uint32_t nor_flash_init(void)   // 声明返回 uint32_t
{
    ...
    hal_spi_config_xip(id, FALSE);
    nor_flash_mode = NOR_FLASH_MODE_NORMAL;
    nor_flash_current_id = id;
    }
    // 函数结束，无 return ret; ← 缺失
}
```

**影响：** 调用方（如初始化流程）读到垃圾返回值，无法知晓初始化是否成功，可能在 Flash 未就绪时继续后续操作。

**修复建议：** 在函数末尾添加 `return ret;`。

---

### BUG-007 🔴 High — XIP 模式下 `buf` 未分配但仍被 `rt_free`

**文件：** `grace/applications/imc/nor_flash/spi_flash.c`
**行号：** 145–293
**类型：** 释放未初始化指针（Free of uninitialized pointer）

**问题代码：**
```c
uint32_t nor_flash_write(uint32_t addr, void *data, uint32_t size)
{
    uint8_t *buf;                          // 声明，未赋值

    if(nor_flash_mode == NOR_FLASH_MODE_XIP) {
        //xip mode.
        //TODO.                            // XIP 路径：buf 从未 malloc
    }
    else {
        buf = rt_malloc(PAGE_SIZE);        // 仅在 SPI 模式分配
        ...
    }

    rt_free(buf);   // line 293: XIP 模式下 buf 是垃圾指针 → 内存破坏!
    return ret;
}
```

**影响：** 在 XIP 模式下 `rt_free(buf)` 释放未初始化的栈指针，导致堆管理数据结构损坏，可能引发后续内存分配崩溃。

**修复建议：** 将 `rt_free(buf)` 移入 `else` 分支，只在 SPI 模式下释放；或在 XIP 分支入口 `return`。

---

### BUG-008 🔴 High — `drv_d2d_port_map_init()` 中 `boot_info` 未检查 NULL

**文件：** `grace/drivers/d2d/drv_d2d.c`
**行号：** 224, 229
**类型：** 空指针解引用

**问题代码：**
```c
void drv_d2d_port_map_init(d2d_device_t *d2d)
{
    aigc_sec_boot_info_t* boot_info = drv_misc_get_boot_info(DRV_MISC_BOOT_INIT);
    ...
    rt_uint32_t die_id = boot_info->boot_para.strap_pin.die_id;  // line 229: boot_info 可能为 NULL!
```

**影响：** `drv_misc_get_boot_info()` 在 eFuse 读取超时等失败路径下返回 `RT_NULL`（见 drv_misc.c:145）。直接解引用导致硬件访问异常。

**修复建议：**
```c
aigc_sec_boot_info_t* boot_info = drv_misc_get_boot_info(DRV_MISC_BOOT_INIT);
if (boot_info == RT_NULL) {
    LOG_E(MODULE_D2D, "boot_info is NULL, skip port map init\n");
    return;
}
```

---

### BUG-009 🔴 High — `systimer_systick_init()` 中 `boot_info` 未检查 NULL

**文件：** `grace/board/lib/sys_timer.c`
**行号：** 353, 361
**类型：** 空指针解引用

**问题代码：**
```c
void systimer_systick_init(void)
{
    aigc_sec_boot_info_t* boot_info = drv_misc_get_boot_info(0); // 可返回 NULL
    sys_timer = (systimer_reg_t *)SYSTIMER_BASE;
    systimer_set_tick_cycle(boot_info->system_core_clock); // line 361: NULL 解引用!
```

**影响：** 系统时钟初始化是最早执行的关键路径。若 `boot_info` 为 NULL 导致启动阶段就崩溃，整个系统无法正常运行。

**修复建议：**
```c
if (boot_info == RT_NULL) {
    LOG_E(...);
    // 使用默认时钟频率或 assert
    systimer_set_tick_cycle(DEFAULT_CORE_CLOCK);
} else {
    systimer_set_tick_cycle(boot_info->system_core_clock);
}
```

---

### BUG-010 🔴 High — `top_reg_wait_query_status()` 无超时，可能永久阻塞

**文件：** `grace/applications/cp/master/top_reg.c`
**行号：** 45–67
**类型：** 无限循环（No timeout）

**问题代码：**
```c
void top_reg_wait_query_status()
{
    rt_uint32_t data;
    // TODO: need improve
    while ((top_reg_read_top(TOP_REG_QUERY_STATUS) & QUERY_STATUS_MASK) != QUERY_IDLE)
    {
        data = top_reg_read_top(TOP_REG_QUERY_STATUS);
        // 无 tick 计数，无超时退出 → 死等!
    };
}
```

**影响：** 在 `qdma_query_task()` 的 while(1) 主循环中被频繁调用。若硬件 Query DMA 状态卡住（异常、电源问题等），整个 CP Master 线程会永久阻塞，导致系统挂起。

**修复建议：**
```c
void top_reg_wait_query_status(void)
{
    rt_uint32_t tick = 0;
    while (((top_reg_read_top(TOP_REG_QUERY_STATUS) & QUERY_STATUS_MASK) != QUERY_IDLE)
           && (tick < QUERY_STATUS_TIMEOUT))
    {
        systimer_delay_us(1);
        tick++;
    }
    if (tick >= QUERY_STATUS_TIMEOUT) {
        LOG_E(MODULE_CP_MASTER, "query status timeout!\n");
    }
}
```

---

### BUG-011 🟡 Medium — 事件 IRQ 等待 `rd_irq_full` 无超时

**文件：** `grace/applications/cp/user/ib.c`
**行号：** 48–52
**类型：** 无限循环 / 潜在死锁

**问题代码：**
```c
if (is_event_irq)
{
    /* Event interrupts must wait until the FIFO has space, no timeout */
    while (ib->rd_irq_full != 0)
    {
        /* busy wait */        // 硬件死机时永不退出
    }
}
```

注意：非事件 IRQ 路径（else 分支）已有超时处理（`tick < IDMA_TIMEOUT`），但事件 IRQ 路径被注释明确标记为"no timeout"，这是有意的设计但存在死锁风险。

**影响：** 若 IRQ FIFO 满且主机侧无法消费（主机挂起或断连），CP User 核心将永久阻塞在中断处理中。

**修复建议：** 添加最大等待时间，超时后记录错误并跳过发送（或触发 watchdog 复位机制）：
```c
rt_uint32_t tick = 0;
while ((ib->rd_irq_full != 0) && (tick < EVENT_IRQ_TIMEOUT)) {
    tick++;
}
if (tick >= EVENT_IRQ_TIMEOUT) {
    LOG_E(MODULE_CP_USER, "event irq fifo full timeout, skip\n");
    return;
}
```

---

### BUG-012 🟡 Medium — `ipc_msg_handler_register()` 边界检查错误（越界写入）

**文件：** `grace/applications/ipc/ipc_msg.c`
**行号：** 131
**类型：** 越界访问（Off-by-one / Out-of-bounds write）

**问题代码：**
```c
static event_process_fun event_handler[IPC_CMD_ID_MAX] = {0};  // 合法下标: 0 ~ IPC_CMD_ID_MAX-1

rt_err_t ipc_msg_handler_register(rt_uint32_t cmd, event_process_fun handler)
{
    if ((event_handler[cmd] != RT_NULL) || (cmd > IPC_CMD_ID_MAX))  // ← 应为 >=
    {
        ...
    }
    event_handler[cmd] = handler;  // cmd == IPC_CMD_ID_MAX 时越界写入!
```

**影响：** 当 `cmd == IPC_CMD_ID_MAX` 时，`cmd > IPC_CMD_ID_MAX` 为 false，条件不拦截，`event_handler[IPC_CMD_ID_MAX]` 越界写入相邻内存，可能破坏后续变量或导致崩溃。

**修复建议：**
```c
if ((cmd >= IPC_CMD_ID_MAX) || (event_handler[cmd] != RT_NULL))
```

---

### BUG-013 🟡 Medium — `exception_mb` 创建失败未处理

**文件：** `grace/applications/cp/user/exception.c`
**行号：** 153（`exception_init()` 中）
**类型：** 未检查返回值

**问题代码：**
```c
exception_mb = rt_mb_create("mb_exp", 1024, RT_IPC_FLAG_FIFO);
// 未检查 exception_mb 是否为 NULL
```

**影响：** 若内存不足，`rt_mb_create` 返回 NULL。后续所有 `rt_mb_send(exception_mb, ...)` 和 `rt_mb_recv(exception_mb, ...)` 调用将解引用 NULL，导致系统崩溃。异常处理模块是系统稳定性的关键组件。

**修复建议：**
```c
exception_mb = rt_mb_create("mb_exp", 1024, RT_IPC_FLAG_FIFO);
if (exception_mb == RT_NULL) {
    LOG_E(MODULE_CP_USER, "exception mailbox create failed!\n");
    RT_ASSERT(0);  // 关键资源，失败等同于系统错误
}
```

---

### BUG-014 🟡 Medium — `top_reg_write_doorbell()` 声明有返回值但无 return

**文件：** `grace/applications/cp/master/top_reg.c`
**行号：** 266–272
**类型：** 缺少返回值

**问题代码：**
```c
rt_uint32_t top_reg_write_doorbell(rt_uint32_t doorbell_id, rt_uint32_t data)
{
    rt_uint32_t mmio_reg     = MEMORY_MAP_IO_BASE;
    rt_uint32_t doorbell_reg = CP_BASE + CP_DOORBELL_BASE;
    writel((rt_ubase_t)(mmio_reg + doorbell_reg + (doorbell_id * 0x4)), data);
    // 无 return 语句
}
```

**修复建议：** 修改返回类型为 `void`，或添加 `return RT_EOK;`。

---

### BUG-015 🟡 Medium — Release 版本 `RT_ASSERT` 失效，malloc NULL 后继续使用

**文件：** `grace/applications/cp/user/idma.c`
**行号：** 154–157
**类型：** Release 版本空指针解引用

**问题代码：**
```c
idma_node = (idma_node_t *)rt_malloc(sizeof(idma_node_t));
RT_ASSERT(idma_node != RT_NULL);    // Release 版本此行为空操作!
idma_node->idma.src_index = hcqd_id;  // malloc 失败时 NULL 解引用
```

**影响：** `RT_ASSERT` 在定义了 `NDEBUG` 的 Release 构建中被编译掉。生产环境内存紧张时，`rt_malloc` 返回 NULL，下一行立即崩溃。

**修复建议：**
```c
idma_node = (idma_node_t *)rt_malloc(sizeof(idma_node_t));
if (idma_node == RT_NULL) {
    LOG_E(MODULE_CP_USER, "idma_node alloc fail\n");
    return;  // 或返回错误码
}
```

---

### BUG-016 🟡 Medium — `exception_check_and_set_exc()` 竞态条件

**文件：** `grace/applications/cp/user/exception.c`
**行号：** 26–38
**类型：** 竞态条件（Race condition）

**问题代码：**
```c
void exception_check_and_set_exc(rt_uint32_t exc_type)
{
    if ((exception_flag.exception_cur_status & BIT(exc_type)) == 0) // ← 检查
    {
        rt_mb_send(exception_mb, exc_type);     // ← 使用（检查和使用不原子）
    }

    level = rt_hw_interrupt_disable();          // ← 保护来得太晚
    exception_flag.except_cnt++;
    exception_flag.exception_cur_status |= BIT(exc_type);
    rt_hw_interrupt_enable(level);
}
```

**影响：** 若两个上下文同时调用且 `exception_cur_status` 的 bit 还未被设置，两者都会通过检查并各发一次 `rt_mb_send`，导致同一个 exception 被处理两次。

**修复建议：** 将整个检查-设置操作包在中断保护中，且在保护锁内调用 `rt_mb_send`（或改用非阻塞版本）。

---

### BUG-017 🟡 Medium — `ipc_cmd_destory_stream()` 双分号语句

**文件：** `grace/applications/cp/master/ipc_cmd.c`
**行号：** 188
**类型：** 代码质量问题

**问题代码：**
```c
proc_list.proc_table[proc_id].mcqd_mask &= ~BIT(stream_id);;   // ← 双分号
```

此处虽然双分号不影响功能，但表明代码审查不足，需要统一清理。

---

### BUG-018 🔵 Low — `ib_get_addr()` 与 NULL 比较恒为 false（死代码）

**文件：** `grace/applications/cp/user/ib.c`
**行号：** 92–97
**类型：** 死代码（Dead code）

**问题代码：**
```c
ib_info_t* ib_get_addr(void)
{
    ib_info_t* ib = (ib_info_t*) INTERACTION_BUFFER_BASE;

    if (ib == RT_NULL)      // INTERACTION_BUFFER_BASE 是非零硬件常量，永远不等于 NULL
    {
        LOG_E(...);
        RT_ASSERT(0);
    }
    return ib;
}
```

**影响：** 死代码，该检查永远不会触发，给维护者造成误解，认为有 NULL 保护。

**修复建议：** 改为在编译期用 `static_assert` 验证基地址非零，或删除该检查。

---

### BUG-019 🔵 Low — `event_entry_set_counter()` 非 keep 路径强制写 counter=1

**文件：** `grace/applications/cp/user/event_entry.c`
**行号：** 36–52
**类型：** 逻辑错误（可能）

**问题代码：**
```c
if (keep == EVENT_ENTRY_KEEP_KNOW_DEPENDENCY)
{
    entry->counter = counter;    // 使用入参 counter
}
else
{
    entry->counter = 0x1;        // 忽略入参 counter，强制写 1 → 是否为设计意图?
}
```

**影响：** 调用方传入的 `counter` 参数在非 `KNOW_DEPENDENCY` 路径下被静默忽略，可能导致依赖计数不正确。

**修复建议：** 如果硬件协议要求此路径下 counter 必须为 1，需在代码注释中明确说明并触发断言验证（`RT_ASSERT(counter == 1)`）；否则应修改为 `entry->counter = counter`。

---

### BUG-020 🔵 Low — `ipc_msg_init()` 日志字符串拼写错误

**文件：** `grace/applications/ipc/ipc_msg.c`
**行号：** 498
**类型：** 拼写错误

**问题代码：**
```c
LOG_I(MODULE_IPC, "ipc_meaasge_init\n");   // ← "meaasge" 拼写错误
```

**修复建议：** 改为 `"ipc_message_init\n"`。

---

### BUG-021 🔵 Low — `board_system_init()` 调用 `drv_misc_get_boot_info()` 后丢弃结果

**文件：** `grace/board/cp_user/src/board.c`
**行号：** 46–50
**类型：** 无效代码（Dead initialization）

**问题代码：**
```c
void board_system_init(void)
{
    aigc_sec_boot_info_t* boot_info = drv_misc_get_boot_info(DRV_MISC_BOOT_INIT);
    return;  // boot_info 变量从未使用
}
```

**影响：** 每次启动都触发 `DRV_MISC_BOOT_INIT` 初始化流程（包含 eFuse 读取等操作），但结果被丢弃，是不必要的重复工作。

**修复建议：** 删除该函数体内的无用代码，或使用 `boot_info` 做相应的系统配置。

---

### BUG-022 🔵 Low — `wait_host_cmd.h` 位域顺序实现未定义（硬件映射不可移植）

**文件：** `grace/applications/cp/user/wait_host_cmd.h`
**行号：** 36–50
**类型：** 可移植性问题（Implementation-defined bitfield ordering）

**问题代码：**
```c
typedef struct wait_host_cmd_body_wd1 {
    rt_uint32_t barrier  : 1;   /* 预期 bit 0 */
    rt_uint32_t reserved : 31;
} wait_host_cmd_body_wd1_t;
```

**影响：** C 标准规定位域在存储单元中的分配顺序是实现定义的。不同编译器或大端序构建下 `barrier` 可能映射到 bit 31 而非 bit 0，硬件命令协议完全失效。

**修复建议：** 使用宏（mask + shift）替代位域操作硬件字段，并添加 `static_assert` 在编译期验证。

---

## 修复优先级建议

| 优先级 | Bug ID | 建议行动 |
|--------|--------|----------|
| P0（立即） | BUG-001 | 实现 `hcqd_id` 赋值逻辑，是 ISR 级别 Critical |
| P0（立即） | BUG-004 | 修复 `event_info` 未初始化路径，可能在 IPC 消息处理时崩溃 |
| P0（立即） | BUG-005 | `rt_malloc` NULL 检查，IPC 通信关键路径 |
| P1（本迭代） | BUG-002 | 修复 `upper_32_bits` 宏，影响所有 MCQD DMA 地址正确性 |
| P1（本迭代） | BUG-008/009 | 添加 `boot_info` NULL 检查，影响 D2D 和 Timer 初始化 |
| P1（本迭代） | BUG-010 | 为 query status 添加超时，防止 CP Master 主循环挂起 |
| P2（下迭代） | BUG-003/006/014 | 补全缺失的 return 语句 |
| P2（下迭代） | BUG-007 | 修复 XIP 模式下的 free 未分配指针 |
| P2（下迭代） | BUG-012/013/015/016 | 完善边界检查和错误处理 |
| P3（技术债） | BUG-011 | 为事件 IRQ 等待添加超时逻辑 |
| P3（技术债） | BUG-017~022 | 代码清理：死代码、拼写、注释规范 |

---

*报告生成于 2026-03-13，基于对 aigc_sdk/grace/ 下约 65 个源文件的人工代码分析。*
