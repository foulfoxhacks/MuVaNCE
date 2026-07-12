export interface WifiNetwork { ssid:string; bssid:string; signal:number; channel:number; radio:string }
declare global { interface Window { muvanceHardware?: { scanWifi:()=>Promise<WifiNetwork[]> } } }
export async function scanWifi():Promise<WifiNetwork[]> {
  if(!window.muvanceHardware)return [];
  try{return await window.muvanceHardware.scanWifi()}catch{return []}
}
