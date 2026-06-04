# 07 术语与问答索引

## 术语表

| 术语 | 含义 |
|---|---|
| CP | Kernel dispatch/control processor，向 GCtrl 下发 kernel 包。 |
| GCtrl | Global/cluster control，负责 kernel 拆分、physical cluster 分配、done 回收。 |
| GlbCtrl | GCtrl 中面向全局 kernel 调度的模块。 |
| ClsCtrl / ClusCtrl | Cluster 控制模块，将 logic cluster 拆成 block 并分发给 core。 |
| RguCore | SIMT 计算核，执行 warp/block 指令。 |
| UCore | Core 内标量控制和向量预处理前端。 |
| Warp | SIMT 基本执行单元。 |
| Logic Cluster | kernel 按 `gridDim/clusDim` 拆出的逻辑 cluster。 |
| Physical Cluster | 硬件中的实际 cluster 资源。 |
| Block | ClsCtrl 下发给 core 的执行粒度。 |
| SHM | Shared Memory，32 bank * 4 sbank，总 256KB。 |
| TMA | 外存与 SHM/GLB 间的数据搬运单元。 |
| LSU | RegFile 与 GLB/SHM 间的访存执行单元。 |
| SIMT Stack | 维护分支分歧、汇聚点、PC、tmask、优先级的控制结构。 |
| tmask | SIMT 线程执行掩码。 |
| CCTL | cache 控制指令，如 flush/invalid。 |
| TryWait | SHM 同步/等待类指令，可能阻塞同 warp 后续写。 |

## 快速问答索引

### RGU 整体怎么跑一个 kernel？

CP 下发 kernel packet，GCtrl 解析并拆成 logic cluster，分配 physical cluster 后发 reg info 和 clusterIdx；ClsCtrl 再拆成 block，选择 core 下发；Core 内 warp 执行，完成后 ack 回 ClsCtrl/GCtrl，最终产生 kernel done。

### GCtrl random 和 fixed 分发有什么区别？

random 由硬件根据可用 cluster 和模式动态选择 physical cluster，适合弹性利用资源；fixed 按映射公式从 logic cluster 坐标直接算 physical cluster，更确定但更依赖软件/配置合理性。

### 为什么一个 physical cluster 不能同时跑多个 kernel？

文档把 physical cluster 的 kernel 执行状态作为互斥资源维护。每个 physical cluster 同时只能执行 1 个 kernel，避免 reg info、block 状态、done 回收和 core 资源归属混乱。

### UCore 主要卡顿点在哪里？

常见卡点包括 UCheck 数据依赖、共享计算资源竞争、SIMT stack 缓存满、控制类指令等待第二拍、U 域 upred/ipred 等固定延迟抽象、ICache/CCache 仲裁和搭车。

### SHM 为什么容易有死锁风险？

SHM 同时服务普通线程访问、AXI、cache、TMA、atom。如果 AsyncCopy/TMA 读数据堆积并填满流水线，而写路径又依赖同一 SHM 资源前进，就会形成读写互等。

### kernel done 是否意味着所有数据都安全？

不一定。需要确认 warp 执行、SHM outstanding、TMA/AsyncCopy、cache flush/invalid、CCTL 响应和异常状态都收敛。文档多处强调 block/kernel 结束可配置等待访存状态。

### 异常之后一定复位吗？

常规异常不要求 core 复位，可按 `ecp_report/ecp_stall` 配置上报或 stall。卡死等特殊情况才需要考虑至少 cluster 级复位。

## 后续提问建议

你后续可以直接按这些方向问：

- “GCtrl 的 max_clus_num 怎么算？”
- “random mode 0/1 有什么性能差异？”
- “UCore 的 SIMT stack 如何处理分支汇聚？”
- “SHM trywait 为什么会阻塞同 warp 写？”
- “kernel done 和 cache/TMA 完成之间有什么关系？”
- “distributed SHM 访问为什么需要 barrier？”
- “如果出现执行卡死，软件和硬件分别应该看什么状态？”

我会优先从这个 wiki 的结构回答，再回到原始 docx 抽取文本核对细节。
