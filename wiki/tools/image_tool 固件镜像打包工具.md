---
type: topic
title: "image_tool 固件镜像打包工具"
created: 2026-05-09
updated: 2026-05-09
tags:
  - image-tool
  - firmware-image
  - pyinstaller
status: active
---

# image_tool 固件镜像打包工具

image_tool 的两篇文档分别覆盖用户使用说明和架构说明。它用于 Grace SoC 固件镜像打包，涉及签名、CRC、normal/entry/debug 模式、PyInstaller 打包和服务器工作流。

## 阅读顺序

1. 先读 README，掌握运行模式、默认参数、输入输出和打包命令。
2. 再读 architecture，理解模块依赖、运行时目录、数据流和开发工作流。
3. 修改工具时同步更新 README 与架构文档，避免用户流程和内部结构脱节。

## 关联主题

- [[AI 协作远程编辑经验]]：image_tool 维护时默认服务器直接编辑，提交需要明确批准。

## 来源

- **image_tool 架构文档** — `.raw/local-md/C-home-shuaishuai.zhu/image_tool\architecture.md`
- **image_tool — Grace SoC 固件镜像打包工具** — `.raw/local-md/C-home-shuaishuai.zhu/image_tool\README.md`