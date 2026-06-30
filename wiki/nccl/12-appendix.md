---
type: topic
title: "12 附录:术语表 / FAQ / 环境变量 / 阅读路线"
created: 2026-06-30
updated: 2026-06-30
tags:
  - nccl
  - appendix
  - glossary
  - faq
status: active
source:
  - "NVIDIA/nccl v2.30.7（源码确认 2026-06-30）"
  - "全教程 00–11 章的索引与速查"
---

# 12 附录:术语表 / FAQ / 环境变量 / 阅读路线

> 速查页。术语表帮你快速回忆概念,FAQ 收录高频疑问,环境变量速查表(均经源码核实)用于调优排障,最后给一条"源码阅读路线"。

---

## 1. 术语表

| 术语 | 一句话定义 | 章 |
|------|-----------|----|
| **communicator(ncclComm)** | 一次集合通信的参与者集合(N 个 rank)的句柄 | 01 |
| **rank** | communicator 内参与者编号 0..N−1,通常一卡一 rank | 01 |
| **AllReduce** | 所有 rank 数据归约后,人人都拿到结果 | 00/01 |
| **ReduceScatter** | 归约后切块,rank i 拿第 i 块 | 01/05 |
| **AllGather** | 各交一段,人人拿到全量 | 01/05 |
| **channel** | 一条并行通信流水线;一次集合开 nChannels 条 | 02 |
| **connector** | 一个方向 × 一种协议的实际连接,内含 transport | 02 |
| **topology(拓扑)** | NCCL 探测出的 GPU/NIC/链路带权图 | 04 |
| **PATH_*** | 两节点路径的"远近"等级(NVL<PCI<SYS<NET) | 04 |
| **Ring** | 把 GPU 排成环、绕环收发的算法,带宽最优 | 05 |
| **Tree** | double binary tree,延迟 O(log N) | 06 |
| **CollNet / NVLS** | 把归约下放到 IB 交换机(SHARP)/ NVSwitch 硬件 | 06 |
| **transport(P2P/SHM/NET)** | connector 的物理实现:直连/共享内存/网络 | 07 |
| **GDR(GPUDirect RDMA)** | 网卡直接 DMA 显存,跨机不经 host | 07 |
| **enqueue** | 把一次调用变成 task → plan → kernel 启动的控制面流程 | 08 |
| **work FIFO** | host 把 work 递给 GPU 的环形缓冲 | 08 |
| **primitives** | device 端封装收/发/reduce 的模板(prims_*) | 09 |
| **协议 Simple/LL/LL128** | kernel 内收发同步方式:带宽/延迟各异 | 09 |
| **NCCL_STEPS** | FIFO slot 数 = 8,流水线深度 | 09 |
| **proxy 线程** | CPU 后台线程,替 GPU 收发网络包(仅跨机) | 10 |
| **bootstrap** | rank 间第一次互相发现的带外握手(环 all-gather) | 03 |

---

## 2. FAQ

**Q: `ncclAllReduce` 返回了,通信完成了吗?**
A: 没有。它只是把通信 kernel 入队到 stream,异步执行。要 `cudaStreamSynchronize` 或靠后续 kernel 在同 stream 上的依赖才算完成。

**Q: 为什么我的多机训练 NCCL 很慢?**
A: 常见原因:① 走了错误网卡(设 `NCCL_SOCKET_IFNAME`/`NCCL_IB_HCA`);② 没开 GDR(`NCCL_NET_GDR_LEVEL`);③ 拓扑探测不全(容器里 `NCCL_TOPO_DUMP_FILE` 导出对比);④ 小消息用了 Ring(应让 Tree 接手)。先 `NCCL_DEBUG=INFO` 看它实际选了什么算法/协议/网卡。

**Q: 单机多卡和多机有什么区别?**
A: 单机内走 P2P(NVLink/PCIe)或 SHM,延迟带宽都好;多机那一跳走 NET,需要 proxy 线程 + 网卡,是性能关键。算法上多机更可能用 Tree/CollNet。

