const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1500, height: 940, minWidth: 1100, minHeight: 700,
    backgroundColor: '#070b12', titleBarStyle: 'hiddenInset',
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname,'preload.cjs') }
  });
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
