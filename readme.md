## 基于STM32的环境监测系统

### 设计目的：

本设计旨在构建一个基于STM32单片机的环境监测系统，核心功能是实时监测并显示温度信息。系统能够以高精度和频率采集温度数据，并通过液晶显示屏直观展示当前环境的温度状况。同时支持无线数据传输，使用户可以通过手机APP远程实时监控温度数据。此设计强调嵌入式硬件操作实践和无线通信技术的应用，推动数据交互界面设计的创新。通过自主开发的界面，系统不仅提供用户友好的交互体验，还促进系统性能的优化与功能的扩展，如集成新型传感器以扩展监测能力，优化数据算法以提升监测准确性和响应速度。

完成本设计项目将展示在嵌入式系统开发全过程中的综合应用能力，包括硬件选择与集成、固件编程、数据处理、无线通信及用户界面设计等。此外，系统的开发与实现将具有较高的实用价值，适用于家庭、办公室或工业环境中的环境监测需求。

### 总体方案

#### 项目目标

设计并实现一个基于STM32F103C8T6单片机的环境监测系统，能够连续监测环境温度，并通过无线模块与移动设备通信，实现温度数据的实时远程监控。

#### 概要设计方案

通过STM32F103C8T6控制各个外设通道的使用，获取传感器数据或控制传感器，并在0.96寸OLED屏幕上显示。使用ESP-01S(ESP8266)通过ONENET实现与MQTT服务器的通信，支持设备数据上传和下发命令接收。使用HBuilderX开发安卓应用，实现对MQTT服务器的连接、消息订阅与发送，实现从MQTT服务器接收数据并在上位机上显示，同时支持对硬件的远程控制。最终实现硬件与软件设备的互联。

#### 系统组成

##### 硬件组成

- **核心控制单元：** STM32F103C8T6单片机。
- **温度传感器：** 如DHT11、DS18B20或其他数字/模拟传感器。
- **显示单元：** 0.96寸OLED(SSD1315)，用于本地显示温度读数。
- **无线通信模块：** Wi-Fi或蓝牙模块，用于数据传输。

##### 软件环境

- **操作系统：** Windows。
- **MDK：** Keil uVision5。
- **IDE：** Visual Studio Code。
- **前端IDE：** HBuilderX。
- **EDA工具：** 嘉立创EDA。

##### 软件组成

- **固件程序：** 运行在STM32F103C8T6上，负责数据采集、处理和无线传输。
- **APP：** 用于接收并显示来自监测系统的温度数据，并能下发控制命令。

##### 服务器

- **服务器类型：** 阿里云轻量应用型服务器。
- **MQTT服务器：** 使用阿里云服务器搭建的EMQX，用于设备数据的传输和控制命令的接收。
