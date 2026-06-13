---
type: note
title: "aigc_ioctl 两级派发"
created: 2026-06-13
updated: 2026-06-13
tags:
  - kmd
  - ioctl
status: active
source:
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/aigc_ioctl.c"
  - "shuaishuai.zhu@192.168.80.116:~/ajthunk/kmd/aigc/kmdlib/aigc_fops.c"
---

# aigc_ioctl 两级派发

**文件**: `kmd/aigc/aigc_ioctl.c`（入口/校验）、`kmd/aigc/kmdlib/aigc_fops.c`（派发/处理）
**关联**: [[wiki/kmd/ioctl/ioctl-abi]] | [[wiki/kmd/arch/request-path]]

> 一条命令在抵达处理函数前要经过两张表。第一级在 Linux fops 层只做**校验**，第二级在可移植核心层只做**派发**。

---

## 第一级 —— Linux fops 层（`aigc_ioctl.c`）

`aigc_ioctl()` 接进 `/dev/aigcN` 的 `file_operations.unlocked_ioctl`，只做校验：

1. 解码 `nr = _IOC_NR(cmd)` 与 `param_size = _IOC_SIZE(cmd)`。
2. 若 `nr` 超出 `aigc_ioctl_tbl[]` 范围，**或**表项 `.cmd` 与传入 `cmd` 不完全相等 → `-EINVAL`。
   「精确匹配」意味着：编号对、但方向/大小编码不对的请求也会被挡掉。
3. 把 `file->private_data`、`nr`、`param_size`、用户缓冲指针打成 `struct aigc_ioctrl_params`，调 `aigc_lib_ioctl()`。

这里的 `aigc_ioctl_tbl[]` 是**名字/校验表**：包含 `common/include/aigc_ioctl_tab.h`，把
`AIGC_IOCTL_DESC` 定义成在下标 `_IOC_NR(name)` 处放 `{ .name = "AIP_…", .cmd = name_IOCTL }`。

## 第二级 —— 可移植 kmdlib 核心（`aigc_fops.c`）

`aigc_lib_ioctl()`（`aigc_fops.c:3831`）是 Linux 层唯一调用的入口。它用 `ctrl_params->cmd`（即 `AIP_*` 编号）
索引一张**处理函数表**，空槽 `-EINVAL`，命中就转发 `(private_data, buf)` 给对应 `aigc_ioctl_*`。这里
`private_data` 是每 fd 的 [[aigc_vdev]]，`buf` 是用户参数指针；处理函数用 `os_memcpy_from_user` /
`os_memcpy_to_user` 进出参数。

这张表来自**同一份** `aigc_ioctl_tab.h`，但把 `AIGC_IOCTL_DESC(_ioctrl, _func)` 展开成 `[_ioctrl] = _func`。
**用同一个 X-macro 列表生成两张表，是这套设计的关键**——名字、编号、处理函数三者锁步同步。

```
ioctl(fd, AIP_*_IOCTL, &args)
        │
        ▼
aigc_ioctl()        (aigc_ioctl.c)  ── 校验 _IOC_NR + 精确 cmd 匹配
        │
        ▼
aigc_lib_ioctl()    (aigc_fops.c)   ── 索引 [AIP_x] = handler
        │
        ▼
aigc_ioctl_<op>()   (aigc_fops.c)   ── 拷参数，干活
```

## 给应届生的两个「为什么」

- **为什么入口层只校验不干活？** 把畸形/版本不匹配的请求挡在核心层外，让核心层可以假设「参数已经合法」，
  逻辑更干净；而且 fail closed（`-EINVAL`）比带错参数往里冲安全得多。
- **为什么用 X-macro 而不是两个手写 switch？** 手写两份很容易改一处漏一处，出现「校验认得、派发不认得」的
  裂缝。X-macro 让一份列表生成两张表，从机制上杜绝漂移。

## 延伸

- [[wiki/kmd/ioctl/ioctl-abi]]：操作表全清单与 ABI 稳定性。
- [[aigc_vdev]]：`private_data` 是什么。
