# aigc_sdk 代码检查报告

**检查日期：** 2026-03-13
**检查范围：** `/home/shuaishuai.zhu/fw/aigc_sdk/grace/`（排除 test 文件和注释代码）
**语言：** C（RISC-V 嵌入式固件，RT-Thread RTOS）

---

## 问题汇总

| 严重等级 | 数量 |
|---------|------|
| HIGH    | 5    |
| MEDIUM  | 9    |
| LOW     | 4    |
| **合计** | **18** |

---

## HIGH（高危）

### BUG-001：`ib_get_osd_count()` 缺少 return 语句（UB）

- **文件：** `grace/applications/cp/user/ib.c:313-348`
- **问题类型：** 缺少返回值（undefined behavior）

**代码：**
```c
rt_uint32_t ib_get_osd_count(rt_uint32_t hcqd_id, rt_uint32_t pkt_op, rt_uint32_t select)
{
    rt_uint32_t ret = 0;
    ...
    if (select == CMD_GET_ALL_OSD_COUNT)
    {
        ret = osd.value;
        // ← 此处没有 return ret; 语句！函数直接结束，返回未定义值
    }
    else
    {
        switch (pkt_op) { ... }
        return ret;   // ← return 仅在 else 分支内
    }
}   // ← if 分支执行后无 return，UB
```

**影响：** 当 `select == CMD_GET_ALL_OSD_COUNT` 时，调用方获取到垃圾值。`cmd.c` 中多次调用此函数检查 OSD 计数（控制 barrier 等）会产生错误的调度决策。

**修复：** 在 `if` 分支末尾添加 `return ret;`，或将 `return ret;` 移至 if/else 块外。

---

### BUG-002：`sf_stop_isr()` 使用未初始化变量

- **文件：** `grace/applications/cp/user/sf.c:216-233`
- **问题类型：** 未初始化变量

**代码：**
```c
void sf_stop_isr(void)
{
    rt_uint32_t hcqd_id;          // ← 声明但未赋值
    rt_uint32_t core_id = ib_get_core_id();

    /* get stop hcqd id */
    // TODO.
    // hcqd_id =                  // ← TODO 赋值被注释掉，从未实现

    sf_set_stop_flag(hcqd_id, SF_STOP);   // ← 使用未初始化值！
}
```

**影响：** ISR 中使用随机栈值作为 `hcqd_id`，可能对任意 HCQD 设置 Stop 标志，导致错误的命令处理流程停滞。是严重的逻辑错误。

**修复：** 实现 `hcqd_id` 的正确赋值（从寄存器读取 stop 中断来源）。

---

### BUG-003：`top_reg_dump_hcqd()` 缺少 return 语句（用户侧）

- **文件：** `grace/applications/cp/user/top_reg.c:116-149`
- **问题类型：** 缺少返回值（undefined behavior）

**代码：**
```c
rt_uint32_t top_reg_dump_hcqd(rt_uint32_t hcqdid)
{
    rt_uint32_t data;
    data = top_reg_read_hcqd(hcqdid, 0x0);
    LOG_D(...);
    ...
    // 函数体末尾无任何 return 语句
}   // ← 非 void 函数无 return
```

**说明：** master 侧同名函数正确返回 `return 0;`，user 侧版本遗漏。

**修复：** 函数末尾添加 `return 0;`。

---

### BUG-004：`bdma_stop_hcqd()` 缺少 return 语句

- **文件：** `grace/applications/cp/master/bdma.c:219-243`
- **问题类型：** 缺少返回值（undefined behavior）

**代码：**
```c
rt_uint32_t bdma_stop_hcqd(rt_uint32_t hcqd_id)
{
    bdma_stop_wait_info_list_t *stop_node;
    top_reg_stop_hcqd(hcqd_id);
    if (top_reg_get_hcqd_status(hcqd_id) == RT_EOK)
    {
        bdma_release_hcqd(hcqd_id);
    }
    else
    {
        ...
        bdma_insert_stop_wait_list(stop_node);
    }
    // ← 无 return 语句，函数返回类型为 rt_uint32_t
}
```

**影响：** 调用方无法获得有效的状态码，可能导致错误的 HCQD 管理判断。

**修复：** 函数末尾添加 `return RT_EOK;`（或适当的返回值）。

---

### BUG-005：`qdma_query_mcqd()` 缺少 return 语句

