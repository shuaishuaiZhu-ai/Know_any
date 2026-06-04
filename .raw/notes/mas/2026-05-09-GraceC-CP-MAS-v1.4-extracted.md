---
type: raw_extraction
source: "C:\work\mas\GraceC CP MAS_v1.4.docx"
title: "GraceC CP MAS v1.4"
created: "2026-05-09"
paragraphs: 617
tables: 52
---

# GraceC CP MAS v1.4 ????

> ?????`C:\work\mas\GraceC CP MAS_v1.4.docx`
>
> ???? docx ??/????????? llm-wiki ????? docx ?????

Version History List

<table-1>
| Version number | Author | Date | Description |
| 0.1 | Frank | 2024/12/10 | Initial version. |
| 0.2 | Frank | 2025/1/17 | 补充细节 |
| 0.4 | Frank, Yaoxun, Denny | 2025/3/4 | Module description设计细节 |
| 0.5 | Frank, Yaoxun, Denny | 2025/5/7 | GraceC versionupdate submitJD packet |
| 0.7 | Frank, Yaoxun, Denny | 2025/8/5 | submitJD更新TopDiagram更新，补充Userbit定义CRG更新Queue scheduling flow和进程flush flow更新补充RAS，DFD， ECR补充Programming Guide |
| 1.0 | Frank, Yaoxun, Denny | 2025/11/3 | submitJD更新TopDiagram更新，新增debug bus修复部分描述错误不清晰等问题 |
| 1.1 | Frank | 2025/12/27 | submitJD的word17的默认值改为0x7001 |
| 1.2 | Frank | 2026/1/6 | 补充programming guide相关的描述， 新增Wait_host packet |
| 1.3 | Frank | 2026/2/26 | 修改submitJD packet done bit[19:16]描述 |
| 1.4 | Frank | 2026/3/12 | 修改submitJD local_step描述 |
</table-1>
Glossary

<table-2>
| Glosssary | Full Name | Description |
| CP | Command Processor | 命令处理模块 |
| HCQD | Hardware Command Queue Descriptor | 硬件命令队列描述 |
| MCQD | Memory Command Queue Descriptor | 软件命令队列描述， 软件创建在device memory中 |
| KMD | Kernel Mode Driver | 内核驱动 |
| UMD | User Mode Driver | 用户驱动 |
| CPF | Command Processor Fetch | 命令队列取命令模块 |
| CPE | Command Processor Execute | 命令解析，派发或执行模块 |
| CPD | Command Processor Dispatch | 命令派发模块 |
| SDMA | System Direct Memory Access | 系统直接内存访问模块 |
| CE | Copy Engine | 在本文档中和SDMA同义 |
| ATO | Atomic | Atomic模块或命令 |
</table-2>
Overview
Top Diagram
参考最新的GraceC floorplan
SoC logic Diagram [To be updated]
CP做为GPU的控制和调度单元， 在SoC中的位置如上图所示(仅表示逻辑位置， 并非实际物理位置)。接收来自host CPU的初始化，命 令doorbell， 并读取内存中的命令包（Command Packet），解析并执行这些命令包， 下发给cluster，SDMA， VPU， 或者自行处理barrier，sync等命令， 更新执行状态给软件，以便CPU能控制并监控GPU任务的执行。
CP Top Diagram
CP subNoC
CP subsys Diagram
CP主要由
CPF， 图中的HCQD， 32个HCQD我们统称为CPF， 读取命令包，维护read pointer
Attri， HCQD中的属性，由mcqd的绑定确定
db_hit, doorbell hit, 根据doorbell id判断doorbell是否hit， 如果hit， 则响应doorbell
Fetch， 如果ringbuffer非空， 并且下游rb_fifo能存一个1024bit的cmd packet， 可读取ringbuffer中的command packet
rptr_update，更新read pointer到host端memory， 以一定的策略更新
Split， 将总线过来的1024bit数据拆分成32bit数据， 便于firmware操作
Nop_filter，将cmd packet中的nop丢弃
rb_fifo， 存放fetch回来的cmd packet
idle_int，监控hcqd的idle状态， 超过阈值， 将通过中断的形式通知firmware进行调度
CPE， 有一个risc-v core运行firmware执行对命令包的解析， 处理操作， 另外还负责queue调度， perf/debug等工作
Mailbox(在IMC中)， CPU,CP,IMC之间相互发送消息， 通过中断形式触发
iDMA， nx900可使用iDMA实现rb fifo到下游fifo的命令包转发
Int_gen, interrupt generator, CP发送中断给IMC中的中断控制器， 由中断控制器上报中断给Host CPU
cls_fifo,sdma_fifo,vpu_fifo, ato_fifo, 缓存相应cmd packet的任务， 并组装成一个完整的命令下发给下游各自对应的执行单元或者dispatcher
CPD,  配置Gctrl
根据CPE的packet信息产生Gctrl的配置信息， 并将配置信息配置给Gctrl
分配kernel index，维护kernel index与queue之间的mapping关系， 执行fence write操作
GCtrl， Global Control，
负责将Grid level job拆分为cluster level的job， dispatch命令给cluster，
收集cluster的响应并产生kernel done返回给CPE， 可乱序返回
SDMA dispatch， 将SDMA job分发给SDMA模块
SDMA, 执行H2D, D2H, D2D等memory copy, H:Host,  D:Device
Atomic， 执行atomic操作
VPU dispatch，将Video job分发给VPU subsystem
fw_prefetch, NX900所需要的指令由fw_prefetch提前搬到ILM中，各个core的ILM独立搬运
Event table， stream间的依赖在event table中管理
schDMA，可由nx900配置，查询外部mcqd状态， 并将结果写入寄存器，供软件查询
bindDMA, 可由nx900配置， 执行mcqd bind到hcqd的过程
TOP_REG, CP软件可见memory mapped寄存器
HUB， CP各个模块产生的总线访问多对一，或一对多的选择
axi_gm, axi_gs, axi总线接口与generic接口的转换模块， DesignWare生成
CPNOC， CP内部的fabric， 使用arteris FlexNoC生成， 包括ctrl bus和data bus
Mst_addr_check/slv_addr_check用来检测地址合法性， 并寄存出错信息，可上报中断
mst_reset_link/slv_reset_link在rst_req请求时保证CP对外部的总线干净，从而对模块单独复位
Data Path

<table-3>
| Group | No. | Data Path |
| A | A1/X1 | Host或IMC通过ctrl fabric配置CP寄存器直接配置RguGctrl， SDMA dispatch,SDMA, SDMA返回job done, Gctrl返回job done等 |
|  | A2/X3 | Host或IMC通过ctrl fabric配置CP寄存器 |
|  | A3 | 配置CP寄存器 |
|  | A4 | 下发Doorbell |
|  | A5 | 触发mailbox |
| B | B1/X4 | CP Cmd gen通过ctrl bus可配置RguGctrl， SDMA dispatch |
|  | B2 | CP firmware通过ctrl bus接入ctrl bus空间， 可配置RguGctrl， SDMA dispatch， VPU dispatch， SDMA， 可访问所有寄存器空间 |
|  | B3 | CP noc出去访问ctrl bus大网， CP firmware访问外部寄存器空间， rguGctrl配置cluster， VPUdispatch配置VPU等 |
| C | C1/X10 | SDMA dispatch,firmware或者host配置和访问SDMA寄存器 |
|  | C2/X5 | Cluster cmd gen ,firmware或者host配置和访问rguGCtrl寄存器 |
|  | C2/X6 | CPD发送job给Gctrl |
|  | C3/X7 | Gctrl发送task给cluster， Gctrl返回job done给CPD |
|  | C5/X11 | SDMA返回job done给sdma dispatch |
| D | D1/X7 | SDMA dispatch配置SDMA |
|  | D2/X9 | VPU dispatch配置VPU |
|  | D3/Z1 | rguGctrl通过jobctrl bus配置cluster |
|  | D4/Z2 | clusCtrl通过jobctrl bus返回job done给Gctrl |
| E | E1/Y1 | CP访问data fabric大网(AXI5) |
|  | E2/E3/Y2/Y3 | CP访问data fabric(AXI4)， 实质是一个口 |
|  | E4/Y4 | CP发出atomic访问data fabric(AXI5) |
|  | E5/Y5 | SDMA访问data fabric |
|  | E6 | CPD读取额外config信息 |
| F | F1 | HCQD通过data fabric从外部ringbuffer中读取cmd packet |
|  | F2 | HCQD通过data fabric将read pointer写出 |
|  | F3 | HCQD产生idle中断给firmware |
|  | F4 | Firmware从HCQD内部的rb fifo中读取cmd packet |
| G | G1 | Firmware访问data fabric |
|  | G2 | Firmware prefetch |
|  | G3 | CPE发出Compute job给下游 |
|  | G4 | CPE发出sdma job给下游 |
|  | G5 | CPE发出VPU job给下游 |
|  | G6 | CPE发出atomic job给下游 |
|  | G7 | atomic模块访问data fabric |
|  | G8 | schDMA和bindDMA访问data fabric |
|  | G9 | bindDMA写HCQD寄存器 |
|  | G10 | 中断产生模块访问ctrl fabric， 写IMC中的中断控制器 |
|  | G11 | Firmware访问ctrl fabric |
| H | H1 | firmware访问内部的event pool |
|  | H2 | firmware或者iDMA将解析好的cmd packet写到下游对应fifo中 |
|  | H3 | firmware产生中断给中断产生模块 |
</table-3>
Work flow
正常flow
软件host/IMC配置各个MCU的firmware指令的address和size， index， ilm/dlm等信息， 触发firmware prefetch模块将firmware读取到各自的ILM/DLM中[硬件需要支持两段firmware load]
写reg_top.mcu_fw_base_lo和reg_top.mcu_fw_base_hi[15:0]，asid[4:0]配置address（reg_top为AIGCIC_CP_reg_top的简写)
写reg_top.mcu_fw_size配置firmwave的size
写mcu_fw_index选择5个mcu中的一个， index[3:1]代表mcu index，0~4， index[0]代表ILM/DLM， 0表示ILM, 1表示DLM
软件polling firmware_fetch_ready寄存器为1， 表示此次firmware fetch完成
启动下一个firmware fetch， firmware_fetch_ready自动清0，直到该次firmware fetch再次完成， firmware_fetch_ready寄存器置1
也可以不使用CP fetch ILM/DLM， 使用IMC的mcu push 指令/数据到CP的各个mcu的ILM/DLM, 参考AIGCIC_CP_reg_mcu_slv.csv寄存器描述
配置mmio_cfg_wdata0(低32bit)和mmio_cfg_wdata1(高32bit)为要写入的值
配置mmio_cfg_addr, [27:0] offset, [28] 0: read, 1: write, mcu_index: 0~4表示mcu0~mcu4, mcu4为master mcu
polling mmio_status为1,第一笔64bit写入成功
重复上述流程， 直到所有的数据写入
完成firmware搬运后， KMD/IMC写reg_top.mcu0/1/2/3/4_fw_run_req为1，可以启动对应的mcu开始run, firmware启动好后分别写各自的reg_top.mcu0/1/2/3/4_fw_boot_done为1在运行过程中重新启动fetch firmware或者直接修改firmware会引起错误， 在系统IDLE状态下软件评估是否可以进行更新firmware
软件通过读取reg_top.mcu0/1/2/3/4_fw_boot_done，来判断firmware启动完成， 只有确认firmware启动完成后才能给其发送命令触发中断等操作
软件通过IMC中mailbox/IMC share memory通知CP master MCU的firmware mcqd的创建/销毁事件
见IMC MAS和软件IPC流程的介绍
Master MCU Firmware调用schDMA查询mcqd的状态，找到一个可绑定的mcqd
schDMA的使用见QueryDMA配置流程
Master MCU Firmware根据mcqd的信息调用BindDMA完成hcqd与mcqd的绑定
Bind DMA的使用见BindDMA配置流程
hcqd根据绑定的信息并及时响应doorbell
写AIGCIC_CP_reg_doorbell中的寄存器，触发doorbell， 参考$REPO/design/reg/AIGCIC_CP_doorbell.csv
Hcqd读取cmd packet并下发给CPE，可以使用idma或fw两种下发cmd的方式
idma:参见iDMA配置步骤
fw：firmwire读取interaction buffer中的RD_RB*_DATA，根据读出的cmd类型以及header/body写入interaction buffer中的WR_CPD/SDMA/ATO*_PKT_HDR/BODY中
event signal， event wait等cmd packet由firmware自行处理，因此在使用idma时，执行到signal/wait包，需要等待idma处于idle状态后，关闭interaction buffer中的use_idma，切换为fw处理，完成后可再打开use_idma
CPE中的user mcu的firmware按照一定策略执行8个hcqd中的cmd packet
将不同的cmd packet发送给不同的执行单元， 对于event signal， event wait等cmd packet由firmware自行处理
各个执行单元执行任务， 并返回执行结果给CPE
CPE将结果上报给CPF的status寄存器中（AIGCIC_CP_reg_hcqd.status）
1/2/3.driver申请 stream空间（base_addr,size， wrptr_addr, mcqd， etc.）
4. KMD通过message发送新增stream的消息给CP调度firmware（master mcu）
5. firmware将mcqd加入调用列表中
6. UMD产生任务发送到ringbuffer中
7. UMD更新wptr
8. UMD触发doorbell给CP
9. firmware将mcqd与hcqd绑定
10. hcqd读取cmd packet
11. hcqd更新read pointer到wrptr address
软件需要保证第6， 7， 8步的顺序，并且确保一定写入host memory后再触发doorbell，否则硬件会读不到ringbuffer中最新写入的commandpacket
Queue Scheduling Flow
Master MCU定期（或者以其他策略）查询各个进程的mcqd的状态， 通过QueryDMA加速查询， QueryDMA遍历指定的mcqd的状态， 获取信息（是否有任务要做， 优先级等）提供给master MCU， master MCU通过读取HCQD的状态寄存器可以获取HCQD的状态（是否IDLE等），由Master MCU决定是否需要做queue切换
如果需要做queue切换， master MCU通过配置AIGCIC_CP_reg_top.stop_hcqd寄存器将某些hcqd stop住
Hcqd收到stop命令后，停止fetch cmd packet，  已发出的读命令都返回后，触发user mcu queue stopped中断。
User mcu收到该中断后，fw disable idma功能，根据cpe中的寄存器hcqd_stopped[7:0], 处理stopped的queue， 读RD_RB*_DATA，并将rb fifo中的cmd packet丢弃（fw写i_buffer.WR_FW_DROP_RBx）,直到读空并全部drop( CPF中的exe_rptr保持不变)， user mcu处理完成后，写AIGCIC_CP_reg_cpe.fw_hcqd_stopped寄存器对应hcqd的bit为1，表示已经完成stop。
对于已经发出的atomic cmpswap类型的job， firmwarepolling top寄存器对应queue的ato status 为3’h0, 然后读top寄存器中的stopped_on_loop寄存器， 如果是对应hcqd的bit为0， 表示atomic cmpswap success， firmware写interaction buffer.WR_FW_CONSUME_RBx = 1； 如果stopped_on_loop寄存器对应hcqd的bit为1（处理完要清掉该寄存器）， 表示atomic cmpswap fail， firmware 写interaction buffer. WR_FW_DROP_RBx = 1, 并且firmware需要向对应的WR_FW_ATOx_OSD_DEC写1， 将对应的ato_osd_cnt减1
对于event wait包， 不需要查event table直接满足条件返回完成， 写interaction buffer.WR_FW_DROP_RBx = 1
对于已经发出的其他类型的job， firmware只需写interaction buffer. WR_FW_CONSUME_RBx就可以， job执行正常的情况下会完成
同步master MCU等待CPE中AIGCIC_CP_reg_cpe.fw_hcqd_stopped[i] == 1 (i表示对应的hcqd)，并且对应hcqd中的status寄存器field finish_osd_cnt == 0 && cost_osd_cnt == 0 && rd_bus_idle ==1 && wr_bus_idle == 1代表hcqd stop完成
Release， 配置AIGCIC_CP_reg_top.release_hcqd寄存器对应hcqd的bit为1， 触发对应的Hardware queue将最新的exe_rptr写到memory中， 可以独立release各个queue。
等待release完成后（通过读AIGCIC_CP_reg_hcqd.status.idle寄存器）
配置AIGCIC_CP_reg_top.release_hcqd寄存器对应hcqd的bit为0，释放release动作
master mcu配置BindDMA（见Bind DMA配置流程）将某个选中的mcqd绑定到该hcqd上
master mcu配置AIGCIC_CP_reg_cpe.fw_hcqd_stopped寄存器对应hcqd的bit为0， 恢复初始状态
配置该hcqd的stop_hcqd寄存器对应bit为0， 恢复正常工作状态。
进程flush flow
一次只能复位一个进程， 如果需要多个进程复位， 需要软件决定顺序， 并依次执行
软件确认需要做进程reset， UMD停止下发job， 通知KMD做进程flush
KMD向CP master MCU发送msg，停止命令队列调度， 在进行中的需要确保完成之后不再调度， 完成后CP firmware写寄存器表明停止调度结束
软件等待停止调度结束，软件销毁进程的MCQD， 硬件不感知
软件查询已绑定的命 令队列的进程号
Kmd配置CP寄存器AIGCIC_CP_reg_top.flush_asid，写入要复位的进程号，对所有与该asid匹配的hcqd有效, AIGCIC_CP_reg_top.flush_asid[4:0]表示进程号， [5]表示valid
Hcqd停止fetch新的cmd packet， 正在fetch的等待完成后不再fetch
当fetch的cmd pacekt都回来存入rb fifo后， HCQD产生queue_stopped中断给user mcu
Mcu收到该中断后，当处理完一个完整包后，处理中断，将rb_fifo中后续的包读出丢掉， FW写i_buffer.WR_FW_DROP_RBx， 当fw处理完后，写fw_hcqd_stopped[7:0]寄存器对应bit为1， 依次处理完所有该进程的queue
flush请求同时送给CPD模块， cpd将未发送给Gctrl的job丢掉
软件配置Gctrl的early stop寄存器，gctrl中保存有每个cluster运行job的asid， 通知对应core执行early stop流程， core需要返回dummy response给Gctrl， 保证业务的完整性
Sdma等待完成， 总是能完成， 除非总线hang， 总线hang不在这个流程范畴内， 需要芯片复位才能解决
KMD等待CPE中AIGCIC_CP_reg_cpe.fw_hcqd_stopped[i] == 1 (i表示对应的hcqd)，并且对应hcqd中的status寄存器field finish_osd_cnt == 0 && cost_osd_cnt == 0 && rd_bus_idle ==1 && wr_bus_idle == 1代表hcqd stop完成。
unbind该hcqd（配置该hcqd的wptr=0（可选）， rptr=0（可选）， active = 0）
当所有stop完成后， 由软件决定是否对core进行软复位， CP不需要进行软复位， SDMA0和SDMA1在保证接口干净的情况下可单独复位
软件将event table中该进程的所有entry destroy掉
软件需要对全芯片的tcu做指定context id的invalid， （该进程运行的kernel曾经所占用的cluster并无记录， 仅有当前占用cluster的记录， 所以需要全芯片的tcu做指定context id的invalid）
软件配置AIGCIC_CP_reg_top.flush_asid[5] = 1’b0, 软件配置early stop为0，软件配置AIGCIC_CP_reg_cpe.fw_hcqd_stopped[i] == 0 (i表示对应的hcqd)
第12步中，如果在一定时间内KMD等不到对应hcqd idle， flush流程失败。
Feature
Support user mode submission
Support non-scheduling and kmd queue scheduling and firmware queue scheduling
Support compute job, sdma job, video job, atomic job and event signal job, event wait job
Support firmware-based command decoder
Support self-defined command packet for future use
Support doorbell mechanism between software and hardware
Support hardware command packet nop filter, hardware delete nop in command packet
Support firmware based queue arbitration
Firmware运行在NX900 RISC-V core上， 4 core for job decoder， handling and dispatch and one core for queue scheduling and CP management.
One RISC-V core serve 8个hardware queue called one pipeline. We have 4 pipelines with 32 hardware queues.
CP支持single die， 2 die， 4 die, master-slave die模式， master die CP分发任务给所有die， slave die CP disable（sdma in slave die CP 不会被disable）
支持queue之内的event barrier和queue之间的event wait
支持全局最多1024个event id， 支持32个进程， 进程共享1024个event id， 由软件管理
一个event signal包可设置一个event record， 一个event wait包最多可wait 4个event
CP支持单die 2个copy engine（SDMA）的任务调度， 支持force mode和round-robin mode， 最大支持4个die
支持SDMA类型的job的fence操作
CP中包含两个sdma， 主要支持H2D， D2H， D2D的大数据量的memory copy
Sdma 1024bit data width, 理论最大带宽单向128GB/s， 满足PCIE gen5 X16带宽（单向64GB/s）
Copy engine支持memory copy， constant fill， prefetch操作
Copy engine支持byte地址和byte粒度的size
Copy engine支持read/write max burst len寄存器可配，最大burst len = 4
SDMA支持乱序返回（支持out of order和interlaeave）， axi接口上的oustanding的awid和arid 不重复， 最大读osd 256， 写osd 256
CP支持atomic load.add， atomic swap和atomic cmpswap 三种atomic操作， 支持最小数据位宽32bit, 地址对齐到64bit， 符合AXI5 标准协议
CP支持event signal， 可向memory写timestamp， fence(向软件指定的地址写指定的值)， 产生中断等
CPD为Gctrl分配kernel index， 最大16个entry，支持kernel 乱序返回kernel done
CPD按照一定的sequence配置Gctrl， 启动kernel
CPD支持从memory读取一些自定义的配置， 如uniform register的配置信息
支持kernel类型job的fence操作
Support正常stop 流程，用于queue scheduling.
Support 异常flush流程， 用于进程复位
Gctrl feature参考Gctrl MAS
Interface
Data Bus
https://ds.aigcic.com/#/GraceC_Fabric
Ctrl Bus
https://ds.aigcic.com/#/GraceC_Fabric
4X2 NoC
https://ds.aigcic.com/#/GraceC_Fabric
其他接口信号

