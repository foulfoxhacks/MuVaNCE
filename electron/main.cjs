const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const dgram = require('dgram');
const { readFile } = require('fs/promises');
const execFileAsync = promisify(execFile);
let sensorSocket=null; let sensorPort=null;

function normalizeSensorFrame(value) {
  if(!value||typeof value!=='object'||typeof value.adapterId!=='string')return null;
  const kind=['wifi','ble','csi','sdr'].includes(value.kind)?value.kind:null;
  const nums=['rssi','phase','amplitude','motion','channel'];
  if(!kind||nums.some(k=>typeof value[k]!=='number'||!Number.isFinite(value[k])))return null;
  return {adapterId:value.adapterId.slice(0,80),kind,timestamp:typeof value.timestamp==='number'?value.timestamp:Date.now(),rssi:Math.max(-140,Math.min(20,value.rssi)),phase:value.phase,amplitude:Math.max(0,value.amplitude),motion:Math.max(0,value.motion),channel:Math.max(0,Math.round(value.channel))};
}

async function startSensorListener(event, requestedPort=5006) {
  const port=Number(requestedPort);
  if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Port must be between 1024 and 65535');
  if(sensorSocket)return {running:true,port:sensorPort};
  const win=BrowserWindow.fromWebContents(event.sender);
  sensorSocket=dgram.createSocket('udp4');
  sensorSocket.on('message',buffer=>{try{const raw=JSON.parse(buffer.toString('utf8'));const values=Array.isArray(raw)?raw:[raw];const frames=values.map(normalizeSensorFrame).filter(Boolean);if(frames.length&&win&&!win.isDestroyed())win.webContents.send('hardware:sensor-frames',frames)}catch{}});
  sensorSocket.on('error',()=>stopSensorListener());
  await new Promise((resolve,reject)=>{sensorSocket.once('error',reject);sensorSocket.bind(port,'127.0.0.1',()=>{sensorSocket.removeListener('error',reject);resolve()})});
  sensorPort=port; return {running:true,port};
}
function stopSensorListener(){if(sensorSocket){sensorSocket.close();sensorSocket=null}sensorPort=null;return {running:false,port:null}}

async function scanWindowsWifi() {
  if (process.platform !== 'win32') return [];
  try {
    const { stdout } = await execFileAsync('netsh.exe', ['wlan','show','networks','mode=bssid'], { windowsHide: true, timeout: 10000 });
    const networks=[]; let current=null;
    for (const raw of stdout.split(/\r?\n/)) {
      const line=raw.trim();
      const ssid=line.match(/^SSID\s+\d+\s*:\s*(.*)$/i);
      if(ssid){current={ssid:ssid[1]||'(hidden)',bssid:'',signal:0,channel:0,radio:'Wi-Fi'};networks.push(current);continue;}
      if(!current)continue;
      const bssid=line.match(/^BSSID\s+\d+\s*:\s*(.*)$/i); if(bssid&&!current.bssid){current.bssid=bssid[1];continue;}
      const signal=line.match(/^Signal\s*:\s*(\d+)%/i); if(signal){current.signal=Number(signal[1]);continue;}
      const channel=line.match(/^Channel\s*:\s*(\d+)/i); if(channel){current.channel=Number(channel[1]);continue;}
      const radio=line.match(/^Radio type\s*:\s*(.*)$/i); if(radio){current.radio=radio[1];}
    }
    return networks.filter(n=>n.bssid);
  } catch { return []; }
}

ipcMain.handle('hardware:scan-wifi', scanWindowsWifi);
ipcMain.handle('hardware:start-sensors', startSensorListener);
ipcMain.handle('hardware:stop-sensors', stopSensorListener);
ipcMain.handle('project:open-floor-plan', async event => {
  const win=BrowserWindow.fromWebContents(event.sender);
  const result=await dialog.showOpenDialog(win,{title:'Import floor plan',properties:['openFile'],filters:[{name:'Floor plan images',extensions:['png','jpg','jpeg','webp','svg']}]});
  if(result.canceled||!result.filePaths[0])return null;
  const filePath=result.filePaths[0];const data=await readFile(filePath);if(data.length>1024*1024)throw new Error('Floor plan must be smaller than 1 MB in this milestone');
  const ext=path.extname(filePath).slice(1).toLowerCase();const mime=ext==='svg'?'image/svg+xml':ext==='jpg'||ext==='jpeg'?'image/jpeg':ext==='webp'?'image/webp':'image/png';
  return{name:path.basename(filePath),dataUrl:`data:${mime};base64,${data.toString('base64')}`};
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1500, height: 940, minWidth: 1100, minHeight: 700,
    backgroundColor: '#070b12', title: 'MuVance Map View',
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname,'preload.cjs') }
  });
  const entry=path.join(__dirname, '..', 'app-dist', 'index.html');
  win.webContents.on('did-fail-load',(_event,code,description)=>{
    const message=`MuVance could not load its interface.\n\n${description} (${code})\n\nExpected application entry:\n${entry}`;
    dialog.showErrorBox('MuVance startup error',message);
  });
  win.webContents.on('render-process-gone',(_event,details)=>dialog.showErrorBox('MuVance renderer stopped',`The interface process stopped: ${details.reason}. Restart MuVance; if this repeats, report this message.`));
  win.loadFile(entry).catch(error=>dialog.showErrorBox('MuVance startup error',error.message));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', stopSensorListener);
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
