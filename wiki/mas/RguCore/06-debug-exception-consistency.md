# 06 异常、调试与一致性

## 异常处理模型

Sys 文档把常规异常设计为“Core 无需复位”，通过两个属性控制：

- `ecp_report`：是否上报。
- `ecp_stall`：是否让当前 core 进入 stall。

异常编码：

| 编号 | 含义 |
|---:|---|
| 0 | 指令校验错误 |
| 1 | 指令访问越界 |
| 2 | 除 0 异常 |
| 3 | NaN 异常 |
| 4 | TRF 访问越界 |
| 5 | SHM 访问越界 |
| 6 | 地址违反对齐要求 |
| 7 | 访存 Error_response |
| 8 | 执行卡死，长时间不动 |

## 软件响应策略

异常中断上报到 GCtrl 后继续上报给软件。软件可选择：

- 清除异常 core 的 stall 状态并继续执行。
- 控制当前进程进入 early stop。
- 对仍在 GCtrl 缓存中的 kernel 直接返回响应。
- 对正在 Core 执行中的 kernel 进入 early stop，快速返回 kernel done。
- 控制当前进程进入 stall。
- 让所有执行当前进程 kernel 的 core 进入 stall。

## 特殊卡死与复位

对于特殊情况如卡死，文档建议至少考虑 cluster 层面的整体复位，由 SoC 层面统一考虑：

- 控制通路完整性，如 AXI-L 和配置 NOC。
- 结束 kernel 分发。
- 数据通路完整性，如 AXI 读写和配置 NOC。

## 调试模式

系统支持多层调试：

- 直接控制 GCtrl 执行一个 kernel。
- 直接控制 ClsCtrl 执行一个 cluster。
- 直接控制 Core 执行一个 block。
- 配置 core 寄存器，选择 warp 单步执行或断点调试。
- 设置 debug mode、break point、debug action。
- 通过寄存器接口读取 core 运行状态、寄存器堆内容、存储器内容。

调试注意：

- 直接控制下级模块时，需要配置无响应模式，避免给上级返回不合理 ACK。
- 完成判断依赖 polling 状态，不应默认沿用正常调度 done 路径。

## 一致性与保序

常见一致性边界：

- block 切换时，新 block 对 SHM 的访问必须等待前一个 block 的异步 SHM 访问完成。
- kernel 切换时要等待所有 warp 完成并处理 cache flush/invalid。
- LSU 对下游 GLB/SHM 保序。
- 同步指令到 TMA 的顺序要特别处理。
- CCTL 必须返回响应，才能判断 cache 操作实际完成。

## 提问时的排查顺序

后续如果问“为什么 done 了但数据不对”，优先按这个顺序查：

1. kernel/block/warp done 条件是否只覆盖执行 pipe，没覆盖访存 pipe。
2. SHM/TMA/AsyncCopy 是否仍有 outstanding。
3. cache flush/invalid 是否完成并有响应。
4. GCtrl/ClsCtrl/Core 的 ACK 是否是正常路径产生，还是 debug/direct 模式下误回。
5. 异常是否被配置为不上报或不 stall。