<table-4>
| 信号 | I/O | 位宽 | Note |
| ref_clk | Input | 1 | 50MHz的参考时钟 |
| por_reset_n | input | 1 | Power on reset |
| subsystem_reset_n | input | 1 | Cp subsys reset |
| Pll_fout_clk | Output | 1 | 输出给IMC |
| Pll_lock | Ouptut | 1 | 输出给IMC |
| Clk_ctrl_noc | Input | 1 | From ctrl noc |
| Ctrl_noc_reset_n | Input | 1 | From ctrl noc |
| Clk_data_noc | Input | 1 | From data noc |
| data_noc_reset_n | Input | 1 | From data noc |
| Clk_atomic_noc | Input | 1 | From atomic noc |
| Atomic_noc_reset_n | Input | 1 | From atomic noc |
| Top_cfg | Input | 32 | From IMC |
| Intr_in | Input | 256 | From other sub system |
| Intr_out | Output | 3 | To IMC/Host{cp_err_int, event_int, tcu_interrupt} |
| Cp_rst_hand_req | input | 1 | From IMC, reset 请求 |
| Cp_rst_hand_ack | output | 1 | To IMC, reset 响应 |
| Cp_status_idle | output | 1 | To IMC, cp idle状态 |
| Jtag_tck | input | 1 |  |
| Jtag_tms | Input | 1 |  |
| Jtag_tdi | input | 1 |  |
| Jtag_tdo | output | 1 |  |
| Dft相关信号 | Input |  |  |
</table-4>
userbit定义
data noc user bit
awuser[22:18]/aruser[22:18] = asid, 从tbu出去之后就去掉了, mmu的userbit只有[17:0]
awuser[17:14]/aruser[17:14] = 4‘d0(reserved for PE colease use)
awuser[13:10]/aruser[13:10] = L2_cop
awuser[9]/aruser[9] = 0
aruser[8:0] = 0
其他bit reserved as 0
awuser[8:0]及clientID（userbit的[31:28]为clientID）定义如下:

<table-5>
| master | awuser[31:28]/Aruser[31:28] | awuser[8:5] | awuser[4:3] | awuser[2] | awuser[1:0] |
| PIPE0 | 4‘b0000 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| PIPE1 | 4’b0001 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| PIPE2 | 4’b0010 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| PIPE3 | 4’b0011 | 4’d0 | 2‘d0 | 1‘b0 | 2’b00 |
| MCU0 | 4’b1000 | Firmware define | Firmware define | Firmware define | Firmware define |
| MCU1 | 4’b1001 | Firmware define | Firmware define | Firmware define | Firmware define |
| MCU2 | 4’b1010 | Firmware define | Firmware define | Firmware define | Firmware define |
| MCU3 | 4’b1011 | Firmware define | Firmware define | Firmware define | Firmware define |
| MCU4 | 4’b1111 | Firmware define | Firmware define | Firmware define | Firmware define |
| PIPE0_ATO | 4’b0000 | atom_opcode4’b0000: Atomic_Load.Add4’b1000: atomicswap4’b1001: atomicCompare | atom_dtype2’b00: u322’b01: s322’b10: fp32 | 1’b1 | 2‘b10: no return(atomic_store.add)2’b11: return(atomicCompare,atomicswap，atomic_load.add) |
| PIPE1_ATO | 4’b0001 | 同上 | 同上 | 同上 | 同上 |
| PIPE2_ATO | 4’b0010 | 同上 | 同上 | 同上 | 同上 |
| PIPE3_ATO | 4’b0011 | 同上 | 同上 | 同上 | 同上 |
| RD_FW_PREFETCH | 4‘b0100 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| RD_QUERYDMA | 4’b0101 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| RD_BINDDMA | 4’b0110 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| RD_CPD | 4’b0111 | 4’d0 | 2‘d0 | 1‘b0 | 2’b00 |
| WR_CPD | 4’b0111 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| WR_SDMAD | 4’b1100 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| SDMA0 | 4’b1101 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
| SDMA1 | 4’b1110 | 4’d0 | 2‘d0 | 1’b0 | 2’b00 |
</table-5>
ctrl noc user bit
对于gctrl,   bit3~bit0对应cluster3~cluster0， 若为awuser[3:0] = 4‘b1111， 则表示broadcast
对于不是gctrl的master， axuser[3:0] = 4’b0000
axuser[7:4]定义如下：

<table-6>
| master | awuser[7:4] | aruser[7:4] |
| CP_MCU0 | 4’d5 | 4‘d5 |
| CP_MCU1 | 4‘d6 | 4‘d6 |
| CP_MCU2 | 4‘d7 | 4‘d7 |
| CP_MCU3 | 4‘d8 | 4‘d8 |
| CP_MCU4 | 4‘d9 | 4‘d9 |
| WR_bindDMA | 4‘d10 | NA |
| WR_CPD | 4‘d11 | NA |
| WR_SDMAD | 4‘d12 | NA |
| WR_SDMA0 | 4‘d13 | NA |
| WR_SDMA1 | 4‘d14 | NA |
| WR_GCTRL | 4‘d15 | NA |
</table-6>
Command Packet
Command packet list

<table-7>
| Command Packet | CP_Operator | Body size | Description |
| Submit_JD | 0x10 | 31 | Compute job |
| Submit_SDMA | 0x11 | 11 | SDMA job |
| Submit_VD | 0x12 | 8 | Video job |
| Submit_AtoAdd | 0x20 | 6 | Atomic add |
| Submit_AtoSwap | 0x21 | 6 | Atomic swap |
| Submit_AtoCmpswap | 0x22 | 6 | Atomic compare swap |
| Event_signal | 0x30 | 9 | Event signal |
| Event_wait | 0x31 | 12 | Event wait |
| Create_MCQD | 0x80 |  | Kmd通知firmware新增mcqd, 也通过mailbox传递 |
| Destroy_MCQD | 0x81 |  | Kmd通知firmware删除mcqd |
| NOP | 0xEE |  | Nop |
| Wait_Host | 0x40 | 15 | Wait host处理结束 |
</table-7>
Create_MCQD和Destroy_MCQD通过mailbox或者share memory与master mcu通信
Header and Body_Word0

<table-8>
| Word | Field | From | To | Comment |
| Header | CP_Operator | 0 | 7 | Command packet type |
|  | Body_Size | 8 | 12 | Body size(<=31) |
|  | Reserved | 13 | 23 | 将由CP硬件或firmware改写为hcqdid(5bit)和asid(5bit) |
|  | Block_Mask | 24 | 27 | 等待该packet前的某种或某些类型的packet全部执行结束， 该packet才能继续下发, Bit0: compute jobBit1: dma jobBit2: video jobBit3: atomic job“1”代表block， “0”代表不block |
|  | Reserved | 28 | 31 |  |
| Body_Word0 | stream_ID | 0 | 4 | 为了debug 时定位cmd packet， 软件可给cmd packet赋一个唯一ID[4:0] 标记进程内的stream ID[23:5]: 标记该进程该stream内的packet ID |
|  | Seq_ID | 5 | 23 |  |
|  | reserved | 24 | 31 |  |
</table-8>
CP处理后的header和Word0，填写HCQD_ID和ASID

<table-9>
| Word | Field | From | To | Comment |
| Header | CP_Operator | 0 | 7 | Command packet type |
|  | Body_Size | 8 | 12 | Body size(<=15), maximum size of command packet is 16, including Header |
|  | HCQD_ID | 13 | 17 | Hcqd id, 32 hcqds total[2:0] hcqd id in one pipe[4:3]: pipe id |
|  | ASID | 18 | 22 | Address space id， support max 32 asid |
|  | reserved | 23 | 23 |  |
|  | Block_Mask | 24 | 27 | Block type, 等待该packet前的某种或某些类型的packet全部执行结束， 该packet才能继续下发, Bit0: compute jobBit1: dma jobBit2: video jobBit3: atomic job“1”代表block， “0”代表不block |
|  | Reserved | 28 | 31 |  |
| Body_Word0 | stream_ID | 0 | 4 | 为了debug 时定位cmd packet， 软件可给cmd packet赋一个唯一ID[4:0] 标记进程内的stream ID[23:5]: 标记该进程该stream内的packet ID |
|  | Seq_ID | 5 | 23 |  |
|  | reserved | 24 | 31 |  |
</table-9>
Submit_JD

