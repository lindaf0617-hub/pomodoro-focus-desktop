# 专注番茄钟 / Pomodoro Focus Desktop

一款适用于 Windows 和 macOS 的轻量桌面番茄钟，支持始终置顶和迷你悬浮模式。

A compact desktop Pomodoro timer for Windows and macOS.

![专注番茄钟中文界面](assets/product-main-zh.png)

![Pomodoro Focus main window](assets/product-main-en.png)

## 功能特点

- 始终置顶的计时窗口
- 迷你悬浮模式
- 中文与英文界面，可在顶部或设置中切换
- 专注、短休息和长休息循环
- 本地任务历史与每日统计
- Windows 系统托盘和 macOS 菜单栏控制
- 全局快捷键

## Features

- Always-on-top timer window
- Compact floating mode
- Chinese and English interfaces
- Focus, short-break, and long-break cycles
- Local task history and daily statistics
- System tray or menu bar controls
- Global shortcuts

## 快捷键 / Shortcuts

| 操作 / Action | Windows | macOS |
| --- | --- | --- |
| 显示或隐藏 / Show or hide | `Ctrl+Alt+P` | `Command+Option+P` |
| 切换迷你模式 / Toggle compact mode | `Ctrl+Alt+M` | `Command+Option+M` |
| 开始或暂停 / Start or pause | `Space` | `Space` |

## 本地开发 / Development

```text
npm install
npm start
```

## 构建 / Build

```text
npm run build:windows
npm run build:macos
```

Windows 安装包需在 Windows 构建，macOS 安装包需在 macOS 构建。GitHub Actions
会从同一份源代码自动构建两个平台。

计时记录仅保存在本地设备。Timer records remain on the local device.
