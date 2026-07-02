---
type: topic
title: "01 核心概念与 API"
created: 2026-06-30
updated: 2026-06-30
tags:
  - nccl
  - api
  - collective
  - communicator
status: active
source:
  - "NVIDIA/nccl v2.30.7（源码确认 2026-06-30）"
  - "src/nccl.h.in、src/collectives.cc、src/include/nccl_common.h"
---

# 01 核心概念与 API

> 本章把 NCCL 的"名词体系"一次讲清:communicator / rank / device 的关系,7 类集合原语的**精确语义**(谁的数据去了谁那里),以及 stream、group call 这两个最容易踩坑的概念。这是后面所有章节的词汇表。

---

## 1. 三个最基础的名词:communicator / rank / device

```c
ncclCommInitRank(ncclComm_t* comm, int nranks, ncclUniqueId commId, int rank);
//                    ↑comm           ↑nranks               ↑rank
```

- **communicator(通信器,`ncclComm_t`)**:一次集合通信的"参与者集合"。所有要一起做 AllReduce 的 GPU,必须属于**同一个 communicator**。它是个不透明句柄,内部装着拓扑、环/树、所有传输通道(第 02–03 章拆开)。
- **rank**:communicator 里每个参与者的**编号**,`0 .. nranks-1`。一个 rank 通常对应一块 GPU、一个进程(或一个线程)。"rank 0" 常被用作 root(广播源、归约目的地)。
- **nranks**:communicator 里的总参与者数 = 总 GPU 数(对单机多卡或多机多卡都成立)。
- **device**:物理 GPU。rank 到 device 的映射由你决定——通常调 `ncclCommInitRank` 前先 `cudaSetDevice(localGpu)`,NCCL 就把当前 rank 绑到当前 device。

> 💡 **rank ≠ device 编号**。rank 是 communicator 内的逻辑序号(全局,跨机连续);device 是某台机器本地的 GPU 物理号(每机从 0 开始)。8 机 × 8 卡 = 64 个 rank(0–63),但每机 device 都是 0–7。这层映射在第 04 章拓扑里很关键。

三者关系一句话:**一个 communicator 由 nranks 个 rank 组成,每个 rank 绑定一块 device。**

### 创建 communicator 的三种姿势

| 函数 | 场景 | 源码 |
|------|------|------|
| `ncclCommInitRank(comm, nranks, id, rank)` | **多进程/多机**:每个进程各调一次,自报 rank | `src/nccl.h.in:186` |
| `ncclCommInitAll(comms, ndev, devlist)` | **单进程多卡**:一个进程管多块 GPU,一次建好所有 comm | `src/nccl.h.in:195` |
| `ncclCommInitRankConfig(...)` | 带 `ncclConfig_t`(调 blocking/网络/CGA 等) | `src/nccl.h.in:177` |
| `ncclCommSplit(comm, color, key, ...)` | 从已有 comm **切分**子通信器(类 MPI_Comm_split) | `src/nccl.h.in:231` |

最常见的是 `ncclCommInitRank`(PyTorch 的 nccl backend 走这条)。它**隐式与其它 rank 同步**——必须由不同进程/线程并发调用,否则死锁(见第 3 节 group call)。

---

## 2. 七类集合原语:谁的数据去了谁那里

这是全章核心。集合通信的所有"花样",本质就是**数据在 rank 之间怎么流动 + 要不要做归约**。下图把它们一次画全(以 4 个 rank 为例):

![图2:NCCL 七类通信原语语义 — Broadcast/Reduce/AllReduce/AllGather/ReduceScatter/AllToAll/Send-Recv 的数据流 图解](../../_attachments/nccl/02-collective-primitives.png)

> 图解源文件:[`02-collective-primitives.svg`](../../_attachments/nccl/src/02-collective-primitives.svg)

逐个精确定义(对应 `src/collectives.cc` 的入口函数):

| 原语 | 语义(in → out) | 类比 | API |
|------|-----------------|------|-----|
| **Broadcast** | root 的数据 → 复制到所有 rank | "群发同一份文件" | `ncclBroadcast` |
| **Reduce** | 所有 rank 的数据归约(sum/max/…)→ 只 root 拿到结果 | "汇总到组长" | `ncclReduce` |
| **AllReduce** | 所有 rank 归约 → **每个 rank 都拿到结果** | "汇总后再群发给所有人" | `ncclAllReduce` |
| **AllGather** | 每个 rank 一块,拼成全量 → 每个 rank 都拿到全量 | "每人交一段,人手一份合集" | `ncclAllGather` |
| **ReduceScatter** | 所有 rank 归约后,**切块分给各 rank**(rank i 拿第 i 块) | "汇总后各领一段" | `ncclReduceScatter` |
| **AllToAll** | 每个 rank 给每个 rank 发一段(矩阵转置) | "互换名片" | `ncclAlltoAll`(基于 Send/Recv) |
| **Send / Recv** | 点对点:rank a → rank b | "私聊" | `ncclSend` / `ncclRecv` |