- **文件：** `grace/applications/cp/master/qdma.c:105-135`
- **问题类型：** 缺少返回值（undefined behavior）

**代码：**
```c
rt_uint32_t qdma_query_mcqd(rt_uint32_t proc_id)
{
    ...
    top_reg_config_query_dma(mcqd_addr, mcqd_mask);
    /* wait dma done */
    top_reg_wait_query_status();
    // ← 无 return 语句
}
```

**影响：** 返回未定义值。调用方 `qdma_query_task()` 使用此函数查询 MCQD，返回值错误将破坏任务调度。

**修复：** 函数末尾添加 `return RT_EOK;`。

---

## MEDIUM（中危）

### BUG-006：`exception_check_and_set_exc()` 竞态条件

- **文件：** `grace/applications/cp/user/exception.c:24-39`
- **问题类型：** 竞态条件

**代码：**
```c
void exception_check_and_set_exc(rt_uint32_t exc_type)
{
    if ((exception_flag.exception_cur_status & BIT(exc_type)) == 0)
    {
        rt_base_t level = 0;

        rt_mb_send(exception_mb, exc_type);       // ← 先发邮箱

        level = rt_hw_interrupt_disable();        // ← 后加保护
        exception_flag.except_cnt[exc_type]++;   // ← 计数+1 在发送后
        exception_flag.exception_cur_status |= BIT(exc_type);
        rt_hw_interrupt_enable(level);
    }
}
```

**影响：** `rt_mb_send` 发出后，若异常处理线程立即被调度，执行 `exception_clr_exc()`：
```c
if ((--exception_flag.except_cnt[exc_type]) == 0)  // 计数从0变成 0xFFFFFFFF（下溢）
```
导致计数下溢、`exception_cur_status` 状态位永不清零，后续命令处理线程持续放弃调度（`rt_thread_yield()`），系统假死。

**修复：** 将 `rt_mb_send` 移至 `rt_hw_interrupt_enable` 之后，确保先更新计数和状态标志。

---

### BUG-007：`top_reg_write_doorbell()` 缺少 return 语句

- **文件：** `grace/applications/cp/master/top_reg.c:266-272`
- **问题类型：** 缺少返回值

**代码：**
```c
rt_uint32_t top_reg_write_doorbell(rt_uint32_t doorbell_id, rt_uint32_t data)
{
    rt_uint32_t mmio_reg     = MEMORY_MAP_IO_BASE;
    rt_uint32_t doorbell_reg = CP_BASE + CP_DOORBELL_BASE;
    writel((rt_ubase_t)(mmio_reg + doorbell_reg + (doorbell_id * 0x4)), data);
    // ← 无 return
}
```

**修复：** 函数末尾添加 `return RT_EOK;`。

---

### BUG-008：`ipc_msg_handler_register()` 越界检查错误

- **文件：** `grace/applications/ipc/ipc_msg.c:129-138`
- **问题类型：** 数组越界（off-by-one）

**代码：**
```c
static event_process_fun event_handler[IPC_CMD_ID_MAX] = {0};  // 合法索引 0 ~ IPC_CMD_ID_MAX-1

rt_err_t ipc_msg_handler_register(rt_uint32_t cmd, event_process_fun handler)
{
    if ((event_handler[cmd] != RT_NULL) || (cmd > IPC_CMD_ID_MAX))  // ← 应为 >=
    {
        ...
    }
    event_handler[cmd] = handler;   // ← 当 cmd == IPC_CMD_ID_MAX 时越界写！
}
```

**影响：** 当 `cmd == IPC_CMD_ID_MAX` 时，越界写入 `event_handler` 数组，破坏内存（可能覆盖 `ipc_mb`、`ipc_msg_rcv_sem` 等静态变量）。

**修复：** 将判断改为 `cmd >= IPC_CMD_ID_MAX`。

---

### BUG-009：`ipc_msg_send()` 中 `rt_malloc` 返回值未检查即使用

- **文件：** `grace/applications/ipc/ipc_msg.c:419-421`
- **问题类型：** 空指针解引用风险

**代码：**
```c
buf  = rt_malloc(sizeof(ipc_msg_hdr_t) + data_size);   // ← 可能返回 NULL
rt_memcpy(buf, &message->head, sizeof(ipc_msg_hdr_t)); // ← 未检查即使用
rt_memcpy((rt_uint8_t *)(buf + sizeof(ipc_msg_hdr_t)), message->pdata, data_size);
```

