---
type: learning-guide
title: "CP USART 移到 IMC 统一初始化：代码修改和原因"
created: 2026-06-04
updated: 2026-06-04
tags:
  - fw
  - cli
  - usart
  - imc
  - cp-master
  - cp-user
  - rt-thread
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:/home/shuaishuai.zhu/fw branch zss/MoveUsart HEAD 944c37c"
  - "aigc_sdk/grace/board/imc/src/board.c"
  - "aigc_sdk/grace/board/cp_master/src/board.c"
  - "aigc_sdk/grace/board/cp_user/src/board.c"
  - "aigc_sdk/grace/drivers/usart/drv_usart.c"
  - "aigc_sdk/grace/include/hal/hal_drv_usart.h"
  - "aigc_sdk/grace/board/*/src/per_map.h"
  - "aigc_sdk/grace/hal/usart/hal_usart.c"
  - "rtthread/src/kservice.c"
  - "rtthread/components/drivers/core/device.c"
  - "test/framework/shell/agc_shell.c"
related:
  - "./grace-usart-console-cli.md"
  - "./agc_shell-cli-path.md"
  - "../imc/startup-to-main.md"
---

# CP USART 移到 IMC 统一初始化：代码修改和原因

> Source snapshot: 2026-06-04 从 `192.168.80.116:/home/shuaishuai.zhu/fw` 当前源码读取，分支 `zss/MoveUsart`，HEAD `944c37c`。本页基于当前未提交 diff：`cp_master/src/board.c`、`cp_user/src/board.c`、`imc/src/board.c`、`drv_usart.c`、`hal_drv_usart.h`。
> Scope: 本页解释当前代码已经做出的 USART 移植修改、每个函数职责、为什么要拆分初始化路径，以及 console/agc_shell 如何继续工作。不证明板上实际波形或硬件 bring-up 结果。

## 1. 一句话理解

这次修改不是让 CP 不再使用 USART，而是把 **USART 硬件寄存器初始化** 统一放到 IMC，由 IMC 配好 `USART1..USART5`；CP Master/User 只在自己的 RT-Thread 里注册 `usartN` device、设置 console、绑定 agc_shell。

要把两个概念分开：

| 层级 | 现在由谁负责 | 作用 | 典型函数 |
|---|---|---|---|
| 硬件寄存器初始化 | IMC | baud、clock、reset、FIFO、RX interrupt enable | `drv_usart_hw_init_only()` / `drv_usart_hw_config()` |
| RT-Thread device 注册 | CP 自己 | 创建 `usartN` device，绑定 read/write/control 和 IRQ handler | `drv_usart_register()` |
| 兼容完整初始化 | 仍保留 | 用于 IMC 自己的 `USART0` 或旧调用路径 | `drv_usart_init()` |

![CP USART 移植总览](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-old-new-overview.png)

> 图解源文件：[`cp-usart-old-new-overview.svg`](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-old-new-overview.svg)。图中左侧是原来的 CP 完整初始化，右侧是现在的 IMC 硬件初始化 + CP 软件注册。

## 2. 当前代码具体改了什么

当前 diff 范围是 5 个文件：

| 文件 | 修改 | 目的 |
|---|---|---|
| `aigc_sdk/grace/board/cp_master/src/board.c` | `drv_usart_init()` 改成 `drv_usart_register()` | CP Master 不再做 USART 硬件初始化，只注册本地 RT-Thread device。 |
| `aigc_sdk/grace/board/cp_user/src/board.c` | `drv_usart_init()` 改成 `drv_usart_register()` | CP User 每个 core 只注册自己对应的 `usart2..5` device。 |
| `aigc_sdk/grace/board/imc/src/board.c` | 新增 `board_cp_usart_hw_init()` 并在 IMC premain 调用 | IMC 在启动阶段统一初始化 CP 使用的 USART1..5 硬件。 |
| `aigc_sdk/grace/drivers/usart/drv_usart.c` | 拆分 `drv_usart_hw_config()`、`drv_usart_hw_init_only()`、`drv_usart_register()`、`drv_usart_init()` | 把硬件寄存器配置和 RT-Thread device 注册解耦。 |
| `aigc_sdk/grace/include/hal/hal_drv_usart.h` | 新增 `drv_usart_hw_init_only()`、`drv_usart_register()` 声明 | 让 board 层能直接调用拆分后的接口。 |