### 关键恒等式(面试高频)

```
AllReduce  =  ReduceScatter  +  AllGather
```

这不是巧合——**NCCL 的 Ring AllReduce 实现就是这么做的**:先 ReduceScatter(每人算出最终结果的一块),再 AllGather(把各块拼齐发给所有人)。理解这个分解是看懂第 05 章的钥匙。

类似地:
```
Broadcast ≈ Scatter + AllGather    (概念上)
AllReduce ≈ Reduce + Broadcast      (朴素实现,但通信量翻倍,NCCL 不用)
```

### 归约算子(reduction op)

`Reduce/AllReduce/ReduceScatter` 需要指定怎么"合并"(`src/nccl.h.in:364`):

```c
ncclSum=0, ncclProd=1, ncclMax=2, ncclMin=3, ncclAvg=4
```

- `ncclAvg`(求平均)= sum 后除以 nranks,正是数据并行同步梯度要的。
- 还能用 `ncclRedOpCreatePreMulSum` 自定义"先乘标量再求和"(混合精度缩放常用)。

### in-place 与数据类型

- 多数原语支持 **in-place**(`sendbuff == recvbuff`),省一块显存。`ncclBcast` 就是 `ncclBroadcast` 的 in-place 版(`collectives.cc:204`,直接转调,标注 deprecated)。
- 数据类型 `ncclDataType_t`(`nccl.h.in:382`):`ncclInt8/32/64`、`ncclFloat16/32/64`、`ncclBfloat16` 等。训练里最常见 `ncclFloat32`、`ncclBfloat16`。

---

## 3. 两个最容易踩坑的概念:stream 与 group call

### 3.1 stream:NCCL 调用是异步的

每个集合 API 的最后一个参数都是 `cudaStream_t stream`:

```c
ncclAllReduce(sendbuff, recvbuff, count, ncclFloat, ncclSum, comm, stream);
```

**它不会阻塞等通信完成,而是把通信 kernel 入队到这个 CUDA stream 后立即返回。** 真正执行要等 stream 调度到。这带来两个后果:

1. 想拿到结果,得 `cudaStreamSynchronize(stream)`,或让下游 kernel 在同一 stream 上依赖它。
2. 通信能和计算**重叠**:把通信放一个 stream、计算放另一个 stream,GPU 可以一边算一边通信——这是隐藏通信开销的关键技巧(第 11 章)。

> ⚠️ 常见 bug:`ncclAllReduce` 返回了就以为数据好了 → 读到旧值。返回 ≠ 完成。

### 3.2 group call:把多个调用"打包",先登记后统一发起

这是最多人"看了 API 说明还是不知道它为什么存在"的一个概念。别急着背 API,先想清楚它要解决的问题。

#### 先建立一个认知:集合调用是"集体行动",不是"我一个人的事"

`ncclAllReduce` 这类调用,语义上要求**所有 rank 一起参与**才有意义。所以你在某个 rank 上发起的这一次调用,本质只表达一件事:**"我这一方(这个 rank)到位了,想参加这一轮 AllReduce。"**

关键在于:NCCL 要把这次调用"发起成功",在 CPU 侧还得和**其它 rank 做一次握手**——官方源码注释把它叫作 **inter-CPU synchronization**(`src/nccl.h.in:697`):建立/复用连接、交换对端的 buffer 地址与句柄等,这些都需要**对端 rank 的对应调用也出现在场**,两边 CPU 配对上,这次调用才算真正发起、才会返回。

> 一句话:**一次集合调用能不能"握上手",取决于所有参与方的 CPU 是不是都发起了各自的那一次调用。** 记住这句,下面的死锁就顺理成章了。

#### 问题:单进程管多卡时,逐个阻塞调用会死锁

![图:单进程多卡下 group call 的必要性 — 没有 group 顺序阻塞会死锁,用 ncclGroupStart/End 延迟登记再统一发起才成功 图解](../../_attachments/nccl/15-group-call-deadlock.png)

> 图解源文件:[`15-group-call-deadlock.svg`](../../_attachments/nccl/src/15-group-call-deadlock.svg)

对照上图左半边,把时序摊开看(单进程、单线程,for 循环替 N 块卡各调一次):