**影响：** 内存不足时 `rt_malloc` 返回 `NULL`，`rt_memcpy` 对空指针写入导致系统崩溃。

**修复：** 添加 NULL 检查：
```c
buf = rt_malloc(sizeof(ipc_msg_hdr_t) + data_size);
if (buf == RT_NULL) {
    return RT_ENOMEM;
}
```

---

### BUG-010：`ipc_msg_trigger_int()` 未覆盖所有分支，使用未初始化变量

- **文件：** `grace/applications/ipc/ipc_msg.c:333-358`
- **问题类型：** 未初始化结构体字段被使用

**代码：**
```c
void ipc_msg_trigger_int(ipc_msg_t *message)
{
    hal_int_ctrl_cmd_t int_ctrl_cmd;   // ← 栈上未初始化

    if ((message->head.source == IPC_IMC_ID) && ...) {
        int_ctrl_cmd.cmd.irq_num = IPC_IMC_TO_HOST_IRQ;
        int_ctrl_cmd.cmd.dir = ...;
    }
    else if (...) { ... }
    else if (...) { ... }
    else if (...) { ... }
    // ← 没有 else 分支，如果所有条件都不匹配，int_ctrl_cmd 保持未初始化

    int_ctrl_cmd.operation = INT_CTRL_SET;
    hal_int_ctrl_cmd(&int_ctrl_cmd);   // ← 使用未初始化的 cmd.irq_num 和 cmd.dir
}
```

**修复：** 添加最后一个 `else` 分支处理错误并提前返回；或对 `int_ctrl_cmd` 进行零初始化。

---

### BUG-011：`ipc_msg_thread_rcv_sync()` 环形缓冲区长度检查错误

- **文件：** `grace/applications/ipc/ipc_msg.c:209`
- **问题类型：** 边界条件错误

**代码：**
```c
while (rt_ringbuffer_data_len(rb) > sizeof(ipc_msg_hdr_t))
```

**影响：** 当缓冲区中恰好只有 `sizeof(ipc_msg_hdr_t)` 字节时，`>` 条件不成立，导致已到达的消息头无法被处理（消息丢失）。

**修复：** 改为 `>= sizeof(ipc_msg_hdr_t)`。

---

### BUG-012：`cmd.c` 重复宏定义

- **文件：** `grace/applications/cp/user/cmd.c:552-553`
- **问题类型：** 重复宏定义（copy-paste 错误）

**代码：**
```c
#define wrptr_ADDR 0x500
#define wrptr_ADDR 0x500   // ← 完全重复的定义，第二行为多余复制
```

**影响：** 编译器警告，代码质量问题，可能掩盖原本应使用不同值的宏。

**修复：** 删除重复的宏定义。

---

### BUG-013：`drv_usart_init_cmd()` 复制粘贴错误

- **文件：** `grace/drivers/usart/drv_usart.c:87`
- **问题类型：** copy-paste 错误（配置值来源错误）

**代码：**
```c
reg->tx_datasize.tx_datasize_num = cfg->tx_datasize_num;   // 正确
reg->rx_datasize.rx_datasize_num = cfg->tx_datasize_num;   // ← 错了！应为 cfg->rx_datasize_num
```

**影响：** RX 数据位宽始终被配置为与 TX 相同的值，忽略了调用方传入的 RX 配置参数，导致 RX 方向可能工作在错误的数据位宽下。

**修复：** 将第二行改为 `cfg->rx_datasize_num`。

---

### BUG-014：`qdma_change_task_priority()` 系统 tick 溢出问题

- **文件：** `grace/applications/cp/master/qdma.c:79`
- **问题类型：** 整数溢出（tick 回绕）

**代码：**
```c
if (rt_tick_get() > task->task_info.wait_end_tick)
```

**影响：** 当 `rt_tick_get()` 从 `0xFFFFFFFF` 回绕为 `0` 后，所有含较大 `wait_end_tick` 的任务的优先级降级条件将永远不成立，任务无法正常降级。

**修复：** 使用减法比较处理溢出：
```c
if ((rt_int32_t)(rt_tick_get() - task->task_info.wait_end_tick) > 0)
```

---

## LOW（低危）

### BUG-015：`event_entry_read_dependency()` 中声明但未使用的变量

