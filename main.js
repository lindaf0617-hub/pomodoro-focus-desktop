const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, nativeImage, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

let mainWindow;
let tray;
let quitting = false;
let saveTimer;
let currentLanguage = "zh";

const trayText = {
  zh: {
    show: "显示 / 隐藏",
    timer: "开始 / 暂停",
    compact: "迷你悬浮窗",
    top: "始终置顶",
    quit: "退出",
    title: "专注番茄钟"
  },
  en: {
    show: "Show / Hide",
    timer: "Start / Pause",
    compact: "Compact Window",
    top: "Always on Top",
    quit: "Quit",
    title: "Pomodoro Focus"
  }
};

const defaultPreferences = {
  alwaysOnTop: true,
  compact: false,
  fullBounds: { width: 1100, height: 760 },
  compactBounds: { width: 276, height: 88 }
};

const preferencesPath = () => path.join(app.getPath("userData"), "window-preferences.json");

const loadPreferences = () => {
  try {
    const saved = JSON.parse(fs.readFileSync(preferencesPath(), "utf8"));
    return {
      ...defaultPreferences,
      ...saved,
      compactBounds: { ...saved.compactBounds, width: 276, height: 88 }
    };
  } catch {
    return { ...defaultPreferences };
  }
};

let preferences;

const savePreferences = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(preferencesPath(), JSON.stringify(preferences, null, 2));
  }, 150);
};

const getWindowState = () => ({
  alwaysOnTop: preferences.alwaysOnTop,
  compact: preferences.compact
});

const emitWindowState = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("window:state", getWindowState());
  }
  rebuildTrayMenu();
};

const fitToWorkArea = (bounds) => {
  const hasPosition = Number.isFinite(bounds.x) && Number.isFinite(bounds.y);
  const display = hasPosition ? screen.getDisplayMatching(bounds) : screen.getPrimaryDisplay();
  const area = display.workArea;
  return {
    x: Math.min(Math.max(bounds.x ?? area.x + area.width - bounds.width - 24, area.x), area.x + area.width - bounds.width),
    y: Math.min(Math.max(bounds.y ?? area.y + 24, area.y), area.y + area.height - bounds.height),
    width: Math.min(bounds.width, area.width),
    height: Math.min(bounds.height, area.height)
  };
};

const setCompact = (enabled) => {
  if (enabled === preferences.compact) return getWindowState();

  const currentBounds = mainWindow.getBounds();
  if (enabled) {
    preferences.fullBounds = currentBounds;
    const compactBounds = fitToWorkArea({
      ...preferences.compactBounds,
      x: currentBounds.x + currentBounds.width - preferences.compactBounds.width,
      y: currentBounds.y
    });
    preferences.compact = true;
    mainWindow.setResizable(false);
    mainWindow.setMinimumSize(276, 88);
    mainWindow.setBounds(compactBounds, true);
    if (process.platform === "darwin") app.dock.hide();
  } else {
    preferences.compactBounds = currentBounds;
    preferences.compact = false;
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(720, 560);
    mainWindow.setBounds(fitToWorkArea(preferences.fullBounds), true);
    if (process.platform === "darwin") app.dock.show();
  }

  savePreferences();
  emitWindowState();
  return getWindowState();
};

const setAlwaysOnTop = (enabled) => {
  preferences.alwaysOnTop = Boolean(enabled);
  mainWindow.setAlwaysOnTop(preferences.alwaysOnTop, "floating");
  savePreferences();
  emitWindowState();
  return getWindowState();
};

const showWindow = () => {
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
};

const toggleWindow = () => {
  if (mainWindow.isVisible() && mainWindow.isFocused()) mainWindow.hide();
  else showWindow();
};

const rebuildTrayMenu = () => {
  if (!tray) return;
  const text = trayText[currentLanguage];
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: text.show, accelerator: "CommandOrControl+Alt+P", click: toggleWindow },
    { label: text.timer, click: () => mainWindow.webContents.send("timer:toggle") },
    { type: "separator" },
    {
      label: text.compact,
      type: "checkbox",
      checked: preferences.compact,
      click: (item) => setCompact(item.checked)
    },
    {
      label: text.top,
      type: "checkbox",
      checked: preferences.alwaysOnTop,
      click: (item) => setAlwaysOnTop(item.checked)
    },
    { type: "separator" },
    {
      label: text.quit,
      click: () => {
        quitting = true;
        app.quit();
      }
    }
  ]));
};

const createWindow = () => {
  preferences = loadPreferences();
  const initialBounds = fitToWorkArea(
    preferences.compact ? preferences.compactBounds : preferences.fullBounds
  );

  mainWindow = new BrowserWindow({
    ...initialBounds,
    minWidth: preferences.compact ? 276 : 720,
    minHeight: preferences.compact ? 88 : 560,
    frame: false,
    resizable: !preferences.compact,
    show: true,
    alwaysOnTop: preferences.alwaysOnTop,
    backgroundColor: "#f7f4ef",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile("index.html");
  mainWindow.on("close", (event) => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on("moved", rememberBounds);
  mainWindow.on("resized", rememberBounds);

  const trayImage = nativeImage.createFromPath(path.join(__dirname, "icon.png")).resize({
    width: process.platform === "darwin" ? 18 : 16,
    height: process.platform === "darwin" ? 18 : 16
  });
  if (process.platform === "darwin") trayImage.setTemplateImage(true);
  tray = new Tray(trayImage);
  tray.setToolTip(trayText[currentLanguage].title);
  tray.on("click", toggleWindow);
  rebuildTrayMenu();

  if (process.platform === "darwin" && preferences.compact) app.dock.hide();
};

const rememberBounds = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const bounds = mainWindow.getBounds();
  if (preferences.compact) preferences.compactBounds = bounds;
  else preferences.fullBounds = bounds;
  savePreferences();
};

ipcMain.handle("window:get-state", getWindowState);
ipcMain.handle("window:set-always-on-top", (_event, enabled) => setAlwaysOnTop(enabled));
ipcMain.handle("window:toggle-compact", () => setCompact(!preferences.compact));
ipcMain.handle("window:minimize", () => mainWindow.minimize());
ipcMain.handle("window:close", () => mainWindow.hide());
ipcMain.handle("app:set-language", (_event, language) => {
  currentLanguage = language === "en" ? "en" : "zh";
  if (tray) tray.setToolTip(trayText[currentLanguage].title);
  rebuildTrayMenu();
  return currentLanguage;
});

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", showWindow);
}

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: app.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" }
        ]
      },
      { role: "editMenu" },
      { role: "windowMenu" }
    ]));
  }
  createWindow();
  globalShortcut.register("CommandOrControl+Alt+P", toggleWindow);
  globalShortcut.register("CommandOrControl+Alt+M", () => {
    showWindow();
    setCompact(!preferences.compact);
  });
});

app.on("activate", showWindow);
app.on("before-quit", () => {
  quitting = true;
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Keep the timer available from the tray on Windows.
  }
});
