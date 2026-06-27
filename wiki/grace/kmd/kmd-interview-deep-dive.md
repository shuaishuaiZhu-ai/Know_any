---
type: topic
title: "KMD 面试向深入（aigc.ko 问答）"
created: 2026-06-26
updated: 2026-06-26
tags:
  - grace
  - kmd
  - interview
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd（KMD aigc.ko，源码确认 2026-06-26）"
  - "[[wiki/grace/kmd/index|KMD aigc.ko 知识库]]"
  - "[[saxpy-kernel-end-to-end|一个 Kernel 从 .cu 到硬件执行的全流程]]"
---

# KMD 面试向深入（aigc.ko 问答）

> 这是一篇**面试准备向**的问答长文，专讲 KMD——即 GraceC GPU 在 Linux 内核里的驱动 `aigc.ko`。配套读物是端到端长文 [[saxpy-kernel-end-to-end|一个 Kernel 从 .cu 到硬件执行的全流程]]；那篇给的是“地图”，这篇把地图里 KMD 那一段拆成“面试官会怎么追问、你该怎么严谨作答”。
>
> 形式：每节一个 `## Q：……`，正文严谨作答；易被深挖处再加 `> 🎯` 盒子。术语首次出现给定义。**“源码确认”与“推断”分开标注**（源码均在 `192.168.80.116`，2026-06-26 核实）。

---

## 先建立一个正确的总印象

面试里关于 KMD，最容易答错的一句话是：“kernel 提交时，KMD 负责把命令搬给 GPU。” **在默认的 HWS 模式下这是错的。**

正确的总印象是：**KMD 只在初始化时一次性“建场”**（建 context、分显存写页表、建队列、发 IPC 通知固件），之后**每个 kernel 包都由 UMD 直发**（UMD 自己写 ring buffer + 敲 doorbell），KMD 不经手。KMD 在运行期再次出场，是在 kernel **算完之后**——处理完成中断、唤醒等结果的线程。

带着这个印象往下看每个问答点。

---

## Q：用户态拿到的是指针还是句柄？为什么这样设计？

是**句柄（handle）**，不是内核内存指针。

用户态创建 context、显存、队列后，拿到的是一个**打包了 id 的整数句柄**。内核侧维护一张 **IDR 表**（Linux 内核的 id→对象 映射结构），用句柄反查回真正的内核对象（`aigc_ctx` / `mem_handle` / 队列对象）。

为什么这么设计——这是面试高频点：

- **跨进程安全**：句柄只是个整数，跨进程没有意义；进程 A 的句柄拿到进程 B 里查无此物。即使有人**伪造**一个句柄塞进 ioctl，内核在 IDR 表里查不到对应对象，直接返回错误，**崩不了内核**。
- **生命周期可控**：对象的释放走引用计数（如 [[mem_handle]] 的 `mem_handle_put()` 减 kref、归零才释放后备），句柄失效但内核内存不会被用户态野指针乱踩。

> 🎯 **面试官会追问**
> - **“那 doorbell 不也是个地址，用户态直接写？”** doorbell 是个 **MMIO 寄存器**，地址是内核在建 context 时**映射进该进程地址空间**的——它只在这个进程有效，且只能写自己的队列 doorbell。这跟“拿内核指针”是两码事。
> - **“句柄能枚举/猜测吗？”** 即使猜中一个别的进程的 id，IDR 表是按客户端对象组织的，跨客户端取不到——这正是“句柄而非指针”的安全价值。

**对应页**：[[wiki/grace/kmd/concepts/mem_handle|mem_handle]]、[[wiki/grace/kmd/concepts/aigc_ctx|aigc_ctx]]。

---

## Q：一次 ioctl 在内核里怎么走？为什么是“两级派发”？

用户态每喊一次 `ioctl(fd, AIP_*, &args)`，内核里走**两级、两张表**（源码确认 `aigc_ioctl.c` + `aigc_fops.c`）：

**第一级 · 入口层 `aigc_ioctl()`（`aigc_ioctl.c`）—— 只做安检（fail-closed）**

1. 解码 `nr = _IOC_NR(cmd)`、`param_size = _IOC_SIZE(cmd)`。
2. **编号必须在 `aigc_ioctl_tbl[]` 范围内**；
3. **且表项 `.cmd` 必须和传入 `cmd` 完全相等**——`cmd` 是 `_IOC` 宏编码出来的，里面含**读写方向**和**参数结构 size**。所以“编号对、但方向或 size 编码不对”的请求也会被当场挡掉，返回 `-EINVAL`。
4. 校验通过才把 `private_data`、`nr`、`param_size`、用户缓冲打成 `struct aigc_ioctrl_params`，调下一级。

这叫 **fail-closed（默认拒绝）**：畸形或版本不匹配的请求，进不了核心层。

**第二级 · 核心层 `aigc_lib_ioctl()`（`aigc_fops.c`）—— 只做分诊**

用命令编号当下标，从一张**处理函数表**取出对应的 `aigc_ioctl_<op>()`，空槽 `-EINVAL`，命中就转发 `(private_data, buf)`。

> 🎯 **面试官会追问：为什么不用一个 switch，要搞两张表？**
> 两张表都由**同一份 X-macro 列表** `common/include/aigc_ioctl_tab.h` 生成：一处展开成“校验表 `{.name, .cmd}`”，另一处展开成“派发表 `[AIP_x] = handler`”。**一份列表生成两张表，从机制上杜绝“校验认得、派发不认得”的裂缝**。手写两份 switch 很容易改一处漏一处。这是这套设计的关键，也是面试想听的答案。

**对应页**：[[wiki/grace/kmd/ioctl/aigc_ioctl|aigc_ioctl 两级派发]]、[[wiki/grace/kmd/arch/request-path|一次请求的端到端路径]]、[[wiki/grace/kmd/ioctl/ioctl-abi|ioctl ABI]]。

---

## Q：页表和 VMID 是什么？为什么说“写页表生死攸关”？

每个 context（一块卡上的一个“GPU 进程地址空间”）有：

- 一个 **VMID**：GPU 地址空间的编号，用来区分不同 context 的页表（源码 `aigc_context_create` → `aigc_ctx_init_vm` 分配 VMID + 建根页表）。
- **一套独立的 4 级页表**：把 **GPU 虚拟地址（GPU VA）→ 物理页** 的映射记下来。

为什么生死攸关——这是面试想考的“理解深度”：

> 显存分到手只是“有料”，但 CP/GPU 执行 kernel 时，拿的是命令包里的 **GPU 虚拟地址**去找数据（比如 `add1` 要写的 `deviceA`）。如果没把“这段 GPU VA → 哪些物理页”写进**这个 context 的页表**，硬件做地址翻译时就**找不到 `deviceA`**，要么读到垃圾、要么触发地址错误。页表 = GPU 看显存的“地址翻译词典”，每个 context 一本（用 VMID 区分）。

具体动作在 `AIP_MEM_CREATE` / `AIP_MEM_MAP` 路径：`aigc_mem_handle_map_pte()` / `aigc_mem_handle_setup_pte()` 在 GPU VA 处写 PTE，然后**刷 TLB**（让旧的地址翻译缓存失效，否则硬件可能还用着旧映射）。

> 🎯 **面试官会追问**
> - **“为什么要刷 TLB？”** TLB 是地址翻译的硬件缓存。改了页表不刷 TLB，硬件可能命中旧条目，翻译到错误的物理页。
> - **“VMID 有限怎么办？”** VMID 是硬件资源（数量有限），每个 context 占一个，是隔离不同进程 GPU 地址空间的关键；这也呼应“句柄/IDR”那套——隔离做在多个层次上。

**对应页**：[[wiki/grace/kmd/memory/aigc_page_table|4 级页表]]、[[wiki/grace/kmd/memory/index|内存与页表]]、[[wiki/grace/kmd/concepts/aigc_vm|aigc_vm]]、[[wiki/grace/kmd/flows/mem-create-flow|mem-create 流程]]、[[wiki/grace/kmd/flows/pgtable-mapping-flow|页表映射流程]]。

---

## Q：队列是怎么建起来的？HWS 和 NO_HWS 有什么区别？

先认两个术语：

- **MCQD**（Memory Command Queue Descriptor）：**软件队列描述符**——逻辑队列，可以有很多个。
- **HCQD**（Hardware Command Queue Descriptor）：**硬件队列槽**——物理有限（共 32 个）。

KMD 建队列时（`AIP_QUEUE_CREATE`）按调度策略走两条路（源码确认）：

**HWS（Hardware Scheduling，默认）** —— `aigc_lib_dev.c:71` `lib_dev->sched_policy = SCHED_POLICY_HWS;`

- `create_queue_cpsche()` 在 context 的 `KCACHE_MD` 区**填好 MCQD**（队列描述符）；
- 调 `aigc_hal_add_queue()` 发一条 **create-queue IPC** 给 CP 固件；
- 之后由**固件自己**用 QDMA 查哪条 MCQD 就绪、BDMA 把就绪的 MCQD 动态绑到空闲的 HCQD 上调度。
- **KMD 不参与逐队列的上场决策**——它只“登记 + 通知”。