- **文件：** `grace/applications/cp/user/event_entry.c:151,164`
- **问题类型：** 死变量

**代码：**
```c
rt_uint32_t event_entry_read_dependency(rt_uint32_t max_dependency, void *read_pkt)
{
    rt_uint32_t counter = 0;           // counter 每次循环被覆盖，最终值未被使用
    event_entry_t *entry = RT_NULL;    // entry 从未被赋值或读取

    for (loop = 0; loop < max_dependency; loop++)
    {
        ...
        counter = event_entry_get_counter(entry_ptr->wait_entry);  // 覆盖，无副作用
    }
    return 0;  // 始终返回 0
}
```

**说明：** `entry` 和 `counter` 是废弃变量，应清理以减少混淆。

---

### BUG-016：`drv_ipcm_get_mailbox_status()` 声明但未使用的变量

- **文件：** `grace/drivers/ipcm/drv_ipcm.c:63`
- **问题类型：** 未使用变量

**代码：**
```c
static rt_err_t drv_ipcm_get_mailbox_status(rt_uint32_t reg, ipcm_ctrl_cmd_t *ipcm_cmd)
{
    rt_uint8_t i;   // ← 声明但整个函数中未使用
    ...
}
```

**修复：** 删除变量 `i` 的声明。

---

### BUG-017：`rt_hw_interrupt_register()` 传递冗余参数

- **文件：** `grace/board/lib/interrupt.c:33-38`
- **问题类型：** 冗余参数传递

**代码：**
```c
rt_int32_t rt_hw_interrupt_register(rt_uint32_t irq_n, rt_uint8_t shv, rt_uint32_t trig_mode,
                                     rt_uint8_t priority, void* handler)
{
    uint8_t lvl = priority;  // lvl 与 priority 值完全相同

    return eclic_register(irq_n, shv, trig_mode, lvl, priority, handler);
    //                                              ↑↑↑   ↑↑↑↑↑↑↑↑
    //                                           同一个值被传了两次
}
```

**说明：** 需确认 `eclic_register` 第4、5参数含义是否相同，若相同则其中一个为冗余。

---

### BUG-018：`nor_flash_read()` 中声明的 `flash_mode` 变量未使用

- **文件：** `grace/applications/imc/nor_flash/spi_flash.c:100`
- **问题类型：** 死变量

**代码：**
```c
uint32_t nor_flash_read(uint32_t addr, void *data, uint32_t len)
{
    ...
    uint32_t flash_mode = nro_flash_get_mode();  // ← 赋值

    if(nor_flash_mode == NOR_FLASH_MODE_XIP)     // ← 直接用全局变量，flash_mode 未被使用
    {
        ...
    }
```

**修复：** 删除 `flash_mode` 局部变量，或将 `nor_flash_mode` 改为使用 `flash_mode`（统一通过 getter 访问）。

---

## 附录：被检查文件列表

| 目录 | 文件 |
|------|------|
| `grace/applications/cp/user/` | cmd.c, cfg.c, event_entry.c, exception.c, ib.c, idma.c, init.c, sf.c, top_reg.c, ts.c |
| `grace/applications/cp/master/` | bdma.c, qdma.c, ipc_cmd.c, init.c, top_reg.c |
| `grace/applications/cp/cm/` | addr_transfer.c |
| `grace/applications/imc/d2d/` | d2d.c |
| `grace/applications/imc/ipc_cmd/` | ipc_cmd.c |
| `grace/applications/imc/nor_flash/` | spi_flash.c, spi_flash_sfud.c |
| `grace/applications/ipc/` | ipc_msg.c |
| `grace/applications/sys/` | main.c, syscalls.c |
| `grace/board/cp_user/src/` | board.c, ipc_op.c |
| `grace/board/cp_master/src/` | board.c, ipc_op.c |
| `grace/board/imc/src/` | board.c, ipc_op.c |
| `grace/board/lib/` | cache.c, console.c, eclic.c, interrupt.c, sys_timer.c, trap.c |
| `grace/drivers/ipcm/` | drv_ipcm.c |
| `grace/drivers/dms/` | drv_dms.c |
| `grace/drivers/usart/` | drv_usart.c |
| `grace/drivers/oisa/` | drv_oisa.c |
| `grace/drivers/smbus/` | drv_smbus.c |
| `grace/drivers/cp/` | drv_cp.c |
