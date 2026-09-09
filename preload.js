const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  getWindowState: () => ipcRenderer.invoke("window:get-state"),
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke("window:set-always-on-top", enabled),
  toggleCompact: () => ipcRenderer.invoke("window:toggle-compact"),
  minimize: () => ipcRenderer.invoke("window:minimize"),
  close: () => ipcRenderer.invoke("window:close"),
  setLanguage: (language) => ipcRenderer.invoke("app:set-language", language),
  onWindowState: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on("window:state", handler);
    return () => ipcRenderer.removeListener("window:state", handler);
  },
  onToggleTimer: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("timer:toggle", handler);
    return () => ipcRenderer.removeListener("timer:toggle", handler);
  }
});
