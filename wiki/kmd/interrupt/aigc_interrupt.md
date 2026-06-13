---
type: note
title: "aigc_interrupt — MSI-X 处理"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - interrupt
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_interrupt.c"
---

# aigc_interrupt — MSI-X 处理

**文件**: `kmd/aigc/kmdlib/aigc_interrupt.c`
**关联**: [[wiki/kmd/interrupt/index|中断与 Fence]] | [[aigc_kmd_fence]]

> GPU 抬 **MSI-X** 中断；处理分两段（上半部/下半部），固件 ack 走线程化处理。

---

## 向量表（已知向量）

| 向量 | 来源 |
|---|---|
| 39 | CP TCU |
| 40 | CP event-signal（计算引擎完成/事件） |
| 41 | CP error |
| 46 / 50 / 54 / 58 | Cluster 0..3 L2-cache 错误 |
| 47 / 51 / 55 / 59 | Cluster 0..3 buffer-die / PA-ECC 错误 |
| 48 / 52 / 56 / 60 | Cluster 0..3 TSV 错误 |
| 49 / 53 / 57 / 61 | Cluster 0..3 TCU |
| 109 | IMC 固件 ack（线程化） |
| 111 | CP 固件 ack / test（线程化） |

## 上半部（`aigc_lib_irq_*`）

每向量跑：读并清向量的硬件状态（`aigc_clear_irq_stage2()` 清位并重读确认线已静默），错误源则把抬条件的引擎
在 `lib_dev->engines_bitmap` 里置位。返回值 `need_bottom_half` 告诉 OS 层是否需要下半部。

> **给应届生：为什么要分上/下半部？** 上半部在硬中断上下文，必须**短**（清状态、记个位就走），否则会拖住整个
> 系统的中断；真正耗时的「翻译成事件、通知用户」放到下半部（workqueue）里慢慢做。这是 Linux 中断处理的铁律。

## 下半部（`*_bh`）

把引擎位翻成事件。对每个置位的引擎，一张 `EngineMapEvent` 表把引擎下标映到事件码（如
`aigc_lib_irq_cp_err_bh` 把 GCTRL/SDMA 错误位映到 `INSTR_PARITY_ERROR`/`SDMA_ERROR`…；`aigc_lib_irq_tcu_bh`
把 TCU 故障映到 `PTE_NON_INVALID` 等），经 `record_irq_event()` 发出，再清位。

`record_irq_event()` 造一个 `EventGpuInfo`（info 字 + 时间戳），推给每个注册了 **event tracker** 的 vdev
（`tracker_record_irq_event()`）——这就是事件经 ioctl ABI 轮询到达用户态 tracker 的方式。

## 线程化处理（固件 ack）

这类处理**信号固件命令完成**，而非 GPU 事件：

- `aigc_lib_irq_thread_fn_111`：读 CP 响应消息（`aigc_hal_read_cp_resp_msg`），走 `wait_cp_ack_ctx_head` 链；
  匹配到 create-queue/destroy-queue/stop-schedule 事件就摘下等待者、释放其信号量，唤醒阻塞在该固件命令上的进程。
- `aigc_lib_irq_thread_fn_109`：对 IMC 固件 ack 做等价处理，先拷回结果字段（reset 位图、fw-update 百分比/状态、
  phase）再释放 IMC 等待者。

## 延伸

- [[wiki/kmd/interrupt/index|中断与 Fence]]：事件环全景。
- [[aigc_kmd_fence]]：向量 40 + 时间戳怎么释放等待者。
- [[wiki/kmd/queue/aigc_sched]]：进度中断怎么唤醒调度 kthread。