CP Master 当前代码变成：

```c
/* register USART device; hardware is initialized by IMC */
drv_usart_register((void*) USART_DEVICE_ADDR);
```

CP User 当前代码同样变成：

```c
/* register USART device; hardware is initialized by IMC */
drv_usart_register((void*) USART_DEVICE_ADDR);
```

IMC 当前新增了 CP USART 硬件初始化 helper：

```c
static void board_cp_usart_hw_init(void)
{
    drv_usart_hw_init_only((void *)USART1_BASE);
    drv_usart_hw_init_only((void *)USART2_BASE);
    drv_usart_hw_init_only((void *)USART3_BASE);
    drv_usart_hw_init_only((void *)USART4_BASE);
    drv_usart_hw_init_only((void *)USART5_BASE);
}
```

IMC 自己仍然用完整初始化：

```c
drv_usart_init((void*)USART_DEVICE_ADDR);  /* USART0 */
board_cp_usart_hw_init();                  /* USART1..5 */
```

## 3. 为什么要这样改

核心原因是 **硬件配置 owner 和软件使用 owner 不一样**。

从当前代码看，IMC 的 `USART_DEVICE_ADDR` 是 `USART0_BASE`，CP Master 的 `USART_DEVICE_ADDR` 是 `USART1_BASE + MEMORY_MAP_IO_BASE`，CP User 是 `USART2_BASE + MEMORY_MAP_IO_BASE + USART_STRIDE * get_core_id()`。这说明：

- IMC 看到的是全芯片真实物理 base，例如 `USART1_BASE = 0x02003000`。
- CP 看到的是自己的 IO window 地址，需要加 `MEMORY_MAP_IO_BASE = 0x50000000`。
- driver 里的 `drv_usart_get_id()` 会用 `USART_ADDR_MASK` 屏蔽 CP IO window 高位，这样 `0x52003000` 和 `0x02003000` 都能映射到同一个 `USART_ID_1`。

因此，硬件初始化应该用 IMC 物理地址做；CP device 注册应该保存 CP 自己可访问的地址做后续 read/write/control。把两件事混在 `drv_usart_init()` 里，就无法表达这个边界。

更具体地说：

1. `drv_usart_hw_config()` 会写硬件寄存器，包含 reset、baud、FIFO 和 RX interrupt enable。这类操作更像平台级初始化，适合由 IMC 统一做。
2. CP 仍然必须调用 `drv_usart_register()`，因为 RT-Thread 的 `rt_console_set_device()`、`rt_device_find()`、`hal_usart_init()`、`agc_shell_set_device()` 都依赖本地 `usartN` device 对象。
3. 如果 CP 完全不注册 device，`rt_kprintf()` 没有 console device，agc_shell 也无法通过 console device 设置 RX callback。
4. 如果 CP 继续调用旧的 `drv_usart_init()`，就会重复执行硬件配置，与 IMC 统一初始化的设计冲突。

## 4. 地址映射：为什么 IMC 用 `USART1_BASE`，CP 用 `USART_DEVICE_ADDR`

硬件 base 来自 `board_cfg.h`：

| USART | base | 当前用途 |
|---|---:|---|
| USART0 | `0x02002000` | IMC console |
| USART1 | `0x02003000` | CP Master console |
| USART2 | `0x02026000` | CP User core0 console |
| USART3 | `0x02027000` | CP User core1 console |
| USART4 | `0x02028000` | CP User core2 console |
| USART5 | `0x02029000` | CP User core3 console |

各 firmware 的 `per_map.h` 选择不同地址：

| firmware | `USART_DEVICE_ADDR` | 解释 |
|---|---|---|
| IMC | `USART0_BASE` | IMC 直接访问物理地址。 |
| CP Master | `USART1_BASE + MEMORY_MAP_IO_BASE` | CP 通过 IO window 访问 USART1。 |
| CP User | `USART2_BASE + MEMORY_MAP_IO_BASE + USART_STRIDE * get_core_id()` | 4 个 CP User core 分别映射到 USART2..5。 |

![USART 地址映射](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-address-map.png)

> 图解源文件：[`cp-usart-address-map.svg`](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-address-map.svg)。这张图强调：IMC 初始化硬件用物理 base；CP 注册 device 用 CP IO window 地址；`drv_usart_get_id()` 通过 mask 兼容两种地址。

关键函数 `drv_usart_get_id()` 的作用是把地址转换成 USART ID：

```c
rt_ubase_t base = ((rt_ubase_t) reg) & USART_ADDR_MASK;

switch (base)
{
case USART0_BASE: *id = USART_ID_0; break;
case USART1_BASE: *id = USART_ID_1; break;
case USART2_BASE: *id = USART_ID_2; break;
case USART3_BASE: *id = USART_ID_3; break;
case USART4_BASE: *id = USART_ID_4; break;
case USART5_BASE: *id = USART_ID_5; break;
default: return RT_ENOTSUPPORT;
}
```

这里的 mask 很关键。没有它，CP 传入 `USART1_BASE + 0x50000000` 后，switch 就匹配不到 `USART1_BASE`，`usart1` device name、IRQ id、device 数组下标都会失败。

## 5. driver 函数拆分后，每个函数做什么

![driver API 拆分](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-driver-split.png)

> 图解源文件：[`cp-usart-driver-split.svg`](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-driver-split.svg)。`drv_usart_init()` 保留旧的完整语义；新代码分别调用 `drv_usart_hw_init_only()` 或 `drv_usart_register()`。

### `drv_usart_hw_config(id, reg)`

这是新拆出来的私有底层硬件配置函数。它只操作 USART 寄存器，不注册 RT-Thread device。

它当前做这些事：

- 从 `drv_misc_get_boot_info(0)` 读取 boot 信息。
- 根据 strap pin 选择 baud rate：`uart_baud ? 921600 : 115200`。
- 使用 `boot_info->system_core_clock` 设置 USART clock 参数。
- 通过 `drv_misc_reset(IMC_SYS_BASE + DRV_MISC_SUBM_RST_CTRL0, BIT(DRV_MISC_USART0_BIT_RST + id), DRV_MISC_RESET)` 做对应 USART reset。
- 调用 `drv_usart_init_cmd(reg, &usart_init_cfg)` 写 TX/RX enable、bit length、parity、baud div 等寄存器。
- 调用 `drv_usart_clr_rxfifo(reg)` 清 RX FIFO。
- 设置 RX watermark，并打开 `USART_INT_EN_RXIE`。

这就是所谓“硬件初始化”。它需要真实的寄存器地址，所以 IMC 调 CP USART 硬件初始化时传的是 `USART1_BASE..USART5_BASE`。

### `drv_usart_hw_init_only(reg)`

这是公开给 board 层用的新接口。它的职责很窄：

1. 调用 `drv_usart_get_id(reg, &id)`，把 reg 转换成 USART ID。
2. 调用 `drv_usart_hw_config(id, (drv_usart_reg_t *)reg)`。
3. 不调用 `rt_device_register()`，不创建 mutex，不注册 IRQ handler。

IMC 的 `board_cp_usart_hw_init()` 正是用这个函数初始化 `USART1..5`。这样 IMC 可以只碰硬件，不在 IMC 的 RT-Thread 里注册 CP 的 `usart1..5` device。

