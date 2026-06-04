# image_tool — Grace SoC 固件镜像打包工具

## 简介

image_tool 是面向 AIGCIC grace SoC 的固件镜像打包工具，支持 Windows 和 Linux 平台。主要功能：将各分区 `.bin` 文件按 Flash 布局配置打包，支持 RSA/SM2 签名和 CRC-16/CRC-32 校验，最终生成用于烧录的 `.bin` 与 `.hex` 文件。

---

## 仓库结构

```
image_tool/
├── grace/
│   ├── build_image_new.py      # 权威源文件（所有修改在此进行）
│   ├── build_image.py          # 部署拷贝（Linux 使用，与 build_image_new.py 保持同步）
│   └── build_image.spec        # PyInstaller 打包配置（含 gmssl hiddenimports）
├── _apply_changes.py           # 部署辅助脚本：将修改同步到 build_image.py 并生成 readme.txt
├── write_files.py              # 仅生成 readme.txt（早期脚本）
├── architecture.md             # 架构说明文档
└── README.md                   # 本文件
```

---

## 运行时目录结构（grace/ 完整部署包）

工具运行需要以下 SDK 模块，部署时须确保 `grace/` 目录包含所有子目录：

```
grace/
├── build_image.py              # 主入口脚本
├── build_image.exe             # Windows 可执行文件（PyInstaller 编译）
├── build_image                 # Linux  可执行文件（PyInstaller 编译）
├── build_image.spec            # PyInstaller 打包配置
├── include/
│   └── image.py                # 公共常量与工具函数
├── src/
│   ├── flash_layout.json       # Flash 布局默认配置
│   ├── entry_table.json        # Entry table 配置
│   ├── parse_flash_layout.py   # 解析 Flash 布局 JSON
│   ├── generate_bin_file.py    # 生成最终 bin 文件
│   ├── parse_csv.py            # 解析 CSV 产品参数表
│   └── generate_entry.py       # 生成 entry table allinone
├── emu/
│   └── bin2hex.py              # bin 转 Intel HEX
├── secure/
│   ├── generate_key.py         # 生成 RSA / SM2 密钥对
│   ├── sign_image.py           # 对 bin 文件执行签名
│   └── crypto/
│       └── sm2.py              # SM2 算法实现（依赖 gmssl）
├── verify/
│   └── read_bin_file.py        # debug 模式：读取并校验 bin
├── table/
│   └── excel2csv.py            # 将 .xlsx 拆分为 CSV
├── image/                      # 待打包的各分区 bin 文件（输入目录）
└── output/                     # 生成的 bin、hex 及公钥哈希（输出目录）
```

> **注意：** `include/`、`src/`、`emu/`、`secure/`、`verify/`、`table/` 不在本仓库，属于独立的 grace SDK 部署包。

---

## 依赖安装

```bash
pip3 install cryptography gmssl openpyxl
```

---

## 默认参数

所有参数均有默认值，直接运行工具按回车即可使用默认配置：

| 参数 | CLI 参数 | 默认值 | 可选值 |
|------|----------|--------|--------|
| 运行模式 | `-m` / `--mode` | `normal` | `normal`, `entry`, `debug` |
| 板型 | 交互式输入 | `grace` | 任意字符串 |
| 签名算法 | `-k` / `--key` | `rsa` | `rsa`, `sm2` |
| CRC 类型 | `-c` / `--crc` | `crc16` | `crc16`, `crc32` |
| 固件版本 | `--fw-version` | `10102`（v1.1.2）| 整型，格式见下 |
| Flash 布局文件 | `-j` / `--json` | `src/flash_layout.json` | JSON 文件路径 |
| 输出文件名 | `-o` / `--output` | 自动生成 | 字符串 |
| 跳过签名 | `--no-sign` | False | flag |
| 跳过 HEX | `--no-hex` | False | flag |

---

## 使用方法

### 交互式运行（推荐，回车使用默认值）

