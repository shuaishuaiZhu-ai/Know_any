# 03 RguUCore 标量控制前端

## 职责

RguUCore 处理 SIMT 执行中的标量侧逻辑：

- 处理标量指令，进行标量计算和 PC 跳转控制。
- 对向量指令进行预处理，生成 `uinfo`、r 地址、控制信息等。
- 从 WarpDisp 获取子任务及参数。
- 从 ICache 取指。
- 向 Scheduler 输出向量指令预处理信息。

一个 RguUCore 支持 16 个 warp，同时拆为 2 个 RguSubUCore，每个 RguSubUCore 支持 8 个 warp。

## 功能需求

文档列出的指令能力包括：

- 控制类：NOP、BPT、BAR、FENCE、BRA、LOOP、JMP、SWAPPC、GETPC、SETMASK、EXIT。
- 标量计算：UALU、UBitwise。
- 依赖与访存预处理：解码、立即数访问、mov/LDST tid 处理。
- PC 跳转控制。
- UR/SR 配置。
- ICache 取指与 LOOP 取指优化。
- tmask 计算。
- SIMT STACK。
- U 域结果前传。
- 多路 CCACHE/ICACHE 请求仲裁。
- 多路 TMA 仲裁、任务包完整流控。

## 模块组成

RguUCore 包含：

- `UBuff`：取指与预取。
- `UCheck`：判断数据依赖和资源冲突。
- `UCtrl`：控制 PC 跳转、生成 tmask、处理标量控制指令、维护 SIMT stack。
- `Urf`：访问 UR/USR/UP，处理立即数替换，提供 UVAL。
- `EFifo`：向量指令解码与缓存。
- `Uniform`：处理标量计算指令，多个 warp 竞争共享计算资源。
- `UMonitor`：监控共享资源占用，反馈给 UCheck。
- `SIMT STACK SRAM`：存储多个 warp 的 stack 情况。
- `RguCCacheArb`：仲裁多路 ULDC 请求。
- `RguICacheArb`：仲裁多路取指请求。

## UBuff

UBuff 负责向 cache 发起取指和预取请求，并向下游返回目标指令。

关键规则：

- 当目标 PC 不在当前 cache line 时发起取指。
- 当目标 PC 的后续 8 条不在预取 cache line 时发起预取。
- 不重复取指：一条请求未返回前，不重复发相同请求。
- Loop end 在预取 cache line 时，不再预取直到 loop 结束。
- 只接收最后一次请求的响应，因为预取本质是预测，最新请求更准确。

## UCheck

UCheck 判断指令是否可执行，主要检查：

数据依赖：

- URF 写后读、写后写。
- Ipred 写后读。
- Upred 在当前设计中因 1 周期配置假设，一般不认为有冲突。
- Carry 固定 stage 产生与使用，一般不认为有冲突。

资源冲突：

- UDP 出口冲突。
- Sequence 独占计算资源冲突。
- Stack 高速缓存满。
- 多 warp 竞争 UDP。

## UCtrl

UCtrl 处理 PC 跳转和 tmask。指令不能执行主要分两类：

- `check_ok` 不满足，输入或资源没有准备好。
- `pc_vld` 相关的执行延迟，比如 stack 无法及时提供数据、非流水控制指令需要额外拍、U 域 upred/ipred 需要等待。

tmask 来源随指令类型变化：

- ctrl 类指令：来自 `tpred_reg/ipred_reg`。
- U 域其他指令：来自 `tpred/ipred_reg`。
- R 域指令：来自 `tpred`。

## SIMT Stack

SIMT Stack 存储：

- 各分支汇聚点。
- 各分支 PC。
- 执行掩码 tmask。
- 分支优先级。

它通过有序列表选择表头分支执行，以维护 SIMT 分歧和汇聚。为了支持一条 branch 指令单周期快速出入栈，stack 拆成多个子栈，可支持同时入栈 3 项、出栈 1 项。

## UCore 学习重点

后续提问时最可能涉及这些点：

- UCheck 为什么卡住一条指令。
- 某条控制指令为什么多等一拍。
- Loop/branch/jump 对 PC 和 tmask 的影响。
- SIMT Stack 在分歧、汇聚、空转 loop 中的行为。
- ICache/CCache 仲裁中的乱序返回和搭车机制。
