import type { SignalSample } from './types';

export interface AdapterBaseline {adapterId:string;kind:SignalSample['kind'];count:number;rssiMean:number;rssiStd:number;amplitudeMean:number;motionMean:number}
export interface CalibrationProfile {id:string;floorId:string;createdAt:number;durationMs:number;adapters:AdapterBaseline[]}
const mean=(values:number[])=>values.reduce((a,b)=>a+b,0)/Math.max(values.length,1);
export function buildCalibrationProfile(floorId:string,frames:SignalSample[][]):CalibrationProfile {
  const flat=frames.flat();const ids=[...new Set(flat.map(s=>s.adapterId))];
  const adapters=ids.map(adapterId=>{const values=flat.filter(s=>s.adapterId===adapterId);const rssiMean=mean(values.map(v=>v.rssi));return{adapterId,kind:values[0].kind,count:values.length,rssiMean,rssiStd:Math.sqrt(mean(values.map(v=>(v.rssi-rssiMean)**2))),amplitudeMean:mean(values.map(v=>v.amplitude)),motionMean:mean(values.map(v=>v.motion))}});
  const timestamps=flat.map(v=>v.timestamp);return{id:`cal-${Date.now()}`,floorId,createdAt:Date.now(),durationMs:timestamps.length?Math.max(...timestamps)-Math.min(...timestamps):0,adapters};
}
export function deviationScore(samples:SignalSample[],profile?:CalibrationProfile):number {
  if(!profile||!samples.length)return 0;let total=0,count=0;
  for(const sample of samples){const base=profile.adapters.find(a=>a.adapterId===sample.adapterId);if(!base)continue;const rssi=Math.abs(sample.rssi-base.rssiMean)/Math.max(base.rssiStd,1.5);const amplitude=Math.abs(sample.amplitude-base.amplitudeMean)*3;const motion=Math.max(0,sample.motion-base.motionMean)*4;total+=Math.min(5,rssi+amplitude+motion);count++}
  return Math.min(1,total/Math.max(count*5,1));
}