<table-10>
| Submit_JD | Field | From | To | Comment |
| Body_Word1 | Grid_Dim_X | 0 | 31 | [1, 2^31-1] |
| Body_Word2 | Grid_Dim_Y | 0 | 15 | [1, 2^16-1] |
|  | Grid_Dim_Z | 16 | 31 | [1, 2^16-1] |
| Body_Word3 | Block_Dim_X | 0 | 10 | [1, 1024] |
|  | Block_Dim_Y | 11 | 21 | [1, 1024] |
|  | Block_Dim_Z | 22 | 28 | [1, 64] |
|  | reserved | 29 | 31 |  |
| Body_Word4 | Cluster_Dim_X | 0 | 7 | [1, maxNum] clusterDim.x * clusterDim.y * clusterDim.z <= maxNummaxNum = cta_num * core_per_phy_cluster, core_per_phy_cluster表示每个物理cluster有多少个core, 当前core_per_phy_cluster=7 |
|  | Cluster_Dim_Y | 8 | 15 |  |
|  | Cluster_Dim_Z | 16 | 23 |  |
|  | cta_num | 24 | 29 | 每个core最多同时存在32个block。warp_n=ceil(blocksize/32), 每个block会占用多少个warpwarp_max=min(8, floor(64KB/(trf_size*32*4))*8 根据当前每个thread使用trf数量确定每个core最多有多少个warp可以使用min( min( floor(warp_max/warp_n), shm_size==0 ? 32 : floor(256KB/shm_size)), 32) |
|  | reserved | 30 | 31 |  |
| Body_Word5 | Cluster_Ctrl | 0 | 31 | bit[30]:gctrl cluster idx下发模式 (默认值：0） 0: 只要cluster有空闲blk就可以下发cluster idx 1：cluster空闲blk数够一个cluster_dim时才能下发cluster idxbit[29:27] disp_mode =0 - Rand0: 占更多的cluster =1 - Rand1: 先把一个cluster用满 =2 - Rand2: 软件配置最大cluster个数 =3 - Fix0: interleave切分 =4 - Fix1: block切分bit[26:24] abit[23:21] b (a/b用于fix mode下进行块切分及interleave的控制参数，M（2^b)行N(2^a)列，a+b<=2;)bit[8:5] cluster_bit_map 指定所要使用的cluster，fix模式下需要精确指定（需要与a/b配置一致，如：mode==4,且为1行1列时只能有一个cluster bit有效），rand模式下可以任意指定bit[4:0] max_cluster_num rand模式下能使用的最大cluster数目(<=4)，该数值不能大于bit map有效值 |
| Body_Word6 | ICache_Base_Lo | 0 | 31 | 实际的PC初始地址为PC = icache_base + init_pc |
| Body_Word7 | ICache_Base_Hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word8 | Init_PC_Lo | 0 | 31 |  |
| Body_Word9 | Init_PC_Hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word10 | local_base_lo | 0 | 31 |  |
| Body_Word11 | local_base_hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word12 | local_step | 0 | 31 | warp_step = local_step[15:0]elem_step = local_step[31:16]参考ISA LDL计算公式：warp_step = ceil(log2(128*n))， elem_step =log2(128), 此处n为当前kernel所使用的local memory 容量(n*4byte)phyical warp num = 4 cluster * 7core * 64 = 1792；kernel warp num无限制 |
| Body_Word13 | const_base_lo | 0 | 31 |  |
| Body_Word14 | const_base_hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word15 | trf_size | 0 | 8 | thread register file number per thread，要求是4的整数倍最大256；每个core共有512KB register，平均分给64warp*32thread计算公式：trf_size = min(floor(512/ceil(warp_n/8)/4)*4, 256) ，在不考虑shm容量限制时，warp_n = floor(64/ceil(thd_n/32)) * ceil(thd_n/32) |
|  | shm_size | 9 | 27 | 每个block的shm大小，单位B, 要求是4的整数倍，最大256KB [0, 256*1024] |
|  | reserved | 28 | 31 |  |
| Body_Word16 | trf_size_n | 0 | 31 | [3:0][7:0] trf_n 每相邻的8个warp为一组，每个block最多warp_group_n = 4组，不足4组的对应位置无效warp_group_n = ceil(ceil((ntid.x * ntid.y *ntid.z)/32)/8)每组8bit，1-15 分别表示 该组中每个thread所使用的寄存器数量= trf_n* trf_size要求软件控制thread的数量不能超过硬件限制total_num = 0for (i=0;i<warp_group_n;i++) { total_num = total_num + trf_n[i]*trf_size * 32thread * 4B }要求 total_num<= 64KBcta_num = min( min( floor(64KB/total_num), shm_size==0 ？ 32 ：floor(256KB/shm_size)), 32) |
| Body_Word17 | packet_done | 0 | 31 | 最后配置cfg_done, kernel 配置结束Bit[31]：warp优先级模式0：同时启动的warp按照hw_warpid分配固定优先级，后启动优先级低1：同时启动优先级相同（轮询），后启动优先级低Bit[19:16]: cache_op_kstart {early_fetch_ccache, early_fetch_icache, invalid_ccache, invalid_icache}要求配置为0Bit[15:12]: cache_op_kdone {invalid_dcache1p5, invalid_dcache, invalid_ccache, invalid_icache}Bit[11:8]: mem_nowait_bdone {ACP_SHM_W, ACP_SHM_R, SYNC_SHM_W, SYNC_SHM_R}Bit[7:0]: mem_nowait_kdone {ACP_GLB_W, ACP_GLB_R, ACP_SHM_W, ACP_SHM_R, SYNC_GLB_W, SYNC_GLB_R,SYNC_SHM_W, SYNC_SHM_R}推荐配置为0x7001 |
| Body_Word18 | Cfg_addr_lo | 0 | 31 | 0 表示不需要取register config descriptor |
| Body_Word19 | Cfg_addr_hi | 0 | 15 |  |
|  | reserved | 16 | 31 |  |
| Body_Word20 | Fence_addr_lo | 0 | 31 | 当job完成后， 向fence address写入fence value, if fence address = 0, disable this function当cmd发生错误时，gctrl ret err，此时也会执行写fence操作（若有），该fence不代表cmd完成，需先处理err中断 |
| Body_Word21 | Fence_addr_hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word22 | Fence_value_lo | 0 | 31 |  |
| Body_Word23 | Fence_value_hi | 0 | 31 |  |
| Body_Word24 | ICodLenL0_lo | 0 | 31 | 64bit，单位byte {ICodLenL0_hi,ICodLenL0_lo} = init_pc + instr length， 256Byte对齐 |
| Body_Word25 | ICodLenL0_hi | 0 | 31 |  |
| Body_Word26 | ICodLenL1_lo | 0 | 31 | 64bit，单位byte {ICodLenL1_hi,ICodLenL1_lo} = init_pc + instr length， 256Byte对齐 |
| Body_Word27 | ICodLenL1_hi | 0 | 31 |  |
| Body_Word28 | CCodLenL1_lo | 0 | 31 | 64bit, 单位byte， constant变量， 128Byte对齐 |
| Body_Word29 | CCodLenL1_hi | 0 | 31 |  |
| Body_Word30 | L1_config | 0 | 0 | bit[0]: enable, 高电平有效，默认值：0x1 |
|  | info_timeout_cycle | 1 | 15 | bit[6:0]: timeout的cycle数，达到这个值时对应entry认为merge done， bit[14:7]: 当任意entry的time cnt计数达到这个值时，切换prior为age默认值：0x2010 |
|  | info_max_merge | 16 | 17 | 范围：0~3粒度：kernel一笔burst最大 可以merge的request数目：0：16笔1：8笔2：4笔3：2笔默认值：0x0参考 PE coalesce range 和 DRAM 二级 interleave size 配置说明(done) - SOC - Confluence文档共享平台 |
|  | info_max_req | 18 | 26 | coalesce可容纳的最大req数目，所有entry中已有的req数目之和达到这个值时要evict默认值：0x14 |
|  | info_prio_mode | 27 | 27 | 仲裁的优先级mode[0] 1'b0：{merge done reason,merge number,merge age}1'b1：{merge number,merge done reason,merge age}默认值：0x0 |
|  | info_disable_coal | 28 | 28 | 关闭掉coalesce功能，所有输入会bypass到输出。[0] : 1'b0：打开coalesce功能 1'b1：关闭coalesce功能默认值：0x0 |
|  | Info_addr_mode | 29 | 29 | 范围：0~10：在2KB内merge request1：根据info_max_merge在对应范围内merge request。对应关系如下。Info_max_merge：0：在2KB内merge1：在1KB内merge2：在512B内merge3：在256B内merge默认值：0x0 |
</table-10>
为了满足后期core配置寄存器的扩展需求， 定义{cfg_addr_hi, cfg_addr_lo}指向如下数据类型, 当{cfg_addr_hi, cfg_addr_lo} = 0, CP将不去取cfg的值， 否则CP去该地址取出cfg的配置值， 在内存中排布如下, 固定占用1KByte， 由于发burst要保证不能跨512Byte boundary
要求软件配置cfg_addr 512Byte对齐，硬件不做处理
cfg_register*_addr配置为绝对地址

<table-11>
| word(32bit), 从低位到高位排布 | value |
| 0 | num(0 is illegal, max is 127) |
| 1 | reserved |
| 2 | cfg_register0_addr |
| 3 | cfg_register0_value |
| 4 | cfg_register1_addr |
| 5 | cfg_register1_value |
| ... | ... |
| 254 | cfg_register126_addr |
| 255 | cfg_register126_value |
</table-11>
Submit_SDMA

<table-12>
| Word | Field | From | To | Comment |
| Body_Word1 | Mode | 0 | 1 | 0: memory to memory1: constant fill2: prefetch |
|  | Force_eu | 2 | 2 | Force dma cmd packet to which sdma eu depend on Force_mask1: force mode0: hardware dispatch |
|  | Force_index | 3 | 5 | [2:1] die id, [0]: sdma id in one die |
|  | NoC_Qos | 6 | 9 | NoC Qos when SDMA access data fabric |
|  | Reserved | 10 | 31 |  |
| Body_Word2 | Src_addr_lo | 0 | 31 | Mode = 0, 2, 代表source addressMode = 1，代表64bit constant databyte地址 |
| Body_Word3 | Src_addr_hi | 0 | 15 |  |
|  | Reserved | 0 | 31 |  |
| Body_Word4 | dst_addr_lo | 0 | 31 | Mode = 0, 1, 代表destination addressMode = 2，ignorebyte地址 |
| Body_Word5 | dst_addr_hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word6 | dma_size | 0 | 31 | Dma size, byte地址， minus one |
| Body_Word7 | Fence_addr_lo | 0 | 31 | 当job完成后， 向fence address写入fence value, if fence address = 0, disable fence function， 地址对齐到64bit |
| Body_Word8 | Fence_addr_hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word9 | Fence_value_lo | 0 | 31 |  |
| Body_Word10 | Fence_value_hi | 0 | 31 |  |
</table-12>
Submit_SDMA_2D

<table-13>
| Word | Field | From | To | Comment |
| Body_Word1 | Mode | 0 | 1 | 0: memory to memory1: constant fill2: prefetch |
|  | Force_eu | 2 | 2 | Force dma cmd packet to which sdma eu depend on Force_mask1: force mode0: hardware dispatch |
|  | Force_index | 3 | 5 | [2:1] die id, [0]: sdma id in one die |
|  | NoC_Qos | 6 | 9 | NoC Qos when SDMA access data fabric |
|  | Reserved | 10 | 31 |  |
| Body_Word2 | Src_addr_lo | 0 | 31 | Mode = 0, 2, 代表source addressMode = 1，代表64bit constant databyte地址 |
| Body_Word3 | Src_addr_hi | 0 | 15 |  |
|  | Reserved | 0 | 31 |  |
|  | src_dimensionX | 0 | 15 |  |
|  | src_dimensionY | 16 | 31 |  |
|  | src_dimensionZ | 0 | 15 |  |
|  | reserved | 16 | 31 |  |
|  | src_offsetX | 0 | 15 |  |
|  | src_offsetY | 16 | 31 |  |
|  | src_offsetZ | 0 | 15 |  |
| Body_Word4 | dst_addr_lo | 0 | 31 | Mode = 0, 1, 代表destination addressMode = 2，ignorebyte地址 |
| Body_Word5 | dst_addr_hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
|  | dst_dimensionX |  |  |  |
|  | dst_dimensionY |  |  |  |
|  | dst_dimensionZ |  |  |  |
|  | dst_offsetX |  |  |  |
|  | dst_offsetY |  |  |  |
|  | dst_offsetZ |  |  |  |
| Body_Word6 | dma_sizeX | 0 | 31 | Dma size, byte地址， minus one |
|  | dma_sizeY |  |  |  |
|  | dma_sizeZ |  |  |  |
| Body_Word7 | Fence_addr_lo | 0 | 31 | 当job完成后， 向fence address写入fence value, if fence address = 0, disable fence function， 地址对齐到64bit |
| Body_Word8 | Fence_addr_hi | 0 | 15 |  |
|  | Reserved | 16 | 31 |  |
| Body_Word9 | Fence_value_lo | 0 | 31 |  |
| Body_Word10 | Fence_value_hi | 0 | 31 |  |
</table-13>
Submit_ATOAdd

<table-14>
| Word | Field | From | To | Comment |
| Body_Word1 | return_enable | 0 | 0 | when atomicadd to host, must be 10: atomic without return, store1: atomic with return, load |
|  | Reserved | 1 | 31 |  |
| Body_Word2 | Dst_addr_lo | 0 | 31 | Destination Memory address， 32bit对齐 |
| Body_Word3 | Dst_addr_hi | 0 | 15 |  |
|  | resersved | 16 | 31 |  |
| Body_Word4 | Src_data | 0 | 31 | Source data, *dst_addr = *dst_addr + Src_data |
| Body_Word5 | Reserved | 0 | 31 |  |
</table-14>
Submit_ATOSwap

<table-15>
| Word | Field | From | To | Comment |
| Body_Word1 | Reserved | 0 | 31 |  |
| Body_Word2 | Dst_addr_lo | 0 | 31 | Destination Memory address， 32bit对齐 |
| Body_Word3 | Dst_addr_hi | 0 | 15 |  |
|  | resersved | 16 | 31 |  |
| Body_Word4 | Swap_data | 0 | 31 | Swap data, 将swap data与memory中的value交换 |
| Body_Word5 | Reserved | 0 | 31 |  |
</table-15>
Submit_ATOCmpSwap

<table-16>
| Word | Field | From | To | Comment |
| Body_Word1 | Reserved | 0 | 31 |  |
| Body_Word2 | Dst_addr_lo | 0 | 31 | Destination Memory address， 64bit对齐 |
| Body_Word3 | Dst_addr_hi | 0 | 15 |  |
|  | resersved | 16 | 31 |  |
| Body_Word4 | Cmp_data | 0 | 31 | Compare data, 该值与memory中的值比较， 如果相同， 则将swap_data更新进memory |
| Body_Word5 | Swap_data | 0 | 31 | Swap data, 将swap data与memory中的值交换 |
</table-16>
Event_signal

<table-17>
| Word | Field | From | To | Comment |
| Body_Word1 | Barrier | 0 | 0 | Wait All previous cmd packet done |
|  | Timestamp | 1 | 1 | 完成时是否向memory中写入timestamp |
|  | Interrupt | 2 | 2 | 完成时是否产生中断给软件 |
|  | Reserved | 3 | 31 |  |
| Body_Word2 | TS_addr_lo | 0 | 31 | 将timestamp写入该Memory address |
| Body_Word3 | TS_addr_hi | 0 | 15 |  |
|  | resersved | 16 | 31 |  |
| Body_Word4 | Record | 0 | 0 | 完成时是否在event table中记录1：记录0：不记录 |
|  | Record_Entry | 1 | 10 | Event table共1024个entry，软件查询得到一个空闲的entry，当event signal完成时，将此entry赋值为Record_cnt |
|  | Record_cnt | 11 | 15 |  |
|  | Keep | 16 | 16 | Keep = 0: 满足条件后Entry.cnt减1Keep = 1: 满足条件后entry.cnt保持原值 |
|  | Reserved | 17 | 31 |  |
| Body_Word5 | Fence_addr_lo | 0 | 31 | 当job完成后， 向fence address写入fence value， if fence address = 0, disable this function |
| Body_Word6 | Fence_addr_hi | 0 | 15 |  |
|  | reserved | 16 | 31 |  |
| Body_Word7 | Fence_value_lo | 0 | 31 |  |
| Body_Word8 | Fence_value_hi | 0 | 31 |  |
</table-17>
Event_wait

<table-18>
| Word | Field | From | To | Comment |
| Body_Word1 | Reserved | 0 | 0 |  |
|  | Timestamp | 1 | 1 | 完成时是否向memory中写入timestamp |
|  | Interrupt | 2 | 2 | 完成时是否产生中断给软件 |
|  | Reserved | 3 | 31 |  |
| Body_Word2 | TS_addr_lo | 0 | 31 | 将timestamp写入该Memory address |
| Body_Word3 | TS_addr_hi | 0 | 15 |  |
|  | resersved | 16 | 31 |  |
| Body_Word4 | Wait_Entry0 | 0 | 10 | 等待该entry的值大于等于1，若Entry.keep = 0,满足条件后将该entry值减1， 若Entry.keep = 1, 满足条件entry值保持原值，都满足条件后可继续往下执行， |
|  | Enable | 11 | 11 | 该entry是否有效 |
|  | Reserved | 12 | 31 |  |
| Body_Word5 | Wait_Entry1 | 0 | 10 |  |
|  | Enable | 11 | 11 | 该entry是否有效 |
|  | Reserved | 12 | 31 |  |
| Body_Word6 | Wait_Entry2 | 0 | 10 |  |
|  | Enable | 11 | 11 | 该entry是否有效 |
|  | Reserved | 12 | 31 |  |
| Body_Word7 | Wait_Entry3 | 0 | 10 |  |
|  | Enable | 11 | 11 | 该entry是否有效 |
|  | Reserved | 12 | 31 |  |
| Body_Word8 | Fence_addr_lo | 0 | 31 | 当job完成后， 向fence address写入fence value， if fence address = 0, disable this function |
| Body_Word9 | Fence_addr_hi | 0 | 15 |  |
|  | reserved | 16 | 31 |  |
| Body_Word10 | Fence_value_lo | 0 | 31 |  |
| Body_Word11 | Fence_value_hi | 0 | 31 |  |
</table-18>
一等多， 多等一都支持
注意：在多等一时， 4个mcu可能会同一时间读这个entry， entry减1操作必须是原子操作， 在event table中可实现原子操作
使用场景：
软件提前知道所有的依赖关系，软件构造包event_signal.keep = 0， event_signal.record_cnt设置为依赖的个数
硬件行为 ： 当event signal 完成时， 硬件将entry.entry cnt设置为event_signal.record_cnt,  entry.keep设置为event_signal.keep,   当event wait来查询， 如果entry.entry cnt >=1, 满足依赖条件，硬件entry.entry cnt 减1。
硬件自动destroy event entry(当所有依赖的event都得到满足后)。软件需要主动destroy event entry
软件发event_signal包时不知道后面的依赖关系， 软件构造包event_signal.keep = 1， 将Record_cnt设置1
硬件行为 ： 当event signal 完成时， 硬件将entry.entry cnt设置为event_signal.record_cnt,  entry.keep设置为event_signal.keep,   当event wait来查询， 如果entry.entry cnt >=1, 满足依赖条件，硬件entry.entry cnt 不减1， 保持原值。
软件需要主动destroy event entry
Nop
Body_Word1~Body_Word30可填任意值， hardware或者firmware将其丢掉
Wait_Host

<table-19>
| Word | Field | From | To | Comment |
| Body_Word1 | Barrier | 0 | 0 | Wait All previous cmd packet done |
|  | reserved | 1 | 31 |  |
| Body_Word2 | Record | 0 | 0 | 完成时是否在event table中记录1：记录0：不记录 |
|  | Record_Entry | 1 | 10 | Event table共1024个entry，软件查询得到一个空闲的entry，当event signal完成时，将此entry赋值为Record_cnt |
|  | Record_cnt | 11 | 15 |  |
|  | Keep | 16 | 16 | Keep = 0: 满足条件后Entry.cnt减1Keep = 1: 满足条件后entry.cnt保持原值 |
|  | Reserved | 17 | 31 |  |
| Body_Word3 | trig_addr_lo | 0 | 31 | 当barrier完成后， 向trig address写入trig value， cpu开始执行。if trig_addr = 0, disable this function |
| Body_Word4 | trig_addr_hi | 0 | 15 |  |
|  | reserved | 16 | 31 |  |
| Body_Word5 | trig_value_lo | 0 | 31 |  |
| Body_Word6 | trig_value_hi | 0 | 31 |  |
| Body_Word7 | Polling_addr_lo | 0 | 31 | polling 地址{Polling_addr_hi, Polling_addr_lo}, 使用的asid用hcqd中的asid， 直到读到{expect_value_hi, expect_value_lo}，该packet执行结束，该stream中的后续的包才能被处理 |
| Body_Word8 | Polling_addr_hi | 0 | 15 |  |
|  | reserved | 16 | 31 |  |
| Body_Word9 | expect_value_lo | 0 | 31 |  |
| Body_Word10 | expect_value_hi | 0 | 31 |  |
| Body_Word11 | Fence_addr_lo | 0 | 31 | 当job完成后， 向fence address写入fence value， if fence address = 0, disable this function |
| Body_Word12 | Fence_addr_hi | 0 | 15 |  |
|  | reserved | 16 | 31 |  |
| Body_Word13 | Fence_value_lo | 0 | 31 |  |
| Body_Word14 | Fence_value_hi | 0 | 31 |  |
</table-19>
该packet由firmware处理， 用来等待host的处理结束
处理流程如下:
首先gpu等待前面的包完成（如果barrier == 1）
gpu向trig addr写入trig value通知cpu， 也可以跳过这一步（trig_addr ==0）
cpu看到trig value后， 执行回调函数， 完成后写polling value到polling addr
同时gpu pollingPolling_addr， 直到polling到polling value
之后gpu写fence_value到fence addr， 通知cpu该packet完成
Register
CP在SOC中的全局编址在32’h440_0000~47F_FFFF 4MB空间内， 下面是内部的划分， 地址为相对32’h440_0000的offset

<table-20>
| modulePIPEi(i=0,1, 2,3)HCQDj(j=0, 1, 2, 3, 4, 5, 6, 7) | Start address | End address | Size |
| PIPEi.HCQDj | 0x1000*i+0x80*j | 0x1000*i+0x7F*(j+1) | 128B |
| PIPEi.CPE | 0x1000*i+0x400 | 0x1000*i+0x7FF | 1KB |
| reserved0 | 0x1000*i+0x800 | 0x1000*i+0xFFF | 2KB |
| TOP | 0x4000 | 0x4FFF | 4KB |
| Doorbell | 0x5000 | 0x5FFF | 4KB |
| Event_table | 0x6000 | 0x8FFF | 12KB |
| mcu_slv_control | 0x9000 | 0x9FFF | 4KB |
| reserved1 | 0xA000 | 0xFFFF | 24KB |
| Gctrl | 0x1_0000 | 0x1_FFFF | 64KB |
| sdma0 | 0x2_0000 | 0x2_FFFF | 64KB |
| sdma1 | 0x3_0000 | 0x3_FFFF | 64KB |
| TCU | 0x4_0000 | 0x4_FFFF | 64KB |
| reserved | 0x5_0000 | 0xF_FFFF | 0x10_0000-0x5_0000 |
</table-20>
寄存器全局编址参考confluence网页
https://confluence.aigcic.com/pages/viewpage.action?pageId=26222263
寄存器文件csv位置：
$REPO/design/cp_ss/rtl/reg/
AIGCIC_CP_reg_top.csv
AIGCIC_CP_reg_hcqd.csv
AIGCIC_CP_reg_cpe.csv
Top register
$REPO/design/reg/AIGCIC_CP_reg_top.csv
$REPO/design/reg/AIGCIC_CP_reg_doorbell.csv
$REPO/design/reg/AIGCIC_CP_reg_event.csv
Mailbox寄存器在IMC中， 每个中断msg寄存器有4个， 具体查看IMC MAS
HCQD register
参考Hardware Command Queue Description或者
$REPO/design/reg/AIGCIC_CP_reg_hcqd.csv
CPE register
$REPO/design/reg/AIGCIC_CP_reg_cpe.csv
Gctrl
PE 相关 Register - 文档平台 - Confluence文档共享平台
SDMA
$REPO/design/reg/AIGCIC_CP_reg_sdma.csv

<table-21>
| Register | Offset | Attri | Description |
| src_addr_lo |  | RW | Src地址 |
| src_addr_hi |  | RW |  |
| Dst_addr_lo |  | RW | Dst地址 |
| Dst_addr_hi |  | RW |  |
| size |  | RW | Byte粒度 |
| Dma_mode |  | RW | 0：memory copy1： constant fill（src addr 的值当作constant data）2： prefetch（dst addr忽略） |
| EU_cfg |  | RW | Max_rlen[3:0]： 最大4Max_wlen[7:4]： 最大4Max_rosd[16:8]: 最大256Max_wosd[25:17]： 最大256 |
| Dma_status |  | RO | [0]: dma_busy[1]: Rd_err[2]: Wr_err |
| Copy_Cmd_cnt |  | RO |  |
| Fill_cmd_cnt |  | RO |  |
| Fetch_cmd_cnt |  | RO |  |
| aw_stall_cycle_lo |  | RO | Awready反压awvalid的counter数， 当Awvalid & !awready时 counter+1 |
| aw_stall_cycle_hi |  | RO |  |
| w_stall_cycle_lo |  | RO | wready反压wvalid的counter数， 当wvalid & !wready时 counter+1 |
| w_stall_cycle_hi |  | RO |  |
| ar_stall_cycle_lo |  | RO | Arready反压arvalid的counter数， 当Arvalid & !arready时 counter+1 |
| ar_stall_cycle_hi |  | RO |  |
| Aw_req_cnt_lo |  | RO | Awvalid & awready的计数，当Awvalid & awready时， counter+1 |
| Aw_req_cnt_hi |  | RO |  |
| B_resp_cnt_lo |  | RO | bvalid & bready的计数，当bvalid & bready时， counter+1 |
| B_resp_cnt_hi |  | RO |  |
| Ar_req_cnt_lo |  | RO | Arvalid & arready的计数，当Arvalid & arready时， counter+1 |
| Ar_req_cnt_hi |  | RO |  |
| rlast_resp_cnt_lo |  | RO | rvalid & rready& rlast的计数，当rvalid & rready& rlast时， counter+1 |
| rlast_resp_cnt_hi |  | RO |  |
</table-21>
Module Description
CRG
CP时钟设计方案
cp_core的工作时钟是1GHz，包含fun_clk, aon_clk, sdma0_clk, sdma1_clk,  timer_clk是50MHz，其中aon_clk是常开的，其它时钟均有独立的AIGCIC_common_crg模块控制时钟复位。
cp_noc的工作时钟是1GHz，其中cp_ctrl_noc的时钟是aon_clk，cp_data_noc的时钟是cp_noc_clk。
Ctrl_noc_clk为1.6GHz，来自imc。
data_noc_clk为1.6GHz，跟fabric_data_noc_clk是同频同源异步时钟，fabric_data_noc_clk来自imc。
CP_lcrg
默认状态下CP中所有CRG的时钟都是关的状态，且复位有效的状态。
clk_ctrl_noc、clk_data_noc、ref_clk、jtag_tck之间是外部提供异步时钟。
common_crg、ctrl_noc_crg、data_noc_crg、fabric_data_noc_crg由来自imc的cp_clken、cp_reset_n和cp_crg_fsm_cnt控制。
timer_crg_clk_a, fun_crg_clk_a, always_on_clk_a, cp_noc_crg_clk_a, sdma0_crg_clk_a, sdma1_crg_clk_a之间为同步时钟，其余时钟之间为异步关系。
输出的pll_fout_clk为内部pll产生的时钟的分频后的测试时钟，跟其它时钟为异步关系，分频系数1-256可配，详见CP.top寄存器。
CP_lcrg配置流程
1，释放上电复位，提供参考时钟
2，让imc释放cp子系统的时钟复位，并检查imc中相关寄存器，复位是否释放完成
3，配置pll产生1GHz时钟，并将cp的工作时钟从参考时钟切换到该时钟，pll具体配置方法参考SOC中PLL的配置说明，简易流程如下：
写CP_REG_TOP.pll_cfg0.pllen 为1
等待CP_REG_TOP.pll_status[8] 为1
向CP_REG_TOP.pll_cfg3.clk_ref_sel_fun写1
4，根据需求配置crg_timer、crg_core、crg_noc、crg_sdma0和crg_sdma1产生相关时钟。
CPF
Hardware Command Queue Description

<table-22>
| Register | Field | Width | Description | Bind |
| doorbell id(0x0) | Doorbell_id | 32 | Doorbell ID | Y |
| Hcqdid(0x1) | Hcqdid | [2:0] | hcqdid in one pipe |  |
|  | pipeid | [4:3] | pipe id |  |
|  | reserved | [31:5] |  |  |
| Attri(0x2) | priority | [3:0] | 0~7, 0 is first priority | Y |
|  | blocking | [4] | 1：该queue中的cmd packet按顺序执行， 后面的等前面的做完才能开始做0：顺序发送，可能是乱序执行， 软件通过显式的sync来保证顺序 | Y |
|  | asid | [9:5] | 地址空间ID， 最大支持32个asid | Y |
|  | Stream_id | [14:10] | Stream id | Y |
|  | rptr_update_hint | [17:15] | CP更新Read pointer的策略，每当从CPE执行2**(rptr_update_hit)个cmd packet， 更新一次read pointer, 除此之外，空（exe_ptr == wptr）也会更新。当rptr_update_hint为最大值， 即全1， 该模块将disable更新rptr的功能注意：可能会由于总线反压等原因导致丢失一些更新) | Y |
|  | Reserved | [31:18] |  |  |
| rb_base_lo(0x3) | rb_base_lo | 32 | Ringbuffer base地址 | Y |
| rb_base_hi(0x4) | rb_base_hi | [15:0] |  | Y |
|  | Reserved | [31:16] |  |  |
| rb_size(0x5) |  | [31:0] | Ringbuffer size(byte)， 注意必须为cmd packet size（128Byte）的整数倍 | Y |
| wptr(0x6) |  | [31:0] | Write pointer， 最高bit为toggle bit， 开始为0 | Y |
| fet_rptr(0x7) |  | [31:0] | Fetch_Read pointer， 最高bit为toggle bit， 开始为0 | Y |
| exe_rptr(0x8) |  | [31:0] | CPE已经执行到的read pointer， 最高bit为toggle bit， 开始为0 | Y |
| wrptr_addr_lo(0x9) | wrptr_addr_lo | [31:0] | 128Byte对齐，Write pointer和read pointer的地址, 在内存中的摆放顺序为{exe read pointer， write pointer} | Y |
| wrptr_addr_hi(0xA) | wrptr_addr_hi | [15:0] |  | Y |
|  | reserved | [31:16] |  |  |
| idle_timeout_threshold(0xB) | idle_timeout_threshold | [31:0] | [31]: idle timeout enable, 1 is enable, 0 is disableIdle_timeout_threthold[30:0]，触发中断给mcu, 20ns为单位， 使用50MHz的恒频时钟， 可表示的最大值为2^31 * 20ns约42秒， 建议小于20s | Y |
| Status(0xC) | Empty_fetch | [0] | Rptr_fetch==wptr | N |
|  | Empty_exe | [1] | Rptr_exe == wptr | N |
|  | bus_rd_idle | [2] | Bus read outstanding counter = 0 | N |
|  | bus_wr_idle | [3] | Bus write outstanding counter = 0 | N |
|  | idle | [4] | Empty & finish_osd_cnt == 0 & bus_rd_idle & bus_wr_idle | N |
|  | idle_timeout | [5] | 当idle timeout enabled， 并且idle的cycle数超过配置的阈值，idle timeout拉高 | N |
|  | ato_status | [8:6] | 该queue执行atomic的状态， 为atomic状态机的值， 可参考atomic模块设计 | N |
|  | reserved | [15:9] |  |  |
|  | finish_osd_cnt | [23:16] | hcqd每发出一个cmd packet读， osd_cnt+1 ，每finish一个cmd packet，finish_osd_cnt-1 | N |
|  | cost_osd_cnt | [31:24] | hcqd每发出一个cmd packet读， osd_cnt+1， fw每消耗一个cmd packet，cost_osd_cnt-1 | N |
| Active(0x1F) | active | [0] | 与一个软件的stream绑定上， active=1 | Y |
|  | reserved | [31:1] |  |  |
</table-22>
功能描述
响应doorbell， 如果doorbell hit， 并且比当前的值大， 则更新wptr
从ringbuffer中读取cmd packet， 保存到内部的fifo中， 判断ringbuffer非空， 并且内部fifo可以接收
将从总线回来的读数据拆分成32bit数据
将cmd packet中的nop去掉， 不写入fifo， nop指1024bit中大于body size的部分
写rptr到memory中， 每消耗一定数量或者消耗完， 都会更新
响应stop命令，完成后报中断给mcu
响应release命令， 如果有新的rptr， 就将其写入memory中
当idle一定时间， 产生中断给mcu, 并将idle_timeout记录在寄存器中
Corner场景
参考work flow中的图， 由于bind和下doorbell的路径不一样， 可能会导致两个问题
问题1：umd产生某个stream的cmd packet写入host memory中， 更新其位于host memory中的wptr，更新为wptr0，  下发doorbell给GPU，可下发多次， 第二次更新wptr为wptr1，  同时， 调度mcu准备该stream绑定到hardware queue上， 调度mcu读取host memory中的wptr， 将其配置给某个HCQD， 假如在某种corner情况下， 调度mcu读到的wptr为第二次更新的wptr， 即wptr1， 下发doorbell的路径latency很大， wptr0才下发给CP， 会出现doorbell的下来的wptr比bind的wptr还旧的情况
Solution： doorbell下发时判断所携带wptr是否比当前的wptr capacity大， 如果比现有的大， 则更新， 否则不更新
问题2：一般情况下， Bind的wptr比doorbell的wptr旧是没有问题的，但是如果最后一次doorbell miss（由于还没有bind到hardware queue）， 则bind时的wptr就不是最新的， HCQD将无法得到最新的wptr， 从而无法将这个stream的所有job做完。
超过32个queue， 需要scheduling的情况下， 软件可以不做任何处理， 功能是没问题的，只是会多一次调度， 如果想避免这种情况，可采取以下方法，
不超32个queue的情况，可能有问题， 需要scheduling firmware去读mcqd的wptr,rptr， 更新到hcqd.wtr中
Solution1：bind之后再从wrptr_addr读一次wptr, 更新到hcqd.wptr中， 硬件会判断如果wptr比内部的wptr大， 则更新， 如果比内部的wptr小， 会忽略
Solution2： 在绑定上的任何时刻（firmware可以选择一个时机， 比如需要release这个queue的时候）， 再读一次wptr更新到hcqd上
Solution3：
使用CP中的master mcu轮询软件queue的wrptr_addr， 如果有新的wptr更新， 将新的wptr配置给对应的hcqd， 由于只有master mcu来更新wptr， 就不会出现上述的两个问题
CPE
NX900 RISC-V core
Feature
基于RISCV指令集的CPU是CP模块中的一个重要组成部分，用于处理中断响应，控制DMA的数据搬运等操作。考虑到应用场景以及算力要求，CP模块内部的RISCV CPU为4个user core+1个master core结构，每个CPU核采用芯来的NX900核实现。
CP模块中每个NX900核的主要指标如下：
64位RISCV结构处理器核心，地址位宽48bit，支持RV64GC与32GC指令集；
核内流水线微架构：9级流水线，2取指，2发射，顺序执行结构；
理论性能：Dhrystone 3.09 DMIPS/Mhz, coremark 5.50 CM/Mhz;
总线结构：支持AXI4总线，32~256 bit位宽可配置；
CORE内存储结构：选择本地存储(local memory)结构，user core64KB Inst LM+ 64KB Data LM，master core配置大小为256KB Inst LM+ 256KB Data LM。外部模块通过AXI协议格式的slave port，接入local memory control总线，可以访问核内ILM和DLM；
运行频率：和CP主时钟一样1.0Ghz；
时钟与复位控制：每个核顶层集成了自研CRG（时钟与复位控制）模块；
核内与外部的交互：核内总线通过Sysbus的AXI接口，与SOC系统的control NoC，data NoC进行互联；
Timer:核内包含timer模块，由rtc_clk来驱动；
Debug&Trace:核内包含完整的debug模块，debug&trace信号通过核顶层标准的jtag，trace接口交互；
中断处理模块：每个NX900核均包含一个ECLIC模块，用于处理中断响应；
中断类型：master core可处理256（user core 64）条常规中断irq命令，以及不可屏蔽中断nmi（non-maskable interrupt）；
中断来源：包含核内产生的中断，以及系统产生的外部中断；
Memory mapping
User mcu