### `drv_usart_register(reg)`

这是 CP Master/User 现在调用的新接口。它只做软件注册，不写 USART 硬件配置寄存器。

它当前做这些事：

- `usart_dev.reg = reg`：设置 legacy `usart_put_char()` / `usart_get_char()` 使用的寄存器指针。
- `drv_usart_get_id(reg, &id)`：解析出 `USART_ID_x`。
- `drv_usart_dev_init(id, reg)`：填充 `usart_device[id].dev` 的 `read/write/control/user_data/reg`。
- 拼出 mutex name：`usart_lock{id}`。
- 拼出 device name：`usart{id}`。
- `rt_mutex_init()`：初始化 device lock。
- `rt_device_register()`：把 `usart{id}` 注册进 RT-Thread device system。
- `rt_hw_interrupt_register(USART0_IRQn + id, ..., usart_irq_entry[id])`：把本地 IRQ 入口与 USART id 绑定。

注意：这个函数仍然需要 CP 自己调用。IMC 不能替 CP 注册 CP RT-Thread 内部的 device 对象，因为每个 CPU/firmware 有自己的 RT-Thread object namespace、console 指针和 shell 线程。

### `drv_usart_init(reg)`

`drv_usart_init()` 现在变成兼容旧语义的组合函数：

```c
rt_int32_t drv_usart_init(void *reg)
{
    rt_err_t ret = drv_usart_hw_init_only(reg);
    if (ret != RT_EOK)
    {
        return ret;
    }

    return drv_usart_register(reg);
}
```

IMC 自己的 `USART0` 仍然使用 `drv_usart_init(USART_DEVICE_ADDR)`，因为 IMC 对自己的 console 需要“硬件初始化 + RT-Thread device 注册”都在本 firmware 内完成。

### `drv_usart_dev_init(id, reg)`

这个函数没有在这次 diff 中改变，但它是 `drv_usart_register()` 能工作的基础。它填充 `usart_device[id]`：

- `dev.type = RT_Device_Class_Char`。
- `dev.read = drv_usart_read`。
- `dev.write = drv_usart_write`。
- `dev.control = drv_usart_ctrl`。
- `reg = reg`。
- `dev.user_data = &usart_device[id]`。

也就是说，RT-Thread 上层看到的是一个字符设备；真正读写时才通过 `user_data` 回到 USART register 和 driver 函数。

## 6. board 层启动流程如何串起来

![启动时序](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-boot-sequence.png)

> 图解源文件：[`cp-usart-boot-sequence.svg`](../../../_attachments/fw/cli/cp-usart-imc-unified-init/cp-usart-boot-sequence.svg)。这张图把 IMC premain、CP premain、console 设置和 shell 绑定分开。

### IMC 侧

`aigc_sdk/grace/board/imc/src/board.c` 中，`board_system_premain_init()` 当前顺序是：

1. `board_system_init()`：设置 IMC top cfg、backdoor/OISA/D2D 相关配置。
2. `cache_fence()`。
3. `eclic_init()`。
4. `drv_subsys_init()`。
5. `hal_subsys_init()`。
6. `drv_usart_init((void*)USART_DEVICE_ADDR)`：完整初始化 IMC 自己的 USART0。
7. `board_cp_usart_hw_init()`：初始化 CP Master/User 使用的 USART1..5 硬件。
8. `board_system_info()`：打印 IMC banner。

这里把 `board_cp_usart_hw_init()` 放在 IMC 自己 USART0 初始化之后，语义上很直接：IMC 自己先有 console，然后再初始化 CP 的 USART 硬件资源。

### CP Master/User 侧

CP Master/User 的 `board_system_premain_init()` 当前顺序是：

1. `board_system_init()`。
2. `cache_fence()`。
3. `eclic_init()`。
4. `drv_usart_register((void*)USART_DEVICE_ADDR)`。
5. `board_system_info()`。
6. `trap_init()`。

