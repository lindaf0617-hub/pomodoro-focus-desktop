# Pomodoro Focus Desktop

[Chinese version](README.md)

A compact desktop Pomodoro timer for Windows and macOS with always-on-top and
compact floating modes.

![Pomodoro Focus main window](assets/product-main-en.png)

## Compact Floating Window

The compact timer stays above other work windows so the remaining time is
always visible.

![Compact floating window](assets/product-compact.png)

## Features

- Always-on-top timer window
- Compact floating mode
- Chinese and English interfaces
- Focus, short-break, and long-break cycles
- Local task history and daily statistics
- Windows system tray and macOS menu bar controls
- Global shortcuts

## Shortcuts

| Action | Windows | macOS |
| --- | --- | --- |
| Show or hide | `Ctrl+Alt+P` | `Command+Option+P` |
| Toggle compact mode | `Ctrl+Alt+M` | `Command+Option+M` |
| Start or pause | `Space` | `Space` |

## Development

```text
npm install
npm start
```

## Build

```text
npm run build:windows
npm run build:macos
```

Windows packages are built on Windows, and macOS packages are built on macOS.
GitHub Actions builds both platforms from the same source.

Timer records remain on the local device.