<table-23>
| Memory space | Range | Size |
| ILM | 0x8000_0000~0x8001_0000 | 64KB |
| DLM | 0x9000_0000~0x9001_0000 | 64KB |
| IRegion | 0x1800_0000~2000_0000 | 128MB |
| IINFO | [offset]0x0~0x1_0000 | 64KB |
| DEBUG | [offset]0x1_0000~0x2_0000 | 64KB |
| ECLIC | [offset]0x2_0000~0x3_0000 | 64KB |
| Timer | [offset]0x3_0000~0x4_0000 | 64KB |
| SMP&CC | [offset]0x4_0000~0x5_0000 | 64KB |
| CIDU | [offset]0x5_0000~0x6_0000 | 64KB |
| PLIC | [offset]0x400_0000~0x800_0000 | 64MB |
| PPI, interaction buffer | 0x4000_0000~0x5000_0000 | 256MB |
| PPI, memory-mapped registers | 0x5000_0000~0x6000_0000 | 256MB |
| MEMORY | 0xA000_0000~0xE000_0000 |  |
</table-23>
Master mcu

<table-24>
| Memory space | Range | Size |
| ILM | 0x8000_0000~0x8004_0000 | 256KB |
| DLM | 0x9000_0000~0x9004_0000 | 256KB |
| IRegion | 0x1800_0000~2000_0000 | 128MB |
| IINFO | [offset]0x0~0x1_0000 | 64KB |
| DEBUG | [offset]0x1_0000~0x2_0000 | 64KB |
| ECLIC | [offset]0x2_0000~0x3_0000 | 64KB |
| Timer | [offset]0x3_0000~0x4_0000 | 64KB |
| SMP&CC | [offset]0x4_0000~0x5_0000 | 64KB |
| CIDU | [offset]0x5_0000~0x6_0000 | 64KB |
| PLIC | [offset]0x400_0000~0x800_0000 | 64MB |
| PPI, interaction buffer | 0x4000_0000~0x5000_0000 | 256MB |
| PPI, memory-mapped registers | 0x5000_0000~0x6000_0000 | 256MB |
| MEMORY | 0xA000_0000~0xE000_0000 |  |
</table-24>
Data noc地址remap，和firmware约定：
Firmware访问0xA000_0000~0xB000_0000, 对应remap0地址
Firmware访问0xB000_0000~0xC000_0000, 对应remap1地址
Firmware访问0xC000_0000~0xD000_0000, 对应remap2地址
Firmware访问0xD000_0000~0xE000_0000, 对应remap3地址
举例如下：假设firmware需要访问memory地址0x8000_0040,
firmware首先配置remap0寄存器为0x8000_0000
之后firmware发出0xA000_0040地址，
经过硬件remap后， 可以输出0x8000_0040地址，
即：Mem_addr = Fw_Addr(0xA000_0040) - base(0xA000_0000) + remap_addr(0x8000_0000) = 0x8000_0040
Ctrl noc地址不需要做地址remap，访问范围256M能够覆盖全芯片ctrl noc地址范围。
firmware发出0x5042_0040, 硬件输出ctrl noc的地址为 ctrl_addr =  Fw_Addr(5042_0040) - base(0x5000_0000)
Ctrl noc地址remap， 和firmware约定：
Firmware访问0x5000_0000~0x6000_0000
举例如下：假设firmware需要访问ctrl noc地址0x7042_0040,
firmware发出0x5042_0040, 硬件输出ctrl noc的地址为 ctrl_addr =  Fw_Addr(5042_0040) - base(0x5000_0000) + ctrl_remap_addr(0x7000_0000)= 0x7042_0040
Interaction buffer
访问未定义的interaction buffer， 读返回0, 不返回slverr
RD_* ：只读
WR_* ：只写
RW_*：读写
1、USER/Master CORE Interaction buffer

