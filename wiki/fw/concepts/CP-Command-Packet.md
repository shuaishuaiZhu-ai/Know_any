---
type: entity
title: "CP-Command-Packet"
created: 2026-05-09
updated: 2026-05-09
tags: [entity, cp, packet]
status: active
source:
  - "[[GraceC CP MAS v1.4]]"
  - "[[fw CP user firmware code summary]]"
---

# CP-Command-Packet

> CP command packet 由 host/UMD/KMD 写入 ringbuffer，经 HCQD fetch 后交给 CP firmware 或 iDMA 分发。

## Header 结构

代码中的 `cmd_pkt_hdr_t` 包含：

- `type[7:0]`：operator id。
- `body_size[12:8]`：body word 数，header+body 最多 32 words。
- `hcqd_id[17:13]` 和 `asic_id[22:18]`：CP firmware/hardware 识别字段。
- `block_mask[27:24]`：等待下游 OSD 资源时使用。

## Operator id

| 类型 | operator id | 处理 |
|---|---:|---|
| Job | `0x10` | [[iDMA]] -> CLS FIFO |
| SDMA | `0x11` | [[iDMA]] -> SDMA FIFO |
| VPU | `0x12` | 预留/映射到 VPU |
| Atomic add/swap/cmp_swap | `0x20/0x21/0x22` | [[iDMA]] -> ATO FIFO；cmp_swap 有 retry/consume 差异 |
| Event signal/wait | `0x30/0x31` | [[CP-Firmware-CPE]] 处理并访问 [[Event-Table]] |
| Wait_Host | `0x40` | firmware trig/poll/fence |
| NOP | `0xEE` | firmware read + finish |

## 延伸

- [[CP command processing flow]]
- [[CP event atomic wait host handling]]
- [[Interaction-Buffer]]
