const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('muvanceHardware', {
  scanWifi: () => ipcRenderer.invoke('hardware:scan-wifi'),
  startSensors: port => ipcRenderer.invoke('hardware:start-sensors',port),
  stopSensors: () => ipcRenderer.invoke('hardware:stop-sensors'),
  onSensorFrames: callback => { const listener=(_event,frames)=>callback(frames); ipcRenderer.on('hardware:sensor-frames',listener); return()=>ipcRenderer.removeListener('hardware:sensor-frames',listener) }
  ,openFloorPlan: () => ipcRenderer.invoke('project:open-floor-plan')
  ,saveProject: project => ipcRenderer.invoke('project:save',project)
  ,openProject: () => ipcRenderer.invoke('project:open')
});