<table-25>
| Buffer name(address) | Offset | Note | User | Master |
| RD_MCU_ID | 0x0 | MCU_ID | Y | Y |
| RD_RB_QOS | 0x4 | {rb7_qos[3:0], rb6_qos[3:0], rb5_qos[3:0], rb4_qos[3:0], rb3_qos[3:0], rb2_qos[3:0], rb1_qos[3:0], rb0_qos[3:0]} | Y |  |
| RD_RB_STATUS | 0x8 | Empty status, {rb7_empty, ... rb1_empty, rb0_empty}} | Y |  |
| RD_RB_CANDIDATE | 0xc | Candidate ringbuffer, {rb7_candidate, ... rb1_candidate, rb0_candidate}candidate= ~empty & ~cmd_fifo[rb_fifo[rptr][OP_TYPE]].full.硬件产生一个信号， 即上游fifo中读指针所在的cmd packet在下游中的cmd fifo可以容纳至少一个完整的包， 如果是， 则candidate = 1， 否则为0；signal/wait以及自定义包时candidate = 1，firmware可参考该信号选择hardware queue | Y |  |
| RD_RB0_CNT | 0x10 | rb fifo0中有多少个command packet，有效位宽[7:0] | Y |  |
| RD_RB1_CNT | 0x14 |  | Y |  |
| RD_RB2_CNT | 0x18 |  | Y |  |
| RD_RB3_CNT | 0x1c |  | Y |  |
| RD_RB4_CNT | 0x20 |  | Y |  |
| RD_RB5_CNT | 0x24 |  | Y |  |
| RD_RB6_CNT | 0x28 |  | Y |  |
| RD_RB7_CNT | 0x2c |  | Y |  |
| RD_RB0_DATA | 0x40 | Read hcqd.rb_fifo中的cmd packet | Y |  |
| RD_RB1_DATA | 0x44 |  | Y |  |
| RD_RB2_DATA | 0x48 |  | Y |  |
| RD_RB3_DATA | 0x4c |  | Y |  |
| RD_RB4_DATA | 0x50 |  | Y |  |
| RD_RB5_DATA | 0x54 |  | Y |  |
| RD_RB6_DATA | 0x58 |  | Y |  |
| RD_RB7_DATA | 0x5c |  | Y |  |
| RD_RB0_PEEK | 0x60 | Peek ringbuffer data， 不会将数据真正从fifo中读出，详见Feature:第三点 | Y |  |
| RD_RB1_PEEK | 0x64 |  | Y |  |
| RD_RB2_PEEK | 0x68 |  | Y |  |
| RD_RB3_PEEK | 0x6c |  | Y |  |
| RD_RB4_PEEK | 0x70 |  | Y |  |
| RD_RB5_PEEK | 0x74 |  | Y |  |
| RD_RB6_PEEK | 0x78 |  | Y |  |
| RD_RB7_PEEK | 0x7c |  | Y |  |
| RD_MCU_ATO_RDATA | 0x80 | mcu模仿atomic行为时，返回的rdata（buser返回的数据） | Y | Y |
| WR_CPD_PKT_HDR | 0x100 | Compute job header | Y |  |
| WR_SDMA_PKT_HDR | 0x104 | SDMA job header | Y |  |
| WR_VPU_PKT_HDR | 0x108 | Video job header | Y |  |
| WR_ATO0_PKT_HDR | 0x110 | hcqd0的Atomic job header | Y |  |
| WR_ATO1_PKT_HDR | 0x114 |  | Y |  |
| WR_ATO2_PKT_HDR | 0x118 |  | Y |  |
| WR_ATO3_PKT_HDR | 0x11c |  | Y |  |
| WR_ATO4_PKT_HDR | 0x120 |  | Y |  |
| WR_ATO5_PKT_HDR | 0x124 |  | Y |  |
| WR_ATO6_PKT_HDR | 0x128 |  | Y |  |
| WR_ATO7_PKT_HDR | 0x12c |  | Y |  |
| WR_CLS_PKT_BODY | 0x180 | Compute job body | Y |  |
| WR_SDMA_PKT_BODY | 0x184 | SDMA job body | Y |  |
| WR_VPU_PKT_BODY | 0x188 | Video job body | Y |  |
| WR_ATO0_PKT_BODY | 0x190 | hcqd0的Atomic job body | Y |  |
| WR_ATO1_PKT_BODY | 0x194 |  | Y |  |
| WR_ATO2_PKT_BODY | 0x198 |  | Y |  |
| WR_ATO3_PKT_BODY | 0x19c |  | Y |  |
| WR_ATO4_PKT_BODY | 0x1a0 |  | Y |  |
| WR_ATO5_PKT_BODY | 0x1a4 |  | Y |  |
| WR_ATO6_PKT_BODY | 0x1a8 |  | Y |  |
| WR_ATO7_PKT_BODY | 0x1ac |  | Y |  |
| WR_ATO0_OSD_DEC | 0x1b0 | when atomic cmpswap stop on loop ,because ato osd cnt will not minus one by hardware, so fw is required to write 1 to this reg, then ato_osd minus one to clear ato osd as 0 | Y |  |
| WR_ATO1_OSD_DEC | 0x1b4 |  | Y |  |
| WR_ATO2_OSD_DEC | 0x1b8 |  | Y |  |
| WR_ATO3_OSD_DEC | 0x1bc |  | Y |  |
| WR_ATO4_OSD_DEC | 0x1c0 |  | Y |  |
| WR_ATO5_OSD_DEC | 0x1c4 |  | Y |  |
| WR_ATO6_OSD_DEC | 0x1c8 |  | Y |  |
| WR_ATO7_OSD_DEC | 0x1cc |  | Y |  |
| RD_RB0_OSD | 0x200 | {ato0_osd[2:0], sdma_osd[3:0], cls_osd[7:0]} | Y |  |
| RD_RB1_OSD | 0x204 |  | Y |  |
| RD_RB2_OSD | 0x208 |  | Y |  |
| RD_RB3_OSD | 0x20c |  | Y |  |
| RD_RB4_OSD | 0x210 |  | Y |  |
| RD_RB5_OSD | 0x214 |  | Y |  |
| RD_RB6_OSD | 0x218 |  | Y |  |
| RD_RB7_OSD | 0x21c |  | Y |  |
| WR_FW_CONSUME_RB0 | 0x300 | Firmware取出一个cmd packet， 将1写入对应queue的buffer地址，Firmware要保证取出的cmd packet一定会完成。HCQD会更新exe_rptr。对于cmpswap， 要等到cmpswap成功完成后再写这个buffer， 因为cmpswap不能保证一定成功完成。cost osd会减1 | Y |  |
| WR_FW_CONSUME_RB1 | 0x304 |  | Y |  |
| WR_FW_CONSUME_RB2 | 0x308 |  | Y |  |
| WR_FW_CONSUME_RB3 | 0x30c |  | Y |  |
| WR_FW_CONSUME_RB4 | 0x310 |  | Y |  |
| WR_FW_CONSUME_RB5 | 0x314 |  | Y |  |
| WR_FW_CONSUME_RB6 | 0x318 |  | Y |  |
| WR_FW_CONSUME_RB7 | 0x31c |  | Y |  |
| WR_FW_DROP_RB0 | 0x400 | 当firmware 收到stop命令时， firmware将rb fifo中的命令取出并丢掉， 将1写到对应queue的该buffer中， HCQD不会更新rptr， 当该queue被再次bind时， 这些被drop的包还会再次被处理。cost osd和finish osd都会减1 | Y |  |
| WR_FW_DROP_RB1 | 0x404 |  | Y |  |
| WR_FW_DROP_RB2 | 0x408 |  | Y |  |
| WR_FW_DROP_RB3 | 0x40c |  | Y |  |
| WR_FW_DROP_RB4 | 0x410 |  | Y |  |
| WR_FW_DROP_RB5 | 0x414 |  | Y |  |
| WR_FW_DROP_RB6 | 0x418 |  | Y |  |
| WR_FW_DROP_RB7 | 0x41c |  | Y |  |
| WR_FW_PKT_ADD_RB0 | 0x500 | Firmware add one packet, hcqd finish outstanding counter + 1 | Y |  |
| WR_FW_PKT_ADD_RB1 | 0x504 |  | Y |  |
| WR_FW_PKT_ADD_RB2 | 0x508 |  | Y |  |
| WR_FW_PKT_ADD_RB3 | 0x50c |  | Y |  |
| WR_FW_PKT_ADD_RB4 | 0x510 |  | Y |  |
| WR_FW_PKT_ADD_RB5 | 0x514 |  | Y |  |
| WR_FW_PKT_ADD_RB6 | 0x518 |  | Y |  |
| WR_FW_PKT_ADD_RB7 | 0x51c |  | Y |  |
| WR_FW_FINISH_RB0 | 0x600 | Firmware finish one cmd packet | Y |  |
| WR_FW_FINISH_RB1 | 0x604 |  | Y |  |
| WR_FW_FINISH_RB2 | 0x608 |  | Y |  |
| WR_FW_FINISH_RB3 | 0x60c |  | Y |  |
| WR_FW_FINISH_RB4 | 0x610 |  | Y |  |
| WR_FW_FINISH_RB5 | 0x614 |  | Y |  |
| WR_FW_FINISH_RB6 | 0x618 |  | Y |  |
| WR_FW_FINISH_RB7 | 0x61c |  | Y |  |
| WR_USE_IDMA | 0x700 | 0:不使用idma 1:使用idma | Y |  |
| WR_IDMA | 0x704 | [2:0]: Src index: rb_fifo[src_index[2:0]][6:3]: Dst index: 0：cls fifo1：sdma fifo2：vpu fifo8：ato fifo09：ato fifo110：ato fifo211：ato fifo312：ato fifo413：ato fifo514：ato fifo615：ato fifo7Others：illegal[12:7]: Length: 0代表1， .., 最大32个word | Y |  |
| RD_IDMA_STATUS | 0x708 | 0：busy， 1：idle | Y |  |
| WR_IRQ_CLR | 0x800 | 写相应中断号清除中断 | Y | Y |
| WR_IRQ_INFO | 0x804 | 写中断的相关信息{seqid[9:0],streamid[4:0],asid[4:0],hcqdid[2:0],int_id[2:0],mcu_id[2:0]} | Y | Y |
| RD_IRQ_FULL | 0x808 | interrupt fifo full1: full0: not full | Y | Y |
| WR_IRQ_MASK | 0x80c | 32位宽，从第0bit到31bit分别对user_mcu中断0-31或者master_mcu的中断128-159进行mask，对应bit为0表示该中断被屏蔽 | Y | Y |
| RW_CTRL_AWUSER | 0x900 | 访问ctrl noc的awuser，awuser共8bits，其[3:0]为gctrl需要使用，标识cluster，非特殊情况不去配置，保持默认值全0；[7:4]为unit id标识，user mcu默认值为5~8,master mcu为9。 | Y | Y |
| RW_CTRL_ARUSER | 0x904 | 访问ctrl noc的aruser，aruser共8bits，其[3:0]为gctrl需要使用，标识cluster，非特殊情况不去配置，保持默认值全0；[7:4]为unit id标识，user mcu默认值为5~8,master mcu为9。 | Y | Y |
| RW_DATA_AXCACHE | 0xA00 | 访问data noc需要的axcache | Y | Y |
| RW_DATA_AWUSER | 0xA04 | 访问data noc的awuser，awuser共32bits，user位域的定义严格参照芯片的user定义，其中[22:18]为asid位，[31:28]为unit id标识，user mcu默认值为8000~b000,master mcu为f000。且经过mmu后只保留[17:0] | Y | Y |
| RW_DATA_ARUSER | 0xA08 | 访问data noc的aruser，aruser共32bits，user位域的定义严格参照芯片的user定义，其中[22:18]为asid位，[31:28]为unit id标识，user mcu默认值为8000~b000,master mcu为f000。且经过mmu后只保留[17:0] | Y | Y |
| RW_AWDATA_REMAP0_LO | 0xA0C | user core写访问data noc的remap0寄存器低32位 | Y | Y |
| RW_AWDATA_REMAP0_HI | 0xA10 | user core写访问data noc的remap0寄存器高16位 | Y | Y |
| RW_AWDATA_REMAP1_LO | 0xA14 | 同remap0 | Y | Y |
| RW_AWDATA_REMAP1_HI | 0xA18 | 同remap0 | Y | Y |
| RW_AWDATA_REMAP2_LO | 0xA1C | 同remap0 | Y | Y |
| RW_AWDATA_REMAP2_HI | 0xA20 | 同remap0 | Y | Y |
| RW_AWDATA_REMAP3_LO | 0xA24 | 同remap0 | Y | Y |
| RW_AWDATA_REMAP3_HI | 0xA28 | 同remap0 | Y | Y |
| RW_ARDATA_REMAP0_LO | 0xA2C | user core读访问data noc的remap0寄存器低32位 | Y | Y |
| RW_ARDATA_REMAP0_HI | 0xA30 | user core读访问data noc的remap0寄存器高16位 | Y | Y |
| RW_ARDATA_REMAP1_LO | 0xA34 | 同remap0 | Y | Y |
| RW_ARDATA_REMAP1_HI | 0xA38 | 同remap0 | Y | Y |
| RW_ARDATA_REMAP2_LO | 0xA3C | 同remap0 | Y | Y |
| RW_ARDATA_REMAP2_HI | 0xA40 | 同remap0 | Y | Y |
| RW_ARDATA_REMAP3_LO | 0xA44 | 同remap0 | Y | Y |
| RW_ARDATA_REMAP3_HI | 0xA48 | 同remap0 | Y | Y |
</table-25>
Feature:
1.正常的包（不进行拆分，只发送一个cmd），不需执行WR_FW_PKT_ADD_RBx,fw写一次WR_FW_CONSUME_RBx或者写一次WR_FW_DROP_RBx（对于stop或flush流程）
2.需要拆分的包，fw拆分成n个包，需执行n-1次WR_FW_PKT_ADD_RBx,fw仍只写一次WR_FW_CONSUME_RBx或者写一次WR_FW_DROP_RBx（对于stop或flush流程）
3.queue中的rb_fifo存在两个读指针，rd1_ptr和rd2_ptr,rd1_ptr在fw读RD_RB*_DATA和idma读fifo时指针递增；rd2_ptr由fw读RD_RB*_PEEK递增，同时在rd1_ptr变化时会更新为rd1_ptr的值，peek读出的数据只供软件使用，硬件不处理，peek不会影响rb fifo的cnt(RD_RB*_CNT)以及空满判断；
peek的指针在每次读RD_RB*_PEEK时加1，在每次fw读RD_RB*_DATA或者idma工作时会被rd1_ptr的覆盖。
rd1_en:fw读RD_RB*_DATA和idma读fifo时有效。
rd2_en：fw读RD_RB*_PEEK时有效
DV:此功能的前提是rd1_en和rd2_en不会紧接着有效，即rd1_en_d不会和rd2_en同一拍
目的：非signal/wait包，fw peek数据时只想peekheader和body0，其他的body不想要，因此在RD_RB*_DATA读出后，让peek指针跟着变化。同时不影响signal/wait peek整个包
CPU Core的集成
CP子系统一共包含5个CPU core， 其中4个做包的转发控制， 每个服务一个pipe，共8个hardware queue， 单独1个做queue的调度和管理， 内部的结构完全一致，因而其顶层信号端口也是一致，对称分布，分别以core0/core1做前缀，主要包括以下几类：
时钟与复位信号接口：