CP 侧此时只创建 `usartN` device 和 IRQ handler，不再 reset/config USART。这样 CP 的后续 console、HAL、agc_shell 都能找到本地 device，同时不会重复执行硬件初始化。

### console 和 agc_shell 为什么还能工作

在 `rt_hw_board_init()` 中，CP/IMC 都会根据 `USART_DEVICE_ADDR` 算出 id，然后：

```c
drv_usart_get_id((void*)USART_DEVICE_ADDR, &id);
rt_sprintf(dev_name, "%s%u", USART_DEVICE_NAME, id);
rt_console_set_device(dev_name);
```

`rt_console_set_device()` 会 `rt_device_find(dev_name)`，然后 `rt_device_open()`，最后把 `_console_device` 指向这个 `usartN` device。之后 `rt_kprintf()` 就会走这个 device 的 write 路径。

agc_shell 的输入绑定也依赖同一个 console device：

```c
console = rt_console_get_device();
dev = rt_device_find(console->parent.name);
rt_device_open(dev, RT_DEVICE_OFLAG_RDWR | RT_DEVICE_FLAG_INT_RX | RT_DEVICE_FLAG_STREAM);
rt_device_set_rx_indicate(dev, agc_shell_rx_ind);
```

所以这次修改不能把 CP 的 `drv_usart_register()` 也删掉。硬件由 IMC 初始化，并不等于 CP 的 RT-Thread 已经存在 `usartN` device。

## 7. 函数职责速查表

| 函数 | 所在文件 | 当前职责 | 为什么需要 |
|---|---|---|---|
| `board_cp_usart_hw_init()` | `board/imc/src/board.c` | IMC 统一调用 `drv_usart_hw_init_only(USART1..5)`。 | 把 CP USART 的硬件配置集中到 IMC。 |
| `board_system_premain_init()` IMC | `board/imc/src/board.c` | 初始化 IMC 平台、IMC USART0、CP USART1..5。 | IMC 是硬件初始化 owner。 |
| `board_system_premain_init()` CP | `board/cp_*/src/board.c` | CP 只调用 `drv_usart_register(USART_DEVICE_ADDR)`。 | 保留本地 device/IRQ/console 对象，避免重复硬件 init。 |
| `drv_usart_hw_config()` | `drivers/usart/drv_usart.c` | 私有硬件寄存器配置函数。 | 让 hw init 可复用，并避免依赖全局 `usart_dev.reg`。 |
| `drv_usart_hw_init_only()` | `drivers/usart/drv_usart.c` | 公开的“只初始化硬件”接口。 | IMC 初始化 CP USART 硬件时需要这个粒度。 |
| `drv_usart_register()` | `drivers/usart/drv_usart.c` | 公开的“只注册 RT device/IRQ”接口。 | CP 使用 USART 仍需要本地 `usartN` device。 |
| `drv_usart_init()` | `drivers/usart/drv_usart.c` | 兼容完整 init：先硬件、再注册。 | IMC 自己 USART0 仍适合用旧语义。 |
| `drv_usart_get_id()` | `drivers/usart/drv_usart.c` | 地址转 USART ID，mask 掉 CP IO window 高位。 | 同时兼容 IMC 物理地址和 CP window 地址。 |
| `hal_usart_init()` | `hal/usart/hal_usart.c` | 根据 `usartN` 名字查找 RT device。 | HAL 层后续 control/read/write 要依赖 device。 |
| `rt_console_set_device()` | `rtthread/src/kservice.c` | 把 `_console_device` 指向 `usartN`。 | `rt_kprintf()` 输出路径需要 console device。 |
| `agc_shell_set_device()` | `test/framework/shell/agc_shell.c` | 从 console 获取 device，打开 INT_RX 并设置 RX callback。 | CLI 输入中断要进入 shell ringbuffer。 |

## 8. 这次修改的关键边界

