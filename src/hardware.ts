export interface WifiNetwork { ssid:string; bssid:string; signal:number; channel:number; radio:string }
import type { SignalSample } from './types';
export interface ListenerState { running:boolean; port:number|null }
export interface FloorPlanFile {name:string;dataUrl:string}
declare global { interface Window { muvanceHardware?: { scanWifi:()=>Promise<WifiNetwork[]>; startSensors:(port:number)=>Promise<ListenerState>; stopSensors:()=>Promise<ListenerState>; onSensorFrames:(callback:(frames:SignalSample[])=>void)=>(()=>void);openFloorPlan:()=>Promise<FloorPlanFile|null> } } }
export async function scanWifi():Promise<WifiNetwork[]> {
  if(!window.muvanceHardware)return [];
  try{return await window.muvanceHardware.scanWifi()}catch{return []}
}
export const startSensors=(port=5006)=>window.muvanceHardware?.startSensors(port)??Promise.resolve({running:false,port:null});
export const stopSensors=()=>window.muvanceHardware?.stopSensors()??Promise.resolve({running:false,port:null});
export const onSensorFrames=(callback:(frames:SignalSample[])=>void)=>window.muvanceHardware?.onSensorFrames(callback)??(()=>{});
export const openFloorPlan=()=>window.muvanceHardware?.openFloorPlan()??Promise.resolve(null);