<table-26>
| 信号名 | 信号解释 |
| rtc_clk | cp模块给cpu核内的timer模块提供的时钟； |
| cp_core_sys_rst_n | cp模块给每个cpu核的复位信号； |
</table-26>
DFT模式切换接口：

<table-27>
| 信号名 | 信号解释 |
| dft_mode | 1表示进入DFT模式，0表示常规工作模式； |
</table-27>
中断信号：

<table-28>
| 信号名 | 信号解释 |
| irq_i[255:0] | 每个核可以处理的256（user core 64）条中断输入信号； |
| nmi | 每个核不可屏蔽的中断输入信号； |
</table-28>
Debug&Trace接口：

<table-29>
| 信号名 | 信号解释 |
| core0_jtag_TCK core0_jtag_TMS_in core0_jtag_TDI core0_jtag_TDO core0_jtag_DRV_TDO core0_jtag_TMS_out core0_jtag_DRV_TMS core0_jtag_BK_TMS core0_jtag_dwen core0_jtag_dwbypass | JTAG接口； |
| 信号前缀core0,i0_trace_ivalid i0_trace_iexceptioni0_trace_interrupt i0_trace_cause i0_trace_tval i0_trace_iaddr i0_trace_instr i0_trace_priv i0_trace_bjp_taken i0_trace_dmode i0_trace_cmt_ena i1_trace_ivalid i1_trace_iexceptioni1_trace_interrupt i1_trace_cause i1_trace_tval i1_trace_iaddr i1_trace_instr i1_trace_priv i1_trace_bjp_taken i1_trace_dmode i1_trace_cmt_ena | Trace通路接口；NX900核为双发射流水结构，i0表示流水线1，i1表示流水线2； |
| i_dbg_stop | debug模式终止控制信号； |
| dbg_stop_at_boot | 启动模式下终止debug信号； |
</table-29>
核内总线与外部NOC互联的AXI接口

<table-30>
| 信号名 | 信号解释 |
| 信号前缀core0mem_arready mem_arvalid mem_araddr mem_arlen mem_arsize mem_arburst mem_arlock mem_arsmode mem_ardmode mem_arcache mem_arprot mem_arid mem_awready mem_awvalid mem_awaddr mem_awlen mem_awsize mem_awburst mem_awlock mem_awsmode mem_awdmode mem_awcache mem_awprot mem_awid mem_wready mem_wvalid mem_wdata mem_wstrb mem_wlast mem_rready mem_rvalid mem_rdata mem_rresp mem_rlast mem_rid mem_bready mem_bvalid mem_bresp mem_bid mem_clk_en | 核内总线通过该接口组，按照AXI实现协议，与核外的SoC系统data, ctrl总线进行互联，信号交互。·最大的non-cacheable/device outstanding能力为8·最大cacheable outstanding容量为 2（如果启用了 硬件预取（hardware prefetch），则为 3）· AxPROT[0] = 1 时，表示机器模式（machine mode）；AxPROT[0] = 0 时，表示其他权限模式。AxPROT[2] = 1 时表示指令访问（instruction access），AxPROT[2] = 0 时表示数据访问（data access）。如果 SEC_MODE 配置了安全模式，则 AxPROT[1] 表示安全/非安全模式。· AxLock = 1 (exclusive acess)，当core使用原子指令（Atomic Instruction）访问non-cacheable/device PMA 时。· Axcache 的值：设备区域（Device Region）：4’0000NoC（Network-on-Chip）区域：4’0011缓存区域（Cacheable Region）：4’1111· N900 核默认保持读写顺序，并且可以启用device store non-blocking模式，最大device store outstanding为 8。· AXI ID 规则：如果 L1 DCache 支持预取（prefetch），则 AXI ID = 4；否则，AXI ID = 3；NoC & Device Region 共享相同的 AXI ID。 |
</table-30>
核外访问ILM,DLM的slave_port接口

<table-31>
| 信号名 | 信号解释 |
| 信号前缀core0slv_arready slv_arvalid slv_arid slv_araddrslv_arlen slv_arsize slv_arburst slv_arlock slv_arcache slv_arprot slv_awready slv_awvalid slv_awid slv_awaddr slv_awlen slv_awsize slv_awburst slv_awlock slv_awcache slv_awprot slv_wready slv_wvalid slv_wdata slv_wstrb slv_wlast slv_rready slv_rvalid slv_rid slv_rdata slv_rresp slv_rlast slv_bready slv_bvalid slv_bid slv_bresp slv_clk_en | AXI协议接口；SoC系统通过该接口，访问核内ILM，DLM；·AR/AW channel LOCK/CACHE/PROT/QOS/USR are ignored.·One bit of slv_axaddr is used for choosing ILM or DLM. The number of this bit is the max value of{ILM_ADDR_WIDTH, DLM_ADDR_WIDTH}. Lower bits mean the offset address of ILM or DLM. Higherbits are ignored.·IM indicates Implementation dependent, replies on configurations, and the range of Slave Port\u2019s AXI ID is [4 ~16],default is 4. |
</table-31>
ILM和DLM的sram排布
iDMA
使用iDMA， firmware需要首先配置WR_USE_IDMA为1， 然后写WR_IDMA buffer， 其中
src index， dst index， length， 配置完length， iDMA自动开始， iDMAidle状态可通过读RD_IDMA_STATUS获取。只有当idma处理idle状态时， 才能配置idma
Src index指上游rb fifo其中之一
Dst index指下游compute job， sdma job， video job， atomic job等
Length指word（32bit）长度
注意：一次idma配置必须传输一个完整的packet

<table-32>
| Src index[2:0] | rb_fifo[src_index[2:0]] |
| Dst index[3:0] | 0：cpd fifo1：sdma fifo8：ato fifo09：ato fifo110：ato fifo211：ato fifo312：ato fifo413：ato fifo514：ato fifo615：ato fifo7Others：illegal |
| Length[5:0] | 最大32个word |
</table-32>
合法idma配置如下
cpd fifo: src_index 0~7, dst_index = 0
sdma fifo: src_index0~7, dst_index = 1
ato fifo:
src_index0, dst_index = 8
src_index1, dst_index = 9
src_index2, dst_index = 10
src_index3, dst_index = 11
src_index4, dst_index = 12
src_index5, dst_index = 13
src_index6, dst_index = 14
src_index7, dst_index = 15
QueryDMA
Feature
Scheduling Firmware 配置asid， 进程号， QueryDMA将这个进程的所有mcqd的信息查询一遍， 得到mcqd是否有任务的信息， 返回给firmware， 只是加速查询的过程， firmware也可通过根据下面流程自行查询
1.进程创建， 需要kmd在device memory中创建所有的mcqd， 按照顺序连续存放, 并将进程的mcqd的基地址通过mailbox告知firmware， firmware将其保存在local sram中。proc_valid标记进程是否有效， 进程创建时置1， 进程销毁时清0
2. 软件创建stream， kmd创建{rptr, wptr}空间， 并更新mcqd描述，将wrptr_addr指向{rptr, wptr}
硬件实现一个queryDMA来加速查询某个进程的所有mcqd的状态。
1. firmware将某个进程的mcqd_table_addr(RW)和mcqd_table_mask(RW)配置给queryDMA
2. queryDMA将进程的所有32个mcqd读回来， 得到wrptr_addr
3. queryDMA根据32个mcqd的中的wrptr_addr， 读到32个mcqd的{rptr，wptr}}}}
4. queryDMA比较32个mcqd的rptr和wptr， 将status写入CP寄存器(mcqd_not_empty (RO)  )中，供firmware查询， 并将queryDMA状态(querydma_status(RO))标记为IDLE
5. firmware查询querydma_status到queryDMA状态为IDLE后， 查询mcqd_not_empty寄存器， 获取到32个mcqd的状态，决定是否调度
寄存器描述

<table-33>
| Name | Field/size | describe |
| mcqd_table_addr_lo(RW) | [31:0] | The address of mcqd_table |
| mcqd_table_addr_hi(RW) | [15:0] |  |
| mcqd_table_mask(RW) | [31:0] | Each mcqd_table in mcqd_table has a mask bit, which is used to mask the update of the state of the mcqd ringbuffer. It is masked when it is equal to 0 and updated normally when it is 1 |
| querydma_status(RO) | [2:0] | The real-time status of QueryDMA can be used and read when it is 00:IDLE1:RD_WRPTR_ADDR2:RD_ADDR_WAIT3:RD_WRPTR_VALUE4:RD_VALUE_WAIT |
| querydma_errors(W1C) | [2:0] | Error types when QueryDMA encounters errors,Write 1 to each bit and reset it to zero |
| mcqd_not_empty(RO) | [31:0] | result that Querydma return，it is valid in query_status=0，Save the previous result，and will clear this register while the status of queryDma is RD_WRPTR_ADDR.1 represents not empty. |
</table-33>
其它信息见top register中描述
硬件设计
硬件结构设计
mcqd_num_queue:接受start请求，收到一个start请求后，会根据mcqd_table_mask的值，对没有被屏蔽的mcqd执行任务，连续向osd_arb发送读取wrptr_addr的请求，使用下级的ready信号进行反压。
rpwp_num_queue:含有一个32大小的fifo，保存32个wrptr_addr和对应的id值，当fifo中有数据时，会请求osd_arb进行处理。
osd_arb:将来自mcqd_num_queue和rpwp_num_queue的读请求下发到noc，osd_arb会先将来自mcqd_num_queue的所有读请求处理完毕，其中mcqd_num_queue的arid为0~31，rpwp_num_queue发起的请求中arid是其对应rid加32（将arid[5]置1）。
receive_queue:持续接受数据，如果当id[5]==1,将比较rptr和wptr的值，返回结果，否则将读的值和id送给rpwp_num_queue。
工作状态控制状态机
配置流程
BindDMA
Feature
和queryDMA一样也是为了硬件加速queue-scheduling的目的
支持1个channel，fw需配置mcqd_addr和hcqdid，让bindDMA从memory中读取mcqd的信息并将该mcqd的信息绑定到HCQD上
可通过寄存器binddma_wr_base修改HCQD的base地址
寄存器描述

<table-34>
| Name | Feild/size | describe |
| mcqd_addr_lo(RW) | [31:0] | address of Mcqd |
| mcqd_addr_hi(RW) | [15:0] |  |
| hcqdid(RW) | [4:0] | id of hcqd that bind to |
| binddma_status(RO) | [2:0] | real-time binddma state.0(b000):IDLE1(b001):READ_MCQD3(b011):WAIT_MCQD2(b010):READ_RPWP6(b110):WAIT_RPWP7(b111):BIND_HCQD4(b101):WAIT_BRSP |
| binddma_errors(W1C) | [2:0] | Error types when BindDMA encounters errors,Write 1 to each bit and reset it to zero |
| binddma_wr_base(RW) | [31:0] | base address of pipe0 at ctrl noc,[13:0] is invalid |
</table-34>
其它信息见top register中描述
硬件设计
硬件结构设计
task_req_queue:接受binddma请求，并请求osd_read_req读取mcqd的数据，如果在binddma不是idle的时候收到binddma请求，则向上级报错；
osd_read_req:在READ_MCQD和READ_RPWP状态下分别读取mcqd信息和wrptr_addr指向的值。
osd_read_rcv:在WAIT_MCQD和WAIT_RPWP状态下接受从data_noc都回来的值。
bind_to_hcqd:将读取到的mcqd中需要bind的12个寄存器的值依次向osd_write_access 请求bind到hcqd上。
osd_write_access:根据上级请求在ctrl_noc上发送数据写请求，支持outstanding能力为32。
osd_brsp_rcv:接受outstanding写的brsp，并统计osd个数。
工作状态控制状态机
配置流程
MCU SLAVE读写
先将mcu_slv_write_sel配置为1， 即进入mcu slave读写模式， mcu slave读写模式与firmware prefetch不能同时进行， mcu_slv_write_sel = 0(默认值)为firmware prefetch模式
5个MCU的ILM和DLM可间接访问，对于写， 和firmware prefetch共用ILM/DLM slave口，所以有一个bit mcu_write_sel寄存器可静态配置（软件需要保证firmware prefetch和间接访问不同时进行）， 对于读， 只有间接访问模块可访问
具体流程如下：
先配置mcu_write_sel为1（在top寄存器中）
参考mcu_slv寄存器表格，
对于写， 依次配置wdata0和wdata1和cfg_addr, 配置cfg_addr启动配置， polling status， 读取到status为1之后， 才可进行下一次配置
对于读， 配置cfg_addr, polling status， 读取到status为1之后，读取rdata0和rdata1
注意：One bit of slv_axaddr is used for choosing ILM or DLM. The number of this bit is the max value of {ILM_ADDR_WIDTH, DLM_ADDR_WIDTH}. Lower bits mean the offset address of ILM or DLM. Higher bits are ignored.
对于mcu0/1/2/3/master mcu的ILM来说， cfg_addr不需要加一个固定的值。
对于mcu0/1/2/3的DLM来说， 需要加上64KB（0x1_0000）， 对于master mcu的DLM来说， 要加上256KB（0x4_0000）
Stream Synchronization

<table-35>
| CUDA API | Description | Hardware Behavior |
| cudaDeviceSynchronize | waits until all preceding commands in all streams of all host threads have completed. | Event_signal(barrier = 1) of all streams |
| cudaStreamSynchronize | takes a stream as a parameter and waits until all preceding commands in the given stream have completed. It can be used to synchronize the host with a specific stream, allowing other streams to continue executing on the device. | Event signal(barrier = 1) of a certain stream |
| cudaStreamWaitEvent | takes a stream and an event as parameters (see Events for a description of events)and makes all the commands added to the given stream after the call to cudaStreamWaitEvent()delay their execution until the given event has completed. | Event_wait |
| cudaStreamQuery | provides applications with a way to know if all preceding commands in a stream have completed. | All preceding commands in a stream have completed if outstanding counter == 0查看hcqd的idle状态 |
| cudaEventCreate | Creates an event object | Umd读取event table |
| cudaEventDestroy |  | Umd清空event table |
| cudaEventRecord | Records an event. If stream is non-zero, the event is recorded after all preceding operations in stream have been completed; otherwise, it is recorded after all preceding operations in the CUDA context have been completed. Since operation is asynchronous, cudaEventQuery() and/or cudaEventSynchronize() must be used to determine when the event has actually been recorded. | Barrier and then Signal(interrupt or timestamp) |
| cudaEventSynchronize |  | Barrier |
| cudaEventElapsedTime |  | Barrier |
</table-35>
Flow:
读table_valid_index（地址: 见event_table寄存器表）, 硬件返回index，返回的index为entry_id(0~1023)，同时硬件将该entry的status置1， 如果没有空闲的entry， 硬件返回有效位的最高位为1 （table_valid_index[10]=1），不需关注其他bits
destroy_entry：写入相应的entry_id清除该entry的内容
CPE中有一个event table来做stream间的同步， event table有1024个entry，
32个进程共享这1024个entry， 每个entry是一个5bit counter和1bit状态信号

<table-36>
| Entry id | Status（IDLE ： 0, BUSY： 1） | Reserved_for_future_use | keep | Counter |
| 0 | 1bit | 3bit | 1bit | 5bit |
| 1 | 1bit | 3bit | 1bit | 5bit |
| ... | ... |  | ... | ... |
| 31 | 1bit | 3bit | 1bit | 5bit |
| 32 | 1bit | 3bit | 1bit | 5bit |
| ... |  |  |  |  |
| 63 | 1bit | 3bit | 1bit | 5bit |
| ... |  |  |  |  |
| 1023 | 1bit | 3bit | 1bit | 5bit |
</table-36>
KMD查询entry的状态（table_valid_index寄存器），硬件会返回一个空闲entry id给KMD， 空闲的entry， 其status = 0， counter = 0
KMD通过event signal和event wait来设置stream间的依赖关系， CP在其内部设置和查询event table，正确处理这些依赖
Keep = 0, 满足条件counter -1
Keep = 1， 满足条件counter不变
不管keep = 0或者1， 都需要软件主动destroy event entry
当consumer读到counter = 0，
PS:若keep=0，count=0，此时发生读此entry的操作，数据返回0xdead_cccc;若读取超过寄存器范围的空洞，返回resp err；
Interrupt
参考IMC中断：SOC 时钟/复位/中断/pin - SOC - Confluence文档共享平台

<table-37>
| 中断号 | From | To | Description |
| intr_in[255:0] | IMC/整个芯片 | master MCU[127:0] | 来自IMC中断，包括IPCM（mailbox）中断和其他子系统上报中断，可分担潜在IMC处理中断能力不足的问题， 在master MCU内部可屏蔽 |
|  | CP internal | master MCU[255:128] | CP内部系统中断 |
</table-37>
清除中断信号如果需要在源头清除则需要先在中断信号源头清除，再在mcu端清除