```bash
# Windows
build_image.exe

# Linux（PyInstaller 编译版）
./build_image

# Linux（直接运行 Python 脚本）
python3 build_image.py
```

启动后依次出现 5 个提示，全部回车即使用默认配置：

```
Input mode ['normal', 'entry', 'debug'] [normal]:      ← 直接回车
Board type [grace]:                                     ← 直接回车
Signature algorithm ['rsa', 'sm2'] [rsa]:              ← 直接回车
CRC type ['crc16', 'crc32'] [crc16]:                   ← 直接回车
Version of firmware [10102]:                           ← 直接回车
Firmware version 1.1.2
```

### 命令行参数运行

```bash
# 指定签名算法、CRC类型、版本号
build_image.exe -m normal -k rsa -c crc16 --fw-version 10102

# SM2 签名 + CRC32
python3 build_image.py -k sm2 -c crc32

# 生成 entry 模式
python3 build_image.py -m entry -c crc16

# debug 模式（校验已有 bin）
python3 build_image.py -m debug
```

### 预期输出

```
output/image_v1.1.2_gracec.bin    ← 最终 bin 镜像
output/image_v1.1.2_gracec.hex    ← Intel HEX 格式（用于烧录工具）
output/rsa_*_public_*hash*        ← RSA 公钥哈希文件
```

---

## 运行模式说明