1. 第 1 次:调 `ncclAllReduce(comms[0], streams[0])`。它要和 rank 1/2/3 握手才能返回,于是**阻塞,等其它 rank 到齐**。
2. 可"其它 rank 的调用"(`comms[1..3]`)排在 for 循环的后几轮——CPU 正卡在第 1 次调用上,**根本走不到**后面那几轮。
3. 于是:第 1 个调用等后面的调用出现,后面的调用又被第 1 个调用堵着发不出。**互相等待 = 死锁。**

> ⚠️ 注意死锁的是 **CPU 主机线程**,不是 GPU。根因是"集体行动"要求各方 CPU 都先发起,而单线程做不到"同时发起多个"。

**为什么多进程模式不会有这个问题?**(右下角对比)标准分布式训练里每个 rank 是**独立的进程/线程**,各有自己的执行流:第 1 个进程阻塞等待时,别的进程照样在跑、发起自己那一次调用,握手自然配得上。所以**多进程模式不强制用 group**——这也是 PyTorch DDP 平时不用你手写 group 的原因。死锁只在"一个线程串行替多块卡发起调用"时才出现。

#### group call 做了什么:延迟登记 + 到 GroupEnd 统一发起

`ncclGroupStart()` / `ncclGroupEnd()` 之间的调用**不立即执行,只"登记"**(上图右半边):

- 每次 `ncclAllReduce(...)` 只是把这次任务**入队**(`ncclAsyncJobs` 队列,`src/group.cc:65`),然后**立即返回、不阻塞**,CPU 顺畅推进到下一轮。
- 直到最外层 `ncclGroupEnd()`,深度归 0,才把攒下的 N 个调用**一次性并发发起**(`src/group.cc:788`)。此刻所有参与方都"在场",CPU 侧握手**全部配对成功**。

有个值得记住的实现事实,能帮你彻底想通这套机制:

> 💡 **一次普通的"裸"集合调用,其实是被隐式包了一层 group。** 源码里当 `ncclGroupDepth == 0`(不在任何 group 内)时,`ncclAsyncLaunch` 直接执行这次任务(`src/group.cc:40`);`ncclGroupStart()` 做的仅仅是 `ncclGroupDepth++`(`src/include/group.h:88`,thread-local 计数,支持嵌套)。所以"单次调用 vs group"不是两套逻辑,而是**同一套逻辑在 depth 0 和 depth>0 时的两种表现**——group 只是把"立即执行"改成了"先攒着,末尾一起执行"。

#### 三个用途(按适用场景记)

**用途一:单进程多卡,避免死锁**(就是上面那张图的场景):

```c
ncclGroupStart();
for (int i = 0; i < nGpu; i++)
    ncclAllReduce(send[i], recv[i], count, ncclFloat, ncclSum, comms[i], streams[i]);
ncclGroupEnd();   // ← 到这里才真正发起,已收齐、统一并发,不死锁
```

`ncclCommInitAll` 内部就是自己包了一层 group 来并发建多块卡的 comm(见 [03 章](<./03-init-and-bootstrap.md>) 第 6 节)。

**用途二:融合多个点对点,实现 AllToAll。** 单个阻塞式 `ncclSend` 可能正等着它的 `ncclRecv` 配对(和上面的死锁同源)。把一轮要发要收的全部 `Send/Recv` 包进一个 group,NCCL 才能让它们**并发推进而非串行互等**:

```c
ncclGroupStart();
for (int r = 0; r < nranks; r++) {
    ncclSend(sendbuf + r*chunk, chunk, type, r, comm, stream);
    ncclRecv(recvbuf + r*chunk, chunk, type, r, comm, stream);
}
ncclGroupEnd();   // 这就是一次 AllToAll(NCCL 没有独立 AllToAll kernel,见第 4 节)
```

**用途三(性能):把同设备的多个操作融合成一次 kernel launch。** 官方注释叫 "fuse multiple operations to improve performance"(`nccl.h.in:711`)。group 内的多个 collective 会被编排进同一个 plan、合并成一次启动,省下多次 `cudaLaunchKernel` 的开销(第 08 章)。**这条对多进程也有用**——多进程虽不需要 group 来防死锁,但仍可用它把多个小 collective 融合、降低 launch 次数。

#### 两个必须知道的边界

- **GroupEnd 返回 ≠ 通信完成。** 它只保证操作已经**入队到 stream**,不保证已经算完(`nccl.h.in:704`)。想拿结果,仍要 `cudaStreamSynchronize`(同 3.1 节的坑)。
- **`ncclCommInitRank` 能放进 group(并发建多个 comm),但不能和集合通信混在同一个 group 里**(`nccl.h.in:708` 明确说明)。建 comm 归建 comm、做通信归做通信,各自成组。