### 边界 1：硬件初始化不等于 device 注册

硬件初始化是写寄存器；device 注册是创建 RT-Thread 软件对象。IMC 做了前者，CP 仍必须做后者。

### 边界 2：IMC 地址和 CP 地址不能混用

IMC 初始化 CP USART 硬件时使用 `USART1_BASE..USART5_BASE`。CP 注册本地 device 时使用自己的 `USART_DEVICE_ADDR`，也就是带 `MEMORY_MAP_IO_BASE` 的地址。这样 device 的 `read/write/control` 才能从 CP 自己的地址空间访问 USART。

### 边界 3：`drv_usart_init()` 不能再被 CP 调用

现在 `drv_usart_init()` 仍然会执行 `hw_init_only + register`。如果 CP 继续调它，就会重新做硬件配置，破坏“IMC 统一初始化”的分层。

### 边界 4：IRQ handler 注册仍在 CP 本地

`drv_usart_register()` 里仍然调用 `rt_hw_interrupt_register(USART0_IRQn + id, ..., usart_irq_entry[id])`。这是对的，因为 CP 的 agc_shell 输入需要在 CP 本地 RT-Thread 里被唤醒，RX callback 也是 CP 本地的 `agc_shell_rx_ind()`。

## 9. 检查和调试顺序

如果移植后 CP CLI 不能用，按这个顺序查：

1. IMC 是否跑到 `board_cp_usart_hw_init()`，并且 USART1..5 都返回 `RT_EOK`。当前代码没有检查返回值，若要增强可靠性，可以后续考虑记录失败 id。
2. CP `drv_usart_register(USART_DEVICE_ADDR)` 是否成功注册 `usart1` 或 `usart2..5`。
3. `drv_usart_get_id(USART_DEVICE_ADDR, &id)` 是否返回期望 id。CP 地址必须能被 `USART_ADDR_MASK` 正确屏蔽。
4. `rt_console_set_device("usartN")` 是否能找到 device。
5. `hal_usart_init()` 是否能 `rt_device_find(dev_name)`。
6. `agc_shell_set_device()` 是否能通过 `rt_console_get_device()` 找到同一个 device，并成功设置 `rx_indicate`。
7. RX interrupt 到来时，`drv_usart_irq_handler()` 是否调用 `pdev->dev.rx_indicate(&pdev->dev, 1)`。

## 10. 当前代码可优化点

这些不是本页要求的代码修改，只是从当前 diff 读出来的后续建议：

- `board_cp_usart_hw_init()` 当前忽略 `drv_usart_hw_init_only()` 返回值。若某个 base/id 不支持或硬件配置失败，IMC 仍会继续启动，后续 CP CLI 才暴露问题。可以考虑返回 `rt_err_t` 并打印失败的 USART id。
- CP Master/User 调用 `drv_usart_register()` 当前也没有检查返回值。如果注册失败，后续 `board_system_info()`、`rt_console_set_device()`、agc_shell 都可能继续走到更隐蔽的错误。可以考虑保持现有风格的前提下加最小错误打印。
- `usart_dev.reg` 是 driver 内的 legacy 全局指针；多 USART 同时注册时应优先走 `usart_device[id].reg` 和 RT device `user_data`，避免后续新代码误用全局指针。

## 11. 速记

- IMC：`USART0` 用 `drv_usart_init()`，`USART1..5` 用 `drv_usart_hw_init_only()`。
- CP：不再调用 `drv_usart_init()`，只调用 `drv_usart_register()`。
- `drv_usart_init()` 仍保留完整语义，等于 `hw_init_only + register`。
- `drv_usart_get_id()` 的 `USART_ADDR_MASK` 是 IMC/CP 两种地址视角能共用同一套 id 逻辑的关键。
- 硬件初始化迁到 IMC 后，CP 仍然必须保留本地 RT-Thread device/console/agc_shell 绑定。