**NO_HWS** —— `create_queue_no_cpsche()`

- 调 `allocate_hqd()` 分配硬件队列槽——**注意：当前实现恒返回 pipe0/queue0**（源码事实，是简化/bring-up 状态）；
- 再调 `aigc_hal_bind_queue()` 由 KMD **直接把队列绑到固定 HCQD**。

> 🎯 **面试官会追问**
> - **“为什么要 MCQD/HCQD 两级？”** 软件想要很多逻辑队列（每个 stream 一条），硬件槽位有限（32 个）。两级让“软件多队列 ↔ 硬件有限槽”解耦：HWS 下固件按就绪状态动态绑定。详见 [[stream-mcqd-hcqd-and-command-submission|stream / MCQD / HCQD 与命令下发]]。
> - **“NO_HWS 恒 pipe0/queue0 是 bug 吗？”** 是当前 bring-up 阶段的简化（`allocate_hqd` 还没做真正的槽位分配）；HWS 才是默认且完整的路径。如实标注即可，别在面试里说成“正式特性”。

**对应页**：[[wiki/grace/kmd/flows/queue-create-flow|queue-create 流程]]、[[wiki/grace/kmd/queue/index|命令队列与调度]]、[[stream-mcqd-hcqd-and-command-submission|stream/MCQD/HCQD 专文]]。

---

## Q：kernel 提交到底经不经过 KMD？（重点纠偏）

**HWS 默认下：不经过。** 这是全篇最该记牢的一点。

UMD 自己把 dispatch 包写进 host 内存里的 stream ring buffer，自己原子写 doorbell（MMIO）通知芯片，CP 固件异步取包。**KMD 不经手每一个 kernel 包**（详见 [[saxpy-kernel-end-to-end|端到端长文]] 第 2.5 节）。

那 KMD 里那套看起来像“提交”的代码是什么？面试官常拿它做陷阱：

**事实 1 —— `AIP_QUEUE_SUBMIT` 当前是禁用的。**

`aigc_fops.c:2677` 的 `aigc_ioctl_queue_submit()` **开头第一行就 `return -EFAULT;`**，注释明写 submission disabled（源码确认）。也就是说，想靠这个 ioctl 提交 kernel，根本走不通——这反过来印证了 kernel 提交走 UMD 直发。

**事实 2 —— `INDIRECT_CMD_NODE` + CP 环 + kthread 是“另一条/演进中的”路径，不是 add1 主线。**

KMD 里确有一套后台提交机制（源码确认）：

- `aigc_fops.c:2691` `aigc_cmd_create(vdev, INDIRECT_CMD_NODE, NULL, CP_EVENT_DISPATCH)` 建命令对象，`INDIRECT_CMD_NODE` 表示“间接命令缓冲（IB）”；
- `aigc_cp_cmd_pkt.c:22` `aigc_fill_indirect_pkt(AIP_CMD_INDIRECT)` 填一个指向 IB 的 CP 包；
- `aigc_sched.c:310` `aigc_cp_insert_ring()` 把包插进 **CP 环**；
- 后台 kthread `aigc_wait_event_kthread` 跑 `cond_func`/`sched_func`，负责写 wptr（敲门铃）推动。

**关键定位**：这条路径服务的是 `CP_EVENT_DISPATCH` 等（事件/同步类命令），而且 `queue_submit` 已禁用——**它不是 `add1` 这种 kernel job 的主线**。现有 `command-submission-flow.md` / `saxpy-submission-flow.md` 把它当 saxpy 主线，对 HWS 默认是**误导**（另有 `aigc_ioctl_queue_submit_v1/v2`、`aigc_fake_queue_submit` 是演进/桩代码）。

> 🎯 **面试官会追问：那 CP 环的 wptr/rptr 怎么判满判空？**（源码确认 `aigc_cp_ring.c`）
> - **wptr**：软件**生产者**偏移；**rptr**：硬件**消费者**偏移。
> - **满**：`((wptr + unit) % bytes) == rptr`；**空**：`wptr == rptr`。
> - 环永远**留一个槽当永久间隙**——否则“满”和“空”都表现为 wptr==rptr，无法区分。
> - **本 build 注意点**：读硬件 rptr 的 `aigc_cp_get_ring_rptr()` 当前是**返回 0 的桩**，所以“满判定”实际是在跟 0 比——又一处 bring-up 简化，面试时如实说明。
> - 插入靠 `aigc_cp_insert_ring()`（校验对齐/能放下/没满，否则 `-EAGAIN`），发布靠 `aigc_cp_update_ring_wptr()` 写 `CP_REG_WPTR`——**写 wptr 就是敲门铃**。

