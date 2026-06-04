# 04 RguSHM 共享内存

## 职责

RguSHM 是访存系统的一部分，负责多路、多线程访问共享内存，处理 bank 映射、冲突拆分、读写响应、原子操作、AXI 访问和 cache 复用 SRAM 访问。

## 容量与组织

文档给出的 SHM 组织：

- 32 个 bank。
- 每个 bank 分为 4 个 sbank。
- 每个 sbank 容量 2KB，即 `512 * 32b`。
- 总容量为 `2KB * 32 * 4 = 256KB`。
- 地址先在 bank 维度 interleave，再在 sbank 维度 interleave。

## 模块组成

- 4 个 `RguShmPort`：处理常规线程访问，完成线程地址到 bank 地址映射，解决 bank 冲突，把一笔请求拆成多笔无冲突 bank 请求，收集并重排读回数据，维护写响应。
- 1 个 `RguShmExt`：将 AXI 请求转换为 SRAM/bank 请求；AXI 访问天然无 bank 冲突，不需要按线程拆分。
- 1 个 `RguShmMem`：处理 cache 对 SRAM 的访问，请求接收带反压，读请求 3 周期返回。
- 32 个 `RguShmBank`：处理每个 bank 的访问，支持 atom 操作，可自动把 atom 拆成读和写；读延迟 3 周期。

## RguShmPort

RguShmPort 接收一条指令 per-thread 的请求，拆成 per-bank 请求。

关键机制：

- Queue 深度 4，用于 timing 隔离和 32 线程不均衡抹平。
- XBAR 将 32 线程信息拆到各 bank。
- 出现 bank 冲突时，一笔操作会被拆成多笔，直到整条指令全部下发。
- 支持读搭车：地址相同的线程可以共享读响应。
- 写响应只要对应 bank 写请求都下发即可返回，因为后续读一定能读到最新数据。

旁路 FIFO：

- Fifo0：保存 `tmask + ctrid`，用于收集读回数据并生成读响应携带信息。
- Fifo1：保存 `bankid + transid`，用于收集一条指令返回的 bank 数据。
- Fifo2：保存 `ins_num + ctrid`，用于记录写指令拆分条数并生成写响应。
- Fifo3：保存 thread mask，标记 bank 指令需要被哪些线程收走。

## CAS 与 TryWait

CAS 特殊点：

- 奇偶 bank 服务于一个线程，CAS 需要在 ABUFFER 奇偶 bank 出口同时出现并同时被接收。
- 需要同时满足相邻 bank 下游 ready，以及相邻 bank 无更高优先级 port 参与仲裁竞争。
- 非主 bank 不实际访问 sbank，相关 ack/resp 计数和 mask/counter 需要丢掉半边线程。

TryWait 特殊点：

- 同一个 warp 的 try wait 未完成前，会阻塞同 warp 后续写指令，避免后续写结果被 try wait 提前观察。
- SHMPort 维护 table 记录等待地址、warpid、tmask、ctrid 和下游 table id。
- 相同地址的 try wait 可合并，复用下游 table id。
- 相同 bank、不同地址的 try wait 会阻塞当前 try wait。
- nolimit 模式会产生 hardware timeout 强制返回；其他模式等待监控成功或 software timeout。

## RguShmExt

RguShmExt 将 AXI 接口请求转换为 32 bank 请求，并按需返回 AXI 读响应或 atom 附加写通道响应。

strb 抽象：

- `strb` 全 0 的线程请求仍下发至 ShmBank。
- 不写入，但要产生对应线程写响应。
- 对 atom 仍会有读返回值和读响应。

## RguShmMem

RguShmMem 让 cache 复用 SHM 内部 SRAM 资源：

- 接收读写两路请求。
- 仲裁选择一路广播给多个 bank。
- 读延时 3 周期。

## RguShmBank

RguShmBank 处理单 bank 的多 port 仲裁和 atom pipeline。

冲突类型：

- 不同 port 访问同 bank。
- atom 读改写路径和普通访问路径冲突。

Atom 的计算结果在前一拍回传至 Bank，占据独立竞争通道，且优先级最高；atom 可被拆成下一笔 atom 写。

## 死锁风险

文档明确指出 AsyncCopy/TMA 可能导致 SHM 内读写路径互相等待：

假设 TMA 从 `SHM[99:0]` 读出，再写到 `SHM[199:100]`。如果读数据积攒过多填满流水线，而写请求又被卡住，就会发生死锁。

拓展理解：

- 这是典型的同资源读写回环死锁。
- 解决方向通常是读写通道隔离、为读数据预留足够 buffer、对 TMA 写通路提供优先级提升或强制 drain 机制。