**Q: 一个进程能管多块 GPU 吗?**
A: 能,用 `ncclCommInitAll` 或把多次 `ncclCommInitRank` 包进 `ncclGroupStart/End`。但主流框架(PyTorch DDP)是"一进程一卡"。

**Q: NCCL 和 MPI 冲突吗?**
A: 不冲突,常配合:用 MPI 广播 `ncclUniqueId`、做进程管理,用 NCCL 做 GPU 集合通信。

**Q: 为什么要开多条 channel?调它有用吗?**
A: 多 channel 把带宽和 SM 都吃满。一般信任自动值;带宽打不满时可试 `NCCL_MIN_NCHANNELS` 调高,但占 SM,需权衡。

**Q: LL / LL128 / Simple 我该关心吗?**
A: 通常不用手动选,调优模型按消息大小自动定。NVLink 集群上 LL128 很常见;若怀疑选错可用 `NCCL_PROTO` 临时验证。

**Q: CUDA Graph 对 NCCL 有用吗?**
A: 有,尤其小消息高频训练:把通信 launch 录进图重放,省掉每次 enqueue 的 CPU 开销(第 08 章)。

---

## 3. 环境变量速查表

完整的、经源码核实的 NCCL_* 环境变量速查表在 [11 调优与性能模型 §4](<./11-tuning-and-perf.md>)。最常用的三个:

| 变量 | 作用 |
|------|------|
| `NCCL_DEBUG=INFO` | **排障第一招**:打印拓扑、算法/协议、网卡、GDR |
| `NCCL_TOPO_DUMP_FILE=t.xml` | 导出探测到的拓扑,核对是否探全 |
| `NCCL_SOCKET_IFNAME` / `NCCL_IB_HCA` | 指定走哪张网卡(多机性能关键) |

---

## 4. 各章一句话回顾

| 章 | 一句话 |
|----|--------|
| 00 | NCCL = GPU 原生的集合通信库,AllReduce 是数据并行的命门 |
| 01 | 7 类原语 + communicator/rank;AllReduce = ReduceScatter + AllGather |
| 02 | 控制面(CPU)/数据面(GPU)/proxy 三分;ncclComm→channel→connector→transport |
| 03 | uniqueId 是 rank0 门牌号;bootstrap 环 all-gather;initTransportsRank 五阶段 |
| 04 | 探测拓扑成带权图,按 PATH_* 偏好搜出最优环/树 |
| 05 | Ring AllReduce 2(N−1) 步,通信量 ≈2S 与 N 无关 → 带宽最优 |
| 06 | Tree O(log N) 延迟,double tree 补满带宽;调优模型按 time 自动选 |
| 07 | P2P(IPC 零拷贝)/SHM/NET(proxy+GDR),按优先级选 |
| 08 | API→task→plan→work FIFO→cuLaunchKernel;CUDA Graph 摊薄开销 |
| 09 | 一 block 一 channel;head/tail FIFO 同步;Simple/LL/LL128 三协议 |
| 10 | proxy 线程替 GPU 收发跨机网络包 |
| 11 | 算法/协议自动选 + NCCL_* 调优排障 |

---

## 5. 源码阅读路线(回顾)

```
src/nccl.h.in       → 对外 API 长相
src/collectives.cc  → 每个原语收敛到 ncclEnqueueCheck
src/init.cc         → ncclCommInitRank 建场全过程
src/bootstrap.cc    → 环 all-gather 握手
src/graph/          → 拓扑探测 + 求环/树(topo/paths/search/rings/trees)
src/transport/      → P2P/SHM/NET 实现
src/enqueue.cc      → 调用→plan→launch
src/device/         → GPU kernel + prims + 协议
src/proxy.cc        → 网络收发后台推进
```

> v2.30.7 新方向(主线之外):`nccl_device/`(设备发起通信)、`rma/`(Put/Get/Signal)、`gin/`(GPU Interconnect)、`scheduler/`(对称 kernel)。想跟进 NCCL 演进可从这些目录入手。

---

**上一章** ← [11 调优与性能模型](<./11-tuning-and-perf.md>)　|　**返回** → [NCCL 教程总索引](<./index.md>)