| 模式 | 用途 | 主要步骤 |
|------|------|---------|
| `normal`（默认）| 打包固件，生成 bin + hex | ① 生成 qspi_xip 表 → ② 生成签名密钥对 → ③ 签名 → ④ 打包 bin → ⑤ 转 hex |
| `debug` | 读取并校验已有 bin 文件 | 解析 verify/ 目录中的 bin，打印分区信息 |
| `entry` | 生成 entry table allinone | 读取 table/*.xlsx，生成 entry bin |

**normal 模式输入要求：**
- 各分区 `.bin` 文件放在 `grace/image/` 目录
- `grace/table/` 目录下放置 `qspi_xip_table*.xlsx` 产品参数表

**debug 模式输入要求：**
- 待校验的 bin 文件放在 `verify/` 目录

**entry 模式输入要求：**
- 产品参数表放在 `grace/table/` 目录
- 若新增 SKU，在 `grace/table/board.json` 中添加 SKU 信息

---

## 版本号格式

版本号采用整型传入，格式为：`Major × 10000 + Minor × 100 + Patch`

| 版本 | 整型值 |
|------|--------|
| v1.1.2 | 10102 |
| v2.0.0 | 20000 |
| v1.3.5 | 10305 |

---

## 生成 build_image.exe / build_image 可执行文件

### 前提条件

在执行打包前，确保以下条件满足：

| 条件 | Windows | Linux |
|------|---------|-------|
| Python 版本 | Python 3.8+ | Python 3.8+ |
| PyInstaller | `pip install pyinstaller` | `pip3 install pyinstaller` |
| 运行时依赖 | `pip install cryptography gmssl openpyxl` | `pip3 install cryptography gmssl openpyxl` |
| 运行时模块 | `grace/` 目录须包含完整 SDK 子目录（见下） | 同左 |

**必须保证 `grace/` 目录下已部署以下 SDK 子目录（打包时静态收集）：**

```
grace/
├── include/     ← image.py
├── src/         ← parse_flash_layout.py, generate_bin_file.py 等
├── emu/         ← bin2hex.py
├── secure/      ← generate_key.py, sign_image.py, crypto/sm2.py
├── verify/      ← read_bin_file.py
└── table/       ← excel2csv.py
```

---

### 方法一：手动使用 PyInstaller（推荐）

**必须使用 `build_image.spec`，不可直接打包 `.py` 脚本。**

原因：`gmssl` 通过动态导入加载子模块，PyInstaller 静态分析无法自动检测以下导入链：

```
secure/generate_key.py → secure/crypto/sm2.py → from gmssl import sm2, sm3, func
```

`build_image.spec` 已声明 `hiddenimports=['gmssl', 'gmssl.sm2', 'gmssl.sm3', 'gmssl.func']`，避免运行时报 `ModuleNotFoundError: No module named 'gmssl'`。

#### Windows 生成 build_image.exe

```bat
cd grace
pyinstaller build_image.spec
:: 输出：dist\build_image.exe
copy dist\build_image.exe .
:: 清理临时目录（可选）
rmdir /s /q dist build
del build_image.spec.bak 2>nul
```

完成后 `grace\build_image.exe` 即为可分发的独立可执行文件。

#### Linux 生成 build_image

```bash
cd grace
python3 -m PyInstaller build_image.spec
# 输出：dist/build_image
cp dist/build_image .
chmod +x build_image
# 清理临时目录（可选）
rm -rf dist build
```

完成后 `grace/build_image` 即为可分发的独立可执行文件。

> **注意**：Linux 上 `pyinstaller` 命令可能不在 PATH 中，请使用 `python3 -m PyInstaller`。

---

### 方法二：使用 build_exe.py 自动化打包

`release/build_exe.py` 封装了完整的打包流程，自动完成：生成可执行文件、拷贝到 `grace/`、清理临时目录。

```bash
# 在 release/ 目录下执行
cd release
python build_exe.py      # Windows
python3 build_exe.py     # Linux
```

脚本执行流程：
1. 进入 `grace/` 目录
2. 删除旧的 `build_image.exe` / `build_image`
3. 执行 `pyinstaller build_image.spec`（Linux 使用 `python3 -m PyInstaller`）
4. 将 `dist/build_image[.exe]` 复制到 `grace/`
5. 清理 `dist/`、`build/` 临时目录（保留 `build_image.spec`）

---

### 打包产物

| 平台 | 输出文件 | 说明 |
|------|----------|------|
| Windows | `grace\build_image.exe` | 独立可执行文件，无需安装 Python |
| Linux | `grace/build_image` | 独立可执行文件，无需安装 Python |

打包完成后可将 `grace/` 目录（含所有 SDK 子目录和可执行文件）复制给最终用户，无需安装 Python 或任何依赖。

---

## 文件同步规则

修改代码时，`build_image_new.py` 为权威源文件，修改后需同步到两处：

```
grace/build_image_new.py
    ↓ 手动同步内容
_apply_changes.py（build_image_content 字符串）
    ↓ python3 _apply_changes.py（自动写入）
grace/build_image.py
```

**操作步骤：**

1. 修改 `grace/build_image_new.py`
2. 将相同改动同步到 `_apply_changes.py` 中的 `build_image_content` 字符串
3. 运行 `python3 _apply_changes.py` 自动生成 `grace/build_image.py` 和 `readme.txt`

---

## 常见问题

### 提示"缺少必要的运行时模块"

```
[ERROR] 缺少必要的运行时模块，build_image 无法启动。
```

**原因**：`grace/` 目录下缺少 SDK 模块包（`include/`、`src/` 等子目录）。
**解决**：将完整的 grace SDK 部署包中的子目录拷贝到 `grace/` 目录下。

### 运行 PyInstaller 编译版报 `ModuleNotFoundError: No module named 'gmssl'`

**原因**：打包时直接使用 `pyinstaller build_image.py`，未用 spec 文件。
**解决**：改为 `pyinstaller build_image.spec`。

### 提示 `Excel xlsx file; not supported`

**原因**：系统安装了 `xlrd` 2.x，该版本不再支持 `.xlsx` 格式（仅支持旧版 `.xls`）。
**解决**：确认 `table/excel2csv.py` 已升级为使用 `openpyxl`，并执行 `pip3 install openpyxl`。

### 提示 `Don't support OS`

**原因**：工具仅支持 `win32` 和 `linux`，不支持 macOS 等系统。