**对应页**：[[wiki/grace/kmd/queue/aigc_cp_ring|CP ring（wptr/rptr/doorbell）]]、[[wiki/grace/kmd/queue/aigc_sched|调度 kthread]]、[[wiki/grace/kmd/flows/command-submission-flow|命令提交流程（注意上述纠偏）]]。

---

## Q：kernel 算完了，host 怎么知道？fence 和中断怎么配合？

两件套：**fence（比大小）+ MSI-X 中断（主动通知）**，**不是轮询硬件**（轮询费 CPU/总线）。

**fence**：dispatch 包里带 `fence_addr` + 预期 `fence_value`。CP 把 kernel 跑完后，把一个**单调递增的完成号**写进 fence 缓冲。判断“完成没”，就是一句话——看 `fence_buf ≥ 记下的预期值`，**比大小，不读硬件状态寄存器**。单调递增还天然支持乱序/批量完成。

> ⚠️ **fence 地址谁设**（别混两条路径）：HWS 主路径由 **UMD** 设（阻塞 launch 时取 user signal 的地址，详见端到端长文）；KMD 那条演进路径才由 `aigc_ts_copy` 盖进 `SIGNAL_FENCE` 包。

**MSI-X 中断**：CP 完成时抬一个 MSI-X 中断。对一次普通 kernel 计算完成，用**向量 40（CP event-signal）**。

> ✅ **易混向量（已核对）**：kernel 计算完成认准**向量 40**。源码里还有：**39**（CP TCU）、**41**（err）、**111**（CP 固件命令的 ack，如建/销队列）、**109**（IMC ack）——**这些都不是 kernel 计算完成的通道**。

中断进来分两班接力（源码确认）：

- **上半部**（硬中断，必须极快）：`aigc_lib_irq_cp_tcu()` **读 + 清**中断状态，标记 `need_bh`，立刻返回。硬中断里不能干重活（拖慢系统、可能死锁）。
- **下半部**（workqueue / 线程）：`aigc_intr_ring_read_one()` → `enqueue_event()` → `os_wake_up()`，把事件推给注册的客户端、**唤醒**那个卡在等结果的用户线程。

> 🎯 **面试官会追问**
> - **“为什么不轮询？”** 比大小 = 一次内存读；轮询硬件状态寄存器费总线/CPU，还不支持批量完成。
> - **“为什么中断要拆上/下半部？”** 硬中断上下文里禁止睡眠、禁止干重活；上半部只读清+标记，重活（读事件环、唤醒线程）丢给下半部。

**对应页**：[[wiki/grace/kmd/interrupt/aigc_kmd_fence|fence / timestamp 完成模型]]、[[wiki/grace/kmd/interrupt/aigc_interrupt|MSI-X 中断上/下半部]]、[[wiki/grace/kmd/interrupt/index|中断与 Fence]]、[[wiki/grace/kmd/flows/completion-interrupt-flow|完成中断流程]]。

---

## Q：KMD 怎么碰硬件的？什么是 HAL 边界？

KMD 核心层**不直接读写寄存器**，所有硬件访问都经一层 **HAL（Hardware Abstraction Layer，硬件抽象层）**：`aigc_hal_*` 系列函数。

源码事实（`aigc_hal.c`）：`aigc_hal.c` 是**薄转发层**——每个入口经 `lib_dev->hal` 上的**函数指针**走（`hal_cp.ops.*`、`hal_imc.ops.*` 及 arch 钩子）。前面提到的 `aigc_hal_add_queue()` / `aigc_hal_bind_queue()` 就属于这层。

> 注意：**目前没有运行时后端选择**——`aigc_hal_init()` 无条件调 Grace 后端，多后端派发是留作 TODO 的占位。所以 HAL 边界在“设计意图”上是为多硬件后端抽象，但当前只接了 Grace 一家。

为什么要这层边界（面试点）：把“可移植核心逻辑（ctx/页表/队列/中断）”与“具体芯片的寄存器/IPC 细节”分开，核心层换芯片时只换 HAL 后端。这跟 KMD 另一条移植性缝隙——`os_interface.c`（唯一碰 `<linux/*>` 的文件）——是同一种思路：**把易变的东西收口到一层**。

**对应页**：[[wiki/grace/kmd/hal/grace-hal|Grace HAL]]、[[wiki/grace/kmd/hal/index|HAL 总览]]、[[wiki/grace/kmd/os/os_interface|os_interface]]。

