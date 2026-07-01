---
type: note
title: "附录 · 面试向深入问答（aigc.ko）"
created: 2026-06-26
updated: 2026-06-29
tags:
  - kmd
  - interview
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd"
  - "[[wiki/grace/overview/saxpy-kernel-end-to-end|saxpy 端到端长文]]"
---

# 附录 · 面试向深入问答（aigc.ko）

> 这是一篇**面试准备向**的问答长文，把正文各章拆成「面试官会怎么追问、你该怎么严谨作答」。术语首次出现给定义，
> **「源码确认」与「推断」分开标注**。配套读物：[08 端到端：一次 saxpy 的全程](<../08-end-to-end-saxpy.md>)。

## Q：用户态拿到的是指针还是句柄？为什么？

是**句柄（handle）**，不是内核指针。用户态创建 context / 显存 / 队列后拿到的是一个**打包了 id 的整数**；内核侧
维护 **IDR 表**（id→对象 映射），用句柄反查回真正的内核对象。

为什么这么设计（高频点）：
- **跨进程安全**：句柄只是整数，进程 A 的句柄到进程 B 查无此物；即使伪造一个句柄塞进 ioctl，IDR 查不到对应对象就
  返回错误，**崩不了内核**。
- **生命周期可控**：对象释放走引用计数（如 `mem_handle_put()` 减 kref、归零才释放后端），句柄失效但内核内存不会被
  用户态野指针乱踩。

> 🎯 **追问**：「doorbell 不也是地址，用户态直接写？」doorbell 是 MMIO 寄存器，地址是内核建 context 时**映射进该
> 进程地址空间**的，只在这个进程有效、只能写自己队列的门铃——和「拿内核指针」两码事。

对应：[02 数据结构](<../02-data-structures.md>)。

## Q：一次 ioctl 在内核里怎么走？为什么是「两级派发」？

走**两级、两张表**（源码确认 `aigc_ioctl.c` + `aigc_fops.c`）：

**第一级 · `aigc_ioctl()`——只做安检（fail-closed）**：解码 `nr=_IOC_NR(cmd)`、`size=_IOC_SIZE(cmd)`；编号必须在
`aigc_ioctl_tbl[]` 范围内，**且表项 `.cmd` 与传入 `cmd` 精确相等**（`cmd` 由 `_IOC` 宏编码，含读写方向和参数 size，
所以「编号对但方向/size 错」也被当场挡掉，返回 `-EINVAL`）。

**第二级 · `aigc_lib_ioctl()`——只做分诊**：用编号当下标从**处理函数表**取 `aigc_ioctl_<op>()`，空槽 `-EINVAL`，命中
转发 `(private_data, buf)`。

> 🎯 **追问：为什么不用一个 switch，要两张表？** 两张表都由**同一份 X-macro 列表** `aigc_ioctl_tab.h` 生成（一处展开成
> 校验表 `{.name,.cmd}`，一处展开成派发表 `[AIP_x]=handler`），从机制上杜绝「校验认得、派发不认得」的裂缝。手写两份
> switch 容易改一处漏一处。

对应：[03 ioctl 接口与 ABI](<../03-ioctl-abi.md>)。

## Q：页表和 VMID 是什么？为什么「写页表生死攸关」？

每个 context（一块卡上的一个 GPU 地址空间）有一个 **VMID**（地址空间编号，区分各 context 页表）和**一套独立 4 级
页表**（记 GPU VA → 物理页）。

为什么生死攸关：CP/GPU 执行 kernel 时拿命令包里的 **GPU 虚拟地址**去找数据；如果没把「这段 GPU VA → 哪些物理页」
写进**这个 context 的页表**，硬件翻译时就找不到数据，读到垃圾或触发地址错误。具体动作在 `AIP_MEM_CREATE` /
`AIP_MEM_MAP`：写 PTE，然后**刷 TLB**（让旧翻译缓存失效）。

> 🎯 **追问**：「为什么刷 TLB？」TLB 是翻译硬件缓存，改页表不刷可能命中旧条目翻到错误物理页。「VMID 有限怎么办？」
> VMID 是有限硬件资源，每 context 占一个，是隔离不同进程 GPU 地址空间的关键。

对应：[04 内存与页表](<../04-memory-and-pagetables.md>)。

## Q：队列怎么建？HWS 和 NO_HWS 的区别？

先认两个术语：**MCQD**（软件队列描述符，逻辑队列，可多）、**HCQD**（硬件队列槽，物理有限）。建队列
（`AIP_QUEUE_CREATE`）按策略两条路（源码确认）：

- **HWS（默认，`SCHED_POLICY_HWS`）**：`create_queue_cpsche()` 填好 MCQD，发 *create-queue* IPC 给 CP 固件
  （`aigc_hal_add_queue`），之后**固件自己**用 QDMA 查就绪 MCQD、BDMA 动态绑到空闲 HCQD。**KMD 不参与逐队列上场**。
- **NO_HWS**：`allocate_hqd()` 分硬件队列槽（**当前实现恒返回 pipe0/queue0**，bring-up 简化），再 `aigc_hal_bind_queue`
  由 KMD 直接绑固定 HCQD。

> 🎯 **追问**：「为什么 MCQD/HCQD 两级？」软件想要多逻辑队列，硬件槽有限——两级让二者解耦，HWS 下固件按就绪状态动态
> 绑定。「NO_HWS 恒 pipe0/queue0 是 bug 吗？」是 bring-up 简化，HWS 才是默认完整路径，如实标注即可。

对应：[05 提交、事件与中断](<../05-submission-events-interrupts.md>)。

## Q：kernel 提交到底经不经过 KMD？（重点纠偏）

**HWS 默认下：不经过。** 这是全篇最该记牢的一点。UMD 自己把 dispatch 包写进 host 内存的 stream ring，自己原子写
doorbell（MMIO）通知芯片，CP 固件异步取包，**KMD 不经手每个 kernel 包**。

那 KMD 里那套像「提交」的代码是什么？两个事实（源码确认）：
- **事实 1**：`aigc_ioctl_queue_submit()` **开头第一行就 `return -EFAULT;`**（submission disabled）——靠这个 ioctl
  提交 kernel 走不通，反证 kernel 走 UMD 直发。
- **事实 2**：`INDIRECT_CMD_NODE` + CP 环 + 调度 kthread 是另一条/演进中的路径，服务 `CP_EVENT_DISPATCH` 等事件/同步
  类命令，**不是 saxpy kernel 主线**。

> 🎯 **追问：CP 环 wptr/rptr 怎么判满判空？** 满 `((wptr+unit)%bytes)==rptr`，空 `wptr==rptr`，永远留一个槽当永久
> 间隙（否则满和空都表现为 `wptr==rptr` 无法区分）。**本 build 注意**：读硬件 rptr 的 `aigc_cp_get_ring_rptr()` 当前
> 是返回 0 的桩，所以满判定实际跟 0 比——bring-up 简化，面试如实说明。写 wptr 进 `CP_REG_WPTR` 就是敲门铃。

对应：[05 提交、事件与中断](<../05-submission-events-interrupts.md>)、[08 端到端](<../08-end-to-end-saxpy.md>)。

## Q：kernel 算完了 host 怎么知道？fence 和中断怎么配合？

两件套：**fence（比大小）+ MSI-X 中断（主动通知）**，不是轮询硬件（费 CPU/总线）。
- **fence**：dispatch 包带 `fence_addr` + 预期值，CP 跑完把一个**单调递增的完成号**写进 fence 缓冲；判断完成就是
  `fence_buf ≥ 预期值`，比大小、不读硬件状态寄存器，单调递增天然支持乱序/批量完成。
- **MSI-X**：一次普通 kernel 计算完成用**向量 40**（CP event-signal）。中断分两班：上半部（硬中断，读+清+置
  `need_bh`，极快返回）、下半部（工作队列 drain 事件环 → 唤醒等结果的用户线程）。

> ✅ **易混向量（已核对）**：kernel 计算完成认准**向量 40**。另有 39（CP TCU）、41（err）、111（CP 固件命令 ack）、
> 109（IMC ack）——都不是 kernel 计算完成的通道。
> ⚠️ **fence 地址谁设**：HWS 主路径由 **UMD** 设；KMD 那条演进路径才由 `aigc_ts_copy` 盖进 `SIGNAL_FENCE` 包。

对应：[05 提交、事件与中断](<../05-submission-events-interrupts.md>)。

## Q：KMD 怎么碰硬件的？什么是 HAL 边界？

核心层**不直接读写寄存器**，所有硬件访问经一层 **HAL**（`aigc_hal_*`）。源码事实：`aigc_hal.c` 是薄转发层——每个
入口经 `lib_dev->hal` 上的函数指针走（`hal_cp.ops.*`、`hal_imc.ops.*` 及 arch 钩子）。**目前没有运行时后端选择**，
`aigc_hal_init()` 无条件调 Grace 后端，多后端派发是 TODO。

为什么要这层边界：把「可移植核心逻辑」与「具体芯片寄存器/IPC 细节」分开，换芯片只换 HAL 后端——这和另一条移植性
缝隙 `os_interface.c`（唯一碰 `<linux/*>` 的文件）是同一种思路：**把易变的东西收口到一层**。

对应：[06 Grace HAL](<../06-hal-grace.md>)、[01 整体架构](<../01-architecture.md>)。

## Q：`aigc_kernel.o_binary` 是 saxpy 的 GPU kernel 二进制吗？（澄清陷阱）

**不是。** 源码事实（`file` 实测 + Makefile 确认）：它是一个 2.7MB 的**闭源 x86-64 ELF blob**，被链进 `aigc.ko`
——是 KMD（跑在 x86 host CPU 上）自己的闭源核心目标文件，**不是跑在 GPU 上的计算 kernel**，与 saxpy/add1 这种 GPU
kernel 毫无关系。GPU kernel 的真身是 UMD 侧编译产物（fatbin）。

## 一页纸速记

| 追问点 | 一句话 |
|---|---|
| 句柄还是指针 | 句柄（整数 id），内核用 IDR 还原；跨进程安全 |
| ioctl 派发 | 两级两表，入口 fail-closed 精确匹配，核心按编号取 handler；同一 X-macro 生成两表 |
| 页表 / VMID | 每 context 一套 4 级页表 + 一个 VMID；不写页表 CP 找不到数据；改页表刷 TLB |
| 建队列 / HWS | HWS：填 MCQD + IPC，固件绑 HCQD；NO_HWS：当前恒 pipe0/queue0 |
| 提交真相 | HWS 下 KMD 不经手 kernel 包；`queue_submit` 当前 `-EFAULT` |
| CP 环满/空 | 满 `((wptr+unit)%bytes)==rptr`，空 `wptr==rptr`，留一槽；本 build rptr 返 0 桩 |
| 完成回路 | fence 比大小 + MSI-X 向量 40；上半部读清+need_bh，下半部 drain+唤醒 |
| HAL 边界 | `aigc_hal_*` 薄转发（函数指针），当前只接 Grace，多后端是 TODO |
| `aigc_kernel.o_binary` | KMD 自己的闭源 x86-64 ELF（链进 aigc.ko），不是 GPU kernel |

## 返回
- [KMD 知识库入口](<../index.md>) · [术语表](<./glossary.md>) · [代码评审记录](<./code-review.md>)