---

## 4. 5 个"核心" vs 其余:实现层面的分类

源码里有个值得注意的常量(`src/include/nccl_common.h:72`):

```c
#define NCCL_NUM_FUNCTIONS 5 // Send/Recv not included for now
typedef enum {
  ncclFuncBroadcast=0, ncclFuncReduce=1, ncclFuncAllGather=2,
  ncclFuncReduceScatter=3, ncclFuncAllReduce=4,   // ← 这 5 个有专门的 device kernel
  ncclFuncSendRecv=5, ncclFuncSend=6, ncclFuncRecv=7,
  ncclFuncAlltoAll=8, ncclFuncScatter=9, ncclFuncGather=10, ...
} ncclFunc_t;
```

这揭示了一个重要的实现事实:

- **5 个核心原语**(Broadcast/Reduce/AllGather/ReduceScatter/AllReduce)有**各自编译出的 CUDA kernel**,走 Ring/Tree 等集合算法。
- **Send/Recv 是点对点**,单独一套 kernel。
- **AllToAll/Scatter/Gather** **没有独立的集合 kernel**,而是**在 host 侧拆成一堆 Send/Recv**(用 group call 融合)来实现。

所以本教程第 05–09 章的"算法 + kernel"主要围绕那 5 个核心原语展开,尤其是 **AllReduce**(它是 ReduceScatter+AllGather 的组合,最具代表性)。

---

## 5. 所有原语的统一入口:ncclEnqueueCheck

看一眼 `src/collectives.cc`,你会发现**每个集合函数长得几乎一样**:填一个 `ncclInfo` 结构体,然后调同一个函数。以 AllReduce 为例(`collectives.cc:168`):

```c
ncclResult_t ncclAllReduce(const void* sendbuff, void* recvbuff, size_t count,
                           ncclDataType_t datatype, ncclRedOp_t op,
                           ncclComm* comm, cudaStream_t stream) {
  struct ncclInfo info = {
    ncclFuncAllReduce, "AllReduce", sendbuff, recvbuff, count, datatype, op, 0, comm, stream,
    ALLREDUCE_CHUNKSTEPS, ALLREDUCE_SLICESTEPS
  };
  return ncclEnqueueCheck(&info);   // ← 所有原语都收敛到这里
}
```

`ncclInfo`(`src/include/info.h:17`)就是"把这次调用的全部参数打成一个包",`ncclEnqueueCheck`(`src/enqueue.cc:3124`)则是**通往算法选择、计划生成、kernel 启动的总闸门**——第 08 章会从这里一路追到 GPU。

记住这张极简调用链,后面就有了主心骨:

```
ncclAllReduce()  →  填 ncclInfo  →  ncclEnqueueCheck()  →  [算法/协议选择] → [生成 plan] → [启动 kernel]
   (用户 API)        (参数打包)        (统一入口)              第06/11章         第08章        第08/09章
```

---

> 🎯 **面试官会追问**:
> - **AllReduce 为什么等于 ReduceScatter + AllGather?** —— ReduceScatter 让每个 rank 算出最终结果的 1/N 块;AllGather 再把这 N 块互相补齐。两步合起来每个 rank 都拿到完整归约结果,且总通信量最优。NCCL 的 Ring 实现就是这么做的。
> - **`ncclSend/ncclRecv` 为什么常要包在 `ncclGroupStart/End` 里?** —— 单独的阻塞式 Send 可能在等对端 Recv,而对端的 Recv 还没发出,造成死锁;group 让 NCCL 收齐一轮收发后统一并发推进。
> - **rank 和 device 编号是一回事吗?** —— 不是。rank 是 communicator 内全局逻辑号(跨机连续 0..nranks-1);device 是每台机器本地 GPU 物理号。映射由 `cudaSetDevice` + init 决定。
> - **为什么 AllToAll 没有专门的 kernel?** —— 它被 host 侧拆解成 N×N 次 Send/Recv,用 group call 融合执行;NCCL 只给 5 个核心归约/聚合原语编译了专用集合 kernel(`NCCL_NUM_FUNCTIONS=5`)。
> - **`ncclAvg` 怎么实现的?** —— sum 归约后除以 nranks;数据并行同步梯度正好要平均而非求和。

---

**上一章** ← [00 概览](<./00-overview.md>)　|　**下一章** → [02 整体架构与代码地图](<./02-architecture-codemap.md>)
