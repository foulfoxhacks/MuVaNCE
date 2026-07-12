const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('muvanceHardware', { scanWifi: () => ipcRenderer.invoke('hardware:scan-wifi') });
