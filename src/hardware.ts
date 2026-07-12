export interface WifiNetwork { ssid:string; bssid:string; signal:number; channel:number; radio:string }
import type { SignalSample } from './types';
import type { Floor } from './types';
import type { CalibrationProfile } from './calibration';
export interface ListenerState { running:boolean; port:number|null }
export interface FloorPlanFile {name:string;dataUrl:string}
export interface ProjectFile {schemaVersion:1;exportedAt:number;activeFloorId:string;floors:Floor[];calibrations:CalibrationProfile[]}
declare global { interface Window { muvanceHardware?: { scanWifi:()=>Promise<WifiNetwork[]>; startSensors:(port:number)=>Promise<ListenerState>; stopSensors:()=>Promise<ListenerState>; onSensorFrames:(callback:(frames:SignalSample[])=>void)=>(()=>void);openFloorPlan:()=>Promise<FloorPlanFile|null>;saveProject:(project:ProjectFile)=>Promise<boolean>;openProject:()=>Promise<ProjectFile|null>;saveCapture:(frames:SignalSample[])=>Promise<boolean> } } }
export async function scanWifi():Promise<WifiNetwork[]> {
  if(!window.muvanceHardware)return [];
  try{return await window.muvanceHardware.scanWifi()}catch{return []}
}
export const startSensors=(port=5006)=>window.muvanceHardware?.startSensors(port)??Promise.resolve({running:false,port:null});
export const stopSensors=()=>window.muvanceHardware?.stopSensors()??Promise.resolve({running:false,port:null});
export const onSensorFrames=(callback:(frames:SignalSample[])=>void)=>window.muvanceHardware?.onSensorFrames(callback)??(()=>{});
export const openFloorPlan=()=>window.muvanceHardware?.openFloorPlan()??Promise.resolve(null);
export const saveProject=(project:ProjectFile)=>window.muvanceHardware?.saveProject(project)??Promise.resolve(false);
export const openProject=()=>window.muvanceHardware?.openProject()??Promise.resolve(null);
export const saveCapture=(frames:SignalSample[])=>window.muvanceHardware?.saveCapture(frames)??Promise.resolve(false);