<table-38>
| 中断号 | Description |
| 0 | tcu_int（由mmu产生，page table fault，bus error等） |
| 1 | event_signal_int，firmware通过写interaction buffer的WR_IRQ_INFO产生该中断，产生的中断会缓存在fifo中，如果有未处理的中断，硬件会产生一个中断信号送给host，软件可以通过读取top寄存器中的int_fifo_cnt可以查看未处理的中断数量，读int_fifo_read寄存器可以读出一个中断。（illegal packet，event signal int等） |
| 2 | cp_err_int(compute error， dma error) |
</table-38>
Master mcu intr:

<table-39>
| 中断号 | Description | 是否在源头清中断 |
| 128+0 | tcu_interrupt | 是 |
| 128+1 | hcqd_idle_timeout |  |
| 128+2 | Compute_err | 是 |
| 128+3 | DMA_err | 是 |
| 128+4 | 进程flush request |  |
| 128+5~128+127 | Reserve for CP |  |
</table-39>
User mcu intr(i 表示user mcu 0， 1， 2， 3)

<table-40>
| 中断号 | Description | 是否在源头清中断 |
| 0~6 | IPCMINT0~IPCMINT6 | 是 |
| 7 | reserved |  |
| 8 | stop request |  |
| 9 | 进程flush request |  |
| 10 | hcqd idle timeout |  |
| 11 | Compute_err | 是 |
| 12 | DMA_err | 是 |
| 13 | usart[i]_uart_interrupt_o | 是 |
| 14 | wwdg[i]_WDOGRES | 是 |
| 15~22 | new hcqd bind(for firmware update qos, etc.)15： hcqd016： hcqd1... |  |
</table-40>
CP AIC Interrupt list (TBD)
AIC interrupt vector (4 Words)
ClientID[6:0] is mmio static configured, listed in AIC MAS, 每个中断源有一个唯一的ClientID
Priority = 0 by default, lowest priority, 7 is highest priority
VFID = 8 is PF, 0 for VF0, 1 for VF1, 2 for VF2, and 3 for VF3
IntID interrupt类型

<table-41>
| reserved | IntID[7:0] | VFID[3:0] | Priority[2:0] | clientID[6:0] |
| Self-defined Word1 |  |  |  |  |
| Self-defined Word2 |  |  |  |  |
| Self-defined Word3 |  |  |  |  |
</table-41>

<table-42>
| Interrupt list | clientID | Priority | VFID | IntID | Word1 | Word2 | Word3 |
| Event signal | 0x10 | 0 | as is | 0x1 | Hcqdid, SeqID | Timestamp low 32bit | Timestamp high 32bit |
| Cp2host | 0x10 | 0 | As is | 0x2 | Payload | Payload | Payload |
| Illegal packet | 0x10 | 7 | As is | 0x3 | Hcqdid, SeqID | Previous SeqID | 0 |
| Bus err(smmu page table fault, illegal access, etc.) | 0x10 | 7 | As is | 0x4 | Which bus | 0 | 0 |
| Pe_hang | 0x10 | 4 | As is | 0x5 | Hcqdid, seqid | rguID | 0 |
| video_fault | 0x10 | 4 | As is | 0x6 | Hcqdid， seqid | videoCoreID | 0 |
</table-42>
CPD
CPD接收CPE发过来的cmd packet，
取cfg register（如果cfg_addr！=0）
管理（分配和回收）kernel  index， 以支持Gctrl乱序返回kernel done
将cmd packet done返回到对应的pipe和hcqd
写fence value到fence addr（如果fence addr ！=0）
Cpd中的kernel entry table如下

<table-43>
| Kernel index | Status[2:0]0: idle1:fetch2:write3: wait4: fence5:finish | Hcqdid[4:0] | Asid[4:0] | Fence addr[47:0] | Fence value[63:0] |
| 0 |  |  |  |  |  |
| 1 |  |  |  |  |  |
| ... |  |  |  |  |  |
| 3 |  |  |  |  |  |
</table-43>
Idle表示该entry没有被使用， busy表示已经被占用， 但是还没有完成， done表示已经完成， cpd将执行fence做动作（如有）， 并且将job结束返回给响应的CPE， 之后将status置为idle.

## 16  4个entry table对应4个状态机，相互之间独立。
Idle:表示entry当前空闲，当处于此状态时，entry内寄存器为复位默认值,status为idle；
wait_start:entry被占用开始工作，status从idle->busy，flush时跳至wait_finish
Fetch_cfg：若cfg_addr不为0根据cfg_addr取的cfg_addr/cfg_value
write_reg：写word进gctrl中，需区分是否取过cfg寄存器，若没取则跳过cfg寄存器
Busy:cpd的分发记录工作已经完成，在此状态等待gctrl返回kernel done
Done：status从busy->done，根据fence_addr是否为0，跳转至write_fence或finish
Fence_write/fence_brsp:写fence_value进fence_addr
Wait_finish：等待回finish给上游的状态
Finish：此状态cpd写finish （packet done）返回到对应的pipe和hcqd，ready拉高时，回到idle
block功能：
通过配置寄存器cfg_cpd_hcqd_block_en，以及cmd中Block_Mask位Bit0: compute job，都开启时，cpd会隐含barried的功能，即同一个queue中的submit_JD包会保序，在cpd的设计中的体现为同一个queue的任务需要等上一个完成时才会接受下一个cmd（buffer中仍可以保留一个）。同时为了避免这种情况下cpd反压上游导致影响别的queue的任务分发，cpd会将index_buffer的状态（是否有数据）反馈给上游的cmd_hub，作为mask参与pipe的仲裁。
flush功能：
cpd作为整个flush流程中的一环，当处于flush状态时，相应的queue的cmd下来时，会从start状态直接跳转至wait_finish状态，跳过中间的状态；flush时正处于中间状态（start-wait_finish之间，不包含这两个状态）的任务继续执行。
gctrl寄存器配置顺序:na
图片只需关注配置顺序，具体gctrl寄存器内容参考confluence，第25，配置cfg，cfg为非必须寄存器配置
PS:(for DV)
1.fetch_cfg、write_reg两个状态作为一个整体（简称gctrl状态），不同entry之间在这里是串行的关系，即同一时刻只有一个entry能够处于gctrl状态之中。
2.gctrl状态和fence_write状态以及write_finish状态之间是并行的关系，即entry1处于gctrl状态，entry2可以处于fence_write状态，entry3可以处于write_finish状态
3.fence_write状态往data noc总线写在4个entry之间是share outstanding的（cpd内outstanding最大为16，noc上最大为8），并且可以乱序返回
assertion：
1.送给cpd的cmd_packet必须为Submit_JD包（op_operation为0x10）
2.写gctrl寄存器，count不能处于165~254计数值之间
memory layout:
参见Gctrl MAS
需要补充PE harvesting的input， 每个cluster中有多少个PE被harvest（disable）， Gctrl和clusterCtrl需要考虑这个信息
cpd接口信号

<table-44>
| 信号 | I/O | 位宽 | Note |
| clk | input | 1 | cpd时钟，采用cp系统时钟，常规1GHz |
| reset_n | input | 1 | cp系统复位 |
| gctrl_slv_addr | input | 32 | gctrl寄存器的基地址 |
| gctrl_ret | input | 1 | gctrl返回job done的标志，高有效 |
| gctrl_ret_data | input | 32 | gctrl返回的数据，内容为entry index |
| cpd_cmd_valid | input | 1 | 上游下发cpd cmd的通路 |
| cpd_cmd_data | input | 32*24 |  |
| cpd_cmd_ready | output | 1 |  |
| cpd_finish_valid | output | 1 | cpd返回finish给上游的通路 |
| cpd_finish_ready | input | 1 |  |
| cpd_finish_hcqdid | output | 5 |  |
| Cpd data noc写 |  |  | 写fence，具体见第五章fabric配置 |
| Cpd data noc读 |  |  | 读cfg的配置，具体见第五章fabric配置 |
| Cpd ctrl noc写 |  |  | 写gctrl寄存器，具体见第五章fabric配置 |
| cfg_cpd_hcqd_block_en | input | 1 | 寄存器配置是否开启block |
| hcqd_busy | output | 32 | cpd中相应的hcqd buffer满时，反馈给上游cmd hub作为rr仲裁的mask，避免阻塞 |
| flush_valid | input | 1 | 进程flush的valid信号 |
| flush_queue | input | 32 | 进程flush哪些queue，bit map |
| cpd_error_index | input | 4 | gctrl返回err时，返回的是entry index，需要在cpd中查询相应的hcqdid和asid，再返回到寄存器中供软件查询 |
| cpd_error_hcqd_id | output | 5 |  |
| cpd_error_asid | output | 5 |  |
| dbg_cpd_idle | output | 1 | debug信号，表示cpd处于idle状态 |
| dbg_cpd_entry_state | output | 4*4 | debug信号，每个entry的状态机 |
| ecr_cpd_cfg_addr_misaligned | output | 1 | cfg地址未对齐512Bytes检测错误 |
| ecr_cpd_fence_addr_misaligned | output | 1 | fence地址未对齐128Bytes检测错误 |
| cpd_prfcnt_hi | output | 4*32 | 4个64位的cnt（每个entry一个），用来记录gctrl返回kernel done的时间，从cpd配完gctrl最后一个寄存器收到bresp返回后下一个时钟周期（状态机跳至Busy等待状态）开始计数，到gctrl返回kernel done，返回kernel done后，cnt会保持一直到下一次cpd配完gctrl最后一个寄存器时清零再计数 |
| cpd_prfcnt_lo | output | 4*32 |  |
</table-44>
SDMA Dispatch
支持single die， dual die， 4 die， 每个die 2个copy engine， 其中每个copy engine支持ping-pong job， 即执行一个job， 内部缓存一个job， SDMA Dispatch模块需要根据dispatch mode和各个SDMA状态选择合适的SDMA将SDMA job 分发过去。
支持hardware dispatch和force mode dispatch，
Hardware dispatch由硬件根据SDMA状态选择一个sdma发送
Force mode dispatch由command packet中指定的force index发送到指定的sdma
dma的分发策略是， 优先寻找credit = 2的dma， 如果没有， 找credit = 1的dma， 如果也没有， 暂不发送。credit = 2表示dma可接收两个任务， credit = 1表示dma还可以接收一个任务
数据通路如下：
CPE发送过来cmd， 查找entry中有IDLE状态的entry，如果有， bitscan找出一个entry， 将其index存入index_fifo中
如果index_fifo非空， 从index_fifo中pop出一个index， 从对应entry中得到cmd，
查找可发送到sdma，根据die_mode, 将有效的sdma中选择一个sdma，
按照固定的配置序列配置sdma的寄存器
等待sdma返回job done， 查看是否需要fence（fence_addr !=0）， 需要fence的job进入fence状态， 不需要fence的job进入finish状态
从fence状态的所有entry中bitscan一个， 写fence value到fence addr中， 结束后到finish状态
从finish状态的所有entry中bitscan一个， 返回finish给CPE
每个entry都有下面的状态机控制， 一共有4个entry， 所以下面的状态机也有4份，
状态机跳转
新的cmd进来， 并且有空闲的entry
从index fifo中保序得到需要发送的entry（job）, 并判断是否有credit>0的dma可以发送
向选择好的dma配置dma的寄存器，src lo， src hi, dst lo, dst hi, size, mode
等待dma完成， 当dma返回job done（带着entry id）时，跳到DMA_DONE
当不需要fence情况，跳到WAIT FINISH状态
当需要fence的情况， 如果被bitscan选中并且没有正在进行的fence操作， 就跳到FENCE_WR状态
当fence写出去后， 进入FENCE_WAIT_B状态
当对应的写响应返回， 跳到WAIT_FINISH状态
在WAIT_FINISH状态bitscan选择一个entry， 并且当没有其他job在finish时， 跳入FINISH状态
FINISH完成后跳到IDLE状态
SDMA
feature
支持byte粒度的memory copy， prefetch， constant fill三种模式
max read outstanding = 256， max write outstanding = 256
读写burst不跨512Byte边界
静态可配置awcache/arcache
静态可配置qos
支持pingpong job， 内部可接收两个job， 隐藏配置的latency开销
支持cmd统计，bus 反压等performance counter（具体看寄存器）
接口信号