---

## Q：`aigc_kernel.o_binary` 是 saxpy/add1 的 GPU kernel 二进制吗？（澄清陷阱）

**不是。** 这是个经典误判，面试或读代码时容易踩。

源码事实（`file` 实测 + Makefile 确认）：

- `~/ajthunk/kmd/aigc/aigc_kernel.o_binary` 是一个 **2.7MB 的闭源 x86-64 ELF blob**（`file` 显示 `ELF 64-bit LSB relocatable, x86-64, with debug_info, not stripped`）。
- `kmdlib/Makefile:116` `AIGC_BINARY_OBJECT := aigc_kernel.o_binary`，它被**链进 `aigc.ko`**——是 KMD 自己的闭源核心目标文件。

所以它是 **KMD（运行在 x86 host CPU 上）自己的代码**，**不是跑在 GPU 上的计算 kernel**，**与 `add1` 这个 GPU kernel 毫无关系**。

> 对比：`add1` 的真身是 **UMD 侧编译产物**——fatbin 内嵌进可执行 ELF（独立形态 `.co`，机器名 KungFu32），由 GPU 执行单元跑。详见 [[saxpy-kernel-end-to-end|端到端长文]] 第 2.1 节。
>
> ⚠️ 旧 wiki 出现过两种说法——“它是 saxpy kernel 二进制” / “它只是个不存在的变量名”——**都错**。正确表述：KMD 自己的闭源 x86-64 ELF blob，链进 `aigc.ko`。

---

## 一页纸速记（面试前扫一眼）

| 追问点 | 一句话答案 |
|---|---|
| 句柄还是指针 | 句柄（整数 id），内核用 **IDR 表**还原；跨进程安全，伪造句柄查无此物 |
| ioctl 派发 | 两级两表：入口层 fail-closed 安检（编号在表 + `_IOC` 方向/size 精确匹配），核心层按编号取 handler；同一 X-macro 生成两表 |
| 页表 / VMID | 每 context 一套 4 级页表 + 一个 VMID；不写页表，CP 找不到 `deviceA`；改页表要刷 TLB |
| 建队列 / HWS | HWS（默认）：`create_queue_cpsche` 填 MCQD + `aigc_hal_add_queue` IPC，固件 QDMA/BDMA 绑 HCQD；NO_HWS：`allocate_hqd`（当前恒 pipe0/queue0）+ `aigc_hal_bind_queue` |
| 提交真相 | HWS 下 KMD **不经手** kernel 包；`aigc_ioctl_queue_submit` 当前 `return -EFAULT`；INDIRECT_CMD_NODE+CP 环+kthread 是另一条路径（服务 CP_EVENT_DISPATCH） |
| CP 环满/空 | 满 `((wptr+unit)%bytes)==rptr`，空 `wptr==rptr`，留一槽；本 build rptr 是返回 0 的桩 |
| 完成回路 | fence 比大小（`fence_buf≥预期`）+ MSI-X 向量 **40**；上半部 `aigc_lib_irq_cp_tcu` 读清+`need_bh`，下半部 `aigc_intr_ring_read_one`→`enqueue_event`→`os_wake_up` |
| 向量别混 | 40=CP event-signal(kernel 完成)；39=CP TCU，41=err，111=CP 命令 ack，109=IMC ack |
| HAL 边界 | `aigc_hal_*` 薄转发层（函数指针），抽象硬件访问；当前只接 Grace，多后端是 TODO |
| `aigc_kernel.o_binary` | KMD 自己的闭源 x86-64 ELF blob（2.7MB，链进 `aigc.ko`），**不是 GPU kernel** |

---

## 延伸阅读

- **同系列**：[[saxpy-kernel-end-to-end|一个 Kernel 从 .cu 到硬件执行的全流程]]、[[stream-mcqd-hcqd-and-command-submission|stream / MCQD / HCQD 与命令下发]]、[[wiki/grace/fw/fw-cp-interview-deep-dive|CP 面试向深入]]。
- **KMD 知识库入口**：[[wiki/grace/kmd/index|KMD 内核驱动知识库]]。
- 各问答点的“对应页”链接见正文小节末尾。

---

> 📝 **本文状态**：关键事实经 116 源码确认（2026-06-26），“源码确认 / 推断”已分开标注（IDR/句柄安全性、HAL“为多后端抽象”的意图为设计层面表述，源码侧确认的是“IDR 还原对象”“`aigc_hal.c` 薄转发 + 当前只接 Grace”）。如与最新源码不符，请在对应深入页修订。