<table-45>
| 信号 | I/O | 位宽 | Note |
| clk | input | 1 | cpd时钟，采用cp系统时钟，常规1GHz |
| reset_n | input | 1 | cp系统复位 |
| APB4 slave | 标准APB4 |  |  |
| AXI4 master | 标准AXI4， 支持out of order， interleave |  |  |
| AXI lite master |  |  |  |
| mcsrd | input | 2 | memory control signal |
| mcswr | input | 2 | memory control signal |
| adme | input | 3 | memory control signal |
</table-45>
Diagram
apb接收寄存器配置
最后配置dma_mode寄存器，启动dma
dma_mode = 0, copy
dma_mode = 1, constant fill
dma_mode= 2, prefetch
dma_mode = others, 非法， dma直接返回sdma_done_ok = 0， 并记录在dma寄存器dma config err中， 后续 job可继续执行
如果是copy mode， dma_rd和dma_wr同时启动， 如果是constant fill mode，只启动dma wr， 如果是prefetch mode, 只启动dma rd
dma rd发出axi read请求（不包括id）
dma wr发出axi write请求（不包括id）
ROB （reorder buffer）分配axi id， 处理乱序和interleave
dma rd和dma wr分别返回rd_done/rd_done_err和wr_done/wr_done_err给job done模块
job done通过axi lite master口向cp写job 完成命令。地址寄存器可配， 数据参考寄存器表格
计算读写各多少行
以读为例(src_addr改为dst_addr即为写)
assign middle_line_cnt = (byte_size > (128 - src_addr[6:0])) ? (byte_size-(128-src_addr[6:0]))/128:0
assign last_line_exist = (byte_size > (128 - src_addr[6:0])) ? ((byte_size-(128-src_addr[6:0]))%128)!=0:0
assign totol_line = 1+middle_cnt + last_line_exist
wstrb计算， wr_left_cnt（byte单位）
首行： wstrb = '1 << dst_addr[6:0] & ('1>>(128-dst_addr[6:0] - byte_size))
middle line: wstrb = '1
last line: wstrb = '1>>(128-wr_left_cnt[6:0])
wr_left_cnt = size - transfer_size
If src_addr[6:0] < dst_addr[6:0], shift left
If src_addr[6:0] > dst_addr[6:0], shift right
If src_addr[6:0] == dst_addr[6:0], no shift
ATOMIC
Feature
支持atomic load.add，atomicstore.add，atomic swap, atomic cmpswap。
atomic load.add，atomicstore.add， atomic swap支持32位对齐，atomic cmpswap必须64位对齐， 数据为32bit。
当stop时，如果是cmpswap包没有执行完成，并处于LOOP_WAIT状态，atomic直接到IDLE状态，fw需要检查top寄存器的ato_stopped_on_loop来判断是不是发生了这种情况，如果是，则fw需要drop掉这个包。
当flush时，对于没有执行完的cmpswap包和接下来收到的任意包，都会回复dummy finish，对于正在执行的add和swap包，则会执行完成。
对于cmpswap包，如果bresp为error，不关心返回的数据，会进入LOOP_WAIT重新发起atomic cmpswap访问。
或者flush时， 从loop wait这个点停止继续发送compare and swap的write request，产生ato_stopped_on_loop信号(在寄存器可以读到），不会回finish，需要fw进行drop，并回到IDLE状态。
如果由于cmpswap包进入无限循环，可以在LOOP_WAIT状态下对atomic进行initial操作，使atomic进入IDLE状态，这种情况下atomic不会回finish，需要由fw进行处理。
在stop时，如果处于IDLE状态，会返回dummy ato_cmd_finish，收到的command packet都会被丢弃

<table-46>
| Type | awuser[8:0] | AWSIZE | AWLEN | AWBURST | Send data， (总线64bit) |
| Atomicload.add | 9’b000000111 | 2(4Byte) | 0 | INCR | {32’h0, Src data[31:0]}或者{Src data[31:0]， 32’h0} |
| Atomicstore.add | 9’b000000110 | 2(4Byte) | 0 | INCR | {32’h0, Src data[31:0]}或者{Src data[31:0]， 32’h0} |
| Atomicswap | 9’b100000111 | 2(4Byte) | 0 | INCR | {32’h0, Swap_data[31:0]}或者或者{Swap_data[31:0]， 32’h0} |
| atomicCAS | 9’b100100111 | 3(8byte) | 0 | INCR | {Swap_data[31:0],Compare_data[31:0]} |
</table-46>
Atomic 状态机
注：同一个queue内， firmware发送atomicCAS之后，要保证atomicCAS执行完后， 才能下发后续的包
Interface

<table-47>
| name | IO | width | Description |
| clk | input | 1 | fun_crg_clk |
| reset_n | input | 1 | fun_crg_rstn |
| ato_cmd_valid | input | 1 | 有一个有效的atomic pkt |
| ato_cmd_data | input | 32*ATO_PKT_LENTH | atomic pkt data |
| ato_cmd_ready | output | 1 | atomic 可接受atomic pkt |
| ato_finish_valid | output | 1 | atomic 已处理完成一个bao |
| ato_finish_ready | input | 1 | ato_finish_valid的反压信号 |
| stop | input | 1 | stop请求 |
| flush | input | 1 | flush请求，行为跟stop一样 |
| ato_initial | input | 1 | 在LOOP_WAIT状态下进行initial到IDLE状态 |
| dbg_atomic_idle | output | 1 | atomic 处于idle状态 |
| dbg_atomic_status | output | 3 | atomic的状态机 |
| ato_stopped_on_loop | output | 1 | 在LOOP_WAIT状态下收到stop或者flush请求 |
| cas_loop_interval | input | 32 | LOOP_WAIT状态下等待的时间（cycle数） |
| masideband | output | 32 | 参考awuser设计 |
| mid | output | 8 | awid |
| maddr | output | 32 | designware GM |
| mread | output | 1 |  |
| mwrite | output | 1 |  |
| mlock | output | 1 |  |
| mlen | output | 4 |  |
| msize | output | 3 |  |
| mburst | output | 2 |  |
| mcache | output | 4 |  |
| mprot | output | 3 |  |
| mdata | output | 64 |  |
| mwstrb | output | 8 |  |
| mqos | output | 4 |  |
| saccept | input | 1 |  |
| sid | input | 8 |  |
| svalid | input | 1 |  |
| slast | input | 1 |  |
| sdata | input | 64 | 为buser的返回数据 |
| sresp | input | 3 |  |
| mready | output | 1 |  |
| asid | output | 5 | asid |
| ecr_ato_addr_misaligned | Output | 1 | 地址对齐错误 |
</table-47>
异常处理

<table-48>
| atomic_err[0] | atomic_err[0] = rresp_err // bresp_err // protocol_err; |
| atomic_err[1] | atomic_err[1] = cmd_pkt_dec_err; |
| atomic_err[2] | atomic_err[2] = stop_and_flush && cur_status==LOOP_WAIT; |
| protocol_err | protocol_err = svalid && (sresp == 3'h2 // sresp == 3'h3 // sid != ATOMIC_MID); |
| rresp_err | rresp_err = svalid && (sresp == 3'h4 // sresp == 3'h6); |
| bresp_err | bresp_err = svalid && (sresp == 3'h5 // sresp == 3'h7); |
</table-48>
RAS
DFD（Design For debug）
debug bus

<table-49>
| cp_debug_grp_sel | 字段名 | 位宽范围 |
| 6'd0 | disable(32'h0) | 31:0 |
| 6'd1 | dbg_tbu_0[0] | 31:0 |
| 6'd2 | dbg_tbu_0[1] | 31:0 |
| 6'd3 | dbg_tbu_0[2] | 31:0 |
| 6'd4 | dbg_tcu_0 | 31:0 |
| 6'd5 | dbg_tcu_1 | 31:0 |
| 6'd6 | dbg_tcu_2 | 31:0 |
| 6'd7 | dbg_tcu_3 | 31:0 |
| 6'd8 | dbg_tcu_4 | 31:0 |
| 6'd9 | dbg_sdmad_idle | 31 |
|  | mmu_busy | 30:26 |
|  | 保留（7'h0） | 25:19 |
|  | dbg_fw_fetch_idle | 18 |
|  | dbg_fw_fetch_ready | 17:13 |
|  | dbg_fw_cur_state | 12:11 |
|  | dbg_fw_axiw_cur_state | 10:8 |
|  | dbg_mcu_slv_idle | 7 |
|  | 保留（2'h0） | 6:5 |
|  | dbg_querydma_idle | 4 |
|  | dbg_binddma_status | 3:1 |
|  | dbg_binddma_idle | 0 |
| 6'd10 | dbg_master_i0_trace_err | 31 |
|  | dbg_icb2axil_idle | 30:27 |
|  | dbg_idma_idle | 26:23 |
|  | dbg_osdctrl_idle | 22:19 |
|  | dbg_i0_trace_err | 18:15 |
|  | dbg_i1_trace_err | 14:11 |
|  | dbg_cpe_work_idle | 10:7 |
|  | dbg_cpe_job_idle | 6:3 |
|  | 保留（3'h0） | 2:0 |
| 6'd11 | dbg_hcqd_idle | 31:0 |
| 6'd12 | dbg_atomic_idle | 31:0 |
| 6'd13 | dbg_atomic_status_tmp[29:0] | 31:2 |
|  | dbg_master_icb2axil_idle | 1 |
|  | dbg_master_osdctrl_idle | 0 |
| 6'd14 | dbg_atomic_status_tmp[59:30] | 31:2 |
|  | dbg_master_mcu_idle | 1 |
|  | dbg_master_i1_trace_err | 0 |
| 6'd15 | dbg_atomic_status_tmp[89:60] | 31:2 |
|  | dbg_int_ctrl_idle | 1 |
|  | dbg_cpd_idle | 0 |
| 6'd16 | dbg_atomic_status_tmp[95:90] | 31:26 |
|  | dbg_querydma_addr_misaligned | 25 |
|  | dbg_binddma_addr_misaligned | 24 |
|  | dbg_a_ctrl_noc_slv_idle | 23 |
|  | dbg_ctrl_m_mcu0_idle | 22 |
|  | dbg_ctrl_m_mcu1_idle | 21 |
|  | dbg_ctrl_m_mcu2_idle | 20 |
|  | dbg_ctrl_m_mcu3_idle | 19 |
|  | dbg_ctrl_m_mcu4_idle | 18 |
|  | dbg_ctrl_m_wr_binddma_idle | 17 |
|  | dbg_ctrl_m_wr_cpd_idle | 16 |
|  | dbg_ctrl_m_wr_sdmad_idle | 15 |
|  | dbg_ctrl_m_wr_gctrl_idle | 14 |
|  | dbg_ctrl_m_wr_sdma0_idle | 13 |
|  | dbg_ctrl_m_wr_sdma1_idle | 12 |
|  | dbg_ctrl_noc_top_idle | 11 |
|  | dbg_data_m_mcu0_idle | 10 |
|  | dbg_data_m_mcu1_idle | 9 |
|  | dbg_data_m_mcu2_idle | 8 |
|  | dbg_data_m_mcu3_idle | 7 |
|  | dbg_data_m_mcu4_idle | 6 |
|  | dbg_data_m_pipe0_idle | 5 |
|  | dbg_data_m_pipe1_idle | 4 |
|  | dbg_data_m_pipe2_idle | 3 |
|  | dbg_data_m_pipe3_idle | 2 |
|  | dbg_data_m_pipe0_ato_idle | 1 |
|  | dbg_data_m_pipe1_ato_idle | 0 |
| 6'd17 | dbg_data_m_pipe2_ato_idle | 31 |
|  | dbg_data_m_pipe3_ato_idle | 30 |
|  | dbg_data_m_rd_binddma_idle | 29 |
|  | dbg_data_m_rd_cpd_idle | 28 |
|  | dbg_data_m_wr_cpd_idle | 27 |
|  | dbg_data_m_rd_fw_fetch_idle | 26 |
|  | dbg_data_m_rd_querydma_idle | 25 |
|  | dbg_data_m_wr_sdmad_idle | 24 |
|  | dbg_data_s_data_noc_idle | 23 |
|  | dbg_4X1_noc_m_noc_idle | 22:19 |
|  | dbg_noc4x1_out_idle | 18 |
|  | dbg_data_noc_idle | 17 |
|  | dbg_cpd_entry_state | 16:1 |
|  | dbg_ctrl_noc_top_slv_idle | 0 |
| 6'd18 | 保留（13'h0） | 31:19 |
|  | dbg_sdmad_entry0_cur_state | 18:15 |
|  | dbg_sdmad_entry1_cur_state | 14:11 |
|  | dbg_sdmad_entry2_cur_state | 10:7 |
|  | dbg_sdmad_entry3_cur_state | 6:3 |
|  | dbg_querydma_status | 2:0 |
| 6'd19 | 保留（22'h0） | 31:10 |
|  | dbg_fun_crg_rstn_a | 9 |
|  | dbg_cp_noc_crg_rstn_a | 8 |
|  | dbg_sdma0_crg_rstn_a | 7 |
|  | dbg_sdma1_crg_rstn_a | 6 |
|  | dbg_timer_crg_rstn_a | 5 |
|  | dbg_ctrl_noc_rstn_a | 4 |
|  | dbg_fabric_data_noc_rstn_a | 3 |
|  | dbg_data_noc_rstn_a | 2 |
|  | dbg_always_on_rstn_a | 1 |
|  | dbg_always_on_rstn_b | 0 |
| 6'd20 | dbg_cpd_received_cnt | 31:0 |
| 6'd21 | dbg_cpd_finish_cnt | 31:0 |
| 6'd22 | dbg_sdmad_received_cnt | 31:0 |
| 6'd23 | dbg_sdmad_finish_cnt | 31:0 |
| 6'd24 | 6'h0 | 31:26 |
|  | dbg_sdma0_cmd_fifo_empty | 25 |
|  | dbg_sdma0_cmd_fifo_full | 24 |
|  | dbg_sdma0_rd_status | 23:22 |
|  | dbg_sdma0_wr_status | 21:20 |
|  | dbg_sdma0_job_done_status | 19:18 |
|  | dbg_sdma0_sdma_wr_osd_cnt | 17:9 |
|  | dbg_sdma0_sdma_rd_osd_cnt | 8:0 |
| 6'd25 | 6'h0 | 31:26 |
|  | dbg_sdma1_cmd_fifo_empty | 25 |
|  | dbg_sdma1_cmd_fifo_full | 24 |
|  | dbg_sdma1_rd_status | 23:22 |
|  | dbg_sdma1_wr_status | 21:20 |
|  | dbg_sdma1_job_done_status | 19:18 |
|  | dbg_sdma1_sdma_wr_osd_cnt | 17:9 |
|  | dbg_sdma1_sdma_rd_osd_cnt | 8:0 |
| 6'd26 | dbg_cfg_error_flag0 | 31:0 |
| 6'd27 | dbg_cfg_error_flag1 | 31:0 |
| 6'd28 | dbg_cfg_error_flag2 | 31:0 |
| 6'd29 | dbg_cfg_error_flag3 | 31:0 |
| 6'd30 | dbg_cfg_error_flag4 | 31:0 |
| 6'd31 | dbg_cfg_error_flag5 | 31:0 |
| 6'd32 | dbg_hcqd_active | 31:0 |
| 6'd33 | dbg_cpd_osd_cnt_zero | 31:0 |
| 6'd34 | dbg_sdma_osd_cnt_zero | 31:0 |
| 6'd35 | dbg_ato_osd_cnt_zero | 31:0 |
| 6'd36 | 23'h0 | 31:9 |
|  | dbg_intr_out | 8:6 |
|  | dbg_cp_ras_int | 5 |
|  | dbg_flush_request | 4 |
|  | dbg_dma_err | 3 |
|  | dbg_compute_err | 2 |
|  | dbg_hcqd_idle_timeout | 1 |
|  | dbg_tcu_interrupt | 0 |
| default | 全 0（'h0） | 31:0 |
</table-49>
ECR(exception code)
目前有以下类型的错误， 可通过寄存器查看和clear
hcqd中wptr，rptr，exe_rptr，fetch_rptr的128byte对齐检查
HW queue监测只finish_osd_cnt ==0 && cost_osd_cnt ==0 && bus_rd_idle && bus_wr_idle时才能进行bind和unbind
fw_prefetch在没有ready时再次trigger，进行报错
cpd中软件配置的和包中的地址对齐检查，（fence addr不对齐8byte， cfg addr不对齐512Byte）
sdmad中fence地址不对齐8byte
atomic中地址对齐检查
firmware addr 和firmware size 对齐到128byte检查
验证重点：能上报多个错误， 并且能清掉，不影响后续正常的job跑， 至于出错的job会继续跑下去， 但是结果是不期望的
寄存器如下
详细信息：https://confluence.aigcic.com/display/SOC/GraceC+Fault+Table
Performance counter
Queue Bind/ release
Ringbuffer read
Rptr write
Doorbell hit
Compute job
Dma job
Atomic job
QueryDMA
bindDMA
mcu access data noc
mcu access ctrl noc
总线backpressure arready， awready, wready
寄存器中有一些prfcnt， 参看寄存器描述
latency
memory read latency
ringbuffer read
atomic
trace
某个job（seqID）的执行的各个阶段的时间
fetch
decode， dispatch到cpd
cpd， cpd发送到gctrl
job返回job done

<table-50>
| trace event(4bit) | timestamp(64bit) |
| 0 |  |
</table-50>
Programming Guide
IMC启动流程后， 将CP的PLL切高频， 并解复位
参考CP_lcrg配置流程
按需求初始化配置top_cfg寄存器（CP中mesh_router的控制寄存器， 在IMC中）， c2c_port_map0~7, d2d_map（CP中mesh_router的控制寄存器， 在CP top寄存器中）
按需求配置cp中的tcu寄存器
配置gctrl寄存器work mode为0（默认值）， 表示job从cp下发， 如果需要从软件直接配置gctrl， 将该寄存器配置为1
配置sdma 0和sdma 1的寄存器src_cfg为0（默认值）， 表示job从cp下发， 如果需要从软件直接配置sdma， 将该寄存器配置为1
配置sdma0 的sdma_id寄存器为0， 配置sdma1的sdma_id寄存器为1
后续参照3.3.1正常flow
Constraint
一个cmd packet在ringbuffer中占据完整的128Byte， 无用的空间填0(nop)， 且不超过128Byte
hcqd中的wptr和rptr是128B的整数倍， 因为一个command packet是128Byte
hcqd中的wrptr_addr 128Byte对齐
一次下的doorbell要预留一个packet空间， 不能一次下的doorbell占满所有ringbuffer
Release queue一定要保证queue 已经处于stopped状态， 即停止fetch， 并且fetch回来的cmd packet都已经处理完了， 处理完可能是正常处理完也可能是drop掉，正常处理完的会更新rptr， 被drop掉的不会更新rptr， 这两种情况都会更新cost_osd_cnt, finish_osd_cnt。 如果Release queue没有保证queue 已经处于stopped状态， 该release命令可能会被miss掉
Release queue会发起写rptr到memory地址wrptr_addr，当写完成后， 硬件将active置0。软件要保证release前hcqd是idle状态
如果rptr_update_hint设置的比较小， rptr写memory操作会非常频繁， 由于总线反压， 可能上一笔还没写出去， 就要发下一笔了， 连续多笔写会merge成一笔
Queue stopped拉高后， 仅代表hcqd不再读新的cmd packet， 仍然可能会有wptr写memory的操作(最多再写两笔)
为了节省硬件资源， 5个mcu的firmware配置一个硬件模块串行fetch，串行启动， 配置一个mcu的firmware后， 当查询到firmware_fetch_ready后， 才可继续配置
Firmware addr和Firmware size（包括ILM和DLM）必须对齐到128Byte， 否则硬件会hang
timestamp fifo（AIGCIC_CP_top.u_AIGCIC_CP_timer.U_ts_fifo）在仿真结束final check中不必检查该fifo为空， 实际不为空
一次idma配置必须传输一个完整的packet， 因为配置一次idma， osd_cnt会加1
对CP中涉及到的地址的对齐方式列表如下

<table-51>
| 地址名 | 对齐 | Note |
| Mcqd_addr | 1024bit |  |
| wrptr_addr | 1024bit |  |
| Atomic add/swap dst addr | 32bit |  |
| Ato compareswap dst addr | 64bit |  |
| Fence_addr | 64bit |  |
| firmware_prefetch_addr | 1024bit | Firmware_prefetch_size 也是1024bit为单位 |
| cfg_addr_lo/hi | 512Byte | CPD 数据位宽1024bit, burst-4读 |
</table-51>
PPA
Performance
预计CP的latency可控制在4us以内， 包括响应doorbell -> fetch cmd packet -> firmware decode and 转发 -> dispatch硬件模块处理 ->配置寄存器启动
一次queue Scheduling的latency预计可控制在10us以内， 主要取决于memory read latency
Copy Engine的单向带宽（读或者写）不小于64GB/s
Area
Sram List

<table-52>
| Sram | Depth | Width(bit) | Write strobe | 个数 |
| Copy engine | 256*4 = 1024 | 1024 | Whole line | 2 |
| User_Ilm | 8192 | 64 | Per byte | 4pipes |
| User_dlm | 8192 | 32 | Per byte | 2(banks)*4(pipes) |
| User_Bht | 1024 | 16 | Per bit | 4(banks)*4(pipes) |
| User_btb | 32 | 140 | Per bit | 4(banks)*4(pipes) |
| master_Ilm | 32768 | 64 | Per byte | 1 |
| master_dlm | 32768 | 32 | Per byte | 2banks |
| master_Bht | 1024 | 16 | Per bit | 4 banks |
| master_btb | 32 | 140 | Per bit | 4banks |
</table-52>
附录
NX900遗留问题（下面问题已与芯来确认）
PMA， non-cacheable， cacheable， device区别，硬件和软件如何配置， 目前配置是PPI空间配置为device， 其他空间软件可配置？
Dmi2tap_*, tap2dmi_*(没用)，
Output tx_evt(unconnect), input rx_evt（tie 0），
Hart_id如何赋值, jtag
Ppi output signal: xlen, xburst, beat, modes, dmode, attri, ppi接口这些信号可能的取值
哪些地址从哪些口出去， 除了ILM， IREGION， PPI之外都从mem_axi_*出去， 访问不了48bit全地址空间， 需要mcu外面做区间映射才能访问系统所有的mem空间（48bit）
