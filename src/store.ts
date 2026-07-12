import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Floor, SignalSample } from './types';
import { createSamples } from './engine';
import { buildCalibrationProfile, type CalibrationProfile } from './calibration';

const firstFloor:Floor={id:'floor-1',name:'Level 1',width:100,height:100,walls:[
  {id:'w1',start:{x:8,y:8},end:{x:92,y:8},material:'brick'},{id:'w2',start:{x:92,y:8},end:{x:92,y:92},material:'brick'},{id:'w3',start:{x:92,y:92},end:{x:8,y:92},material:'brick'},{id:'w4',start:{x:8,y:92},end:{x:8,y:8},material:'brick'},
  {id:'w5',start:{x:49,y:8},end:{x:49,y:43},material:'drywall'},{id:'w6',start:{x:49,y:59},end:{x:49,y:92},material:'drywall'},{id:'w7',start:{x:49,y:43},end:{x:74,y:43},material:'glass'}
]};
interface State {view:'scope'|'map'|'devices'|'lab';running:boolean;recording:boolean;liveHardware:boolean;calibrating:boolean;selectedAdapter:string|null;activeFloorId:string;floors:Floor[];samples:SignalSample[];history:SignalSample[][];calibrationFrames:SignalSample[][];calibrations:CalibrationProfile[];setView:(v:State['view'])=>void;toggleRun:()=>void;toggleRecord:()=>void;selectAdapter:(id:string|null)=>void;selectFloor:(id:string)=>void;addFloor:()=>void;renameFloor:(name:string)=>void;startCalibration:()=>void;cancelCalibration:()=>void;finishCalibration:()=>void;ingest:(frames:SignalSample[])=>void;tick:()=>void}
export const useAppStore=create<State>()(persist((set)=>({
  view:'map',running:true,recording:false,liveHardware:false,calibrating:false,selectedAdapter:null,activeFloorId:firstFloor.id,floors:[firstFloor],samples:createSamples(),history:[],calibrationFrames:[],calibrations:[],
  setView:view=>set({view}),toggleRun:()=>set(s=>({running:!s.running})),toggleRecord:()=>set(s=>({recording:!s.recording})),selectAdapter:selectedAdapter=>set({selectedAdapter}),selectFloor:activeFloorId=>set({activeFloorId}),
  addFloor:()=>set(s=>{const number=s.floors.length+1;const floor:Floor={id:`floor-${Date.now()}`,name:`Level ${number}`,width:100,height:100,walls:[]};return{floors:[...s.floors,floor],activeFloorId:floor.id}}),
  renameFloor:name=>set(s=>({floors:s.floors.map(f=>f.id===s.activeFloorId?{...f,name:name.slice(0,40)||f.name}:f)})),
  startCalibration:()=>set({calibrating:true,calibrationFrames:[]}),cancelCalibration:()=>set({calibrating:false,calibrationFrames:[]}),finishCalibration:()=>set(s=>s.calibrationFrames.length<10?{}:{calibrating:false,calibrationFrames:[],calibrations:[...s.calibrations.filter(c=>c.floorId!==s.activeFloorId),buildCalibrationProfile(s.activeFloorId,s.calibrationFrames)]}),
  ingest:frames=>set(s=>({samples:frames,liveHardware:true,history:s.recording?[...s.history.slice(-899),frames]:s.history,calibrationFrames:s.calibrating?[...s.calibrationFrames,frames]:s.calibrationFrames})),
  tick:()=>set(s=>{if(!s.running||s.liveHardware)return s;const samples=createSamples();return{samples,history:s.recording?[...s.history.slice(-899),samples]:s.history,calibrationFrames:s.calibrating?[...s.calibrationFrames,samples]:s.calibrationFrames}})
}),{name:'muvance-project-v1',storage:createJSONStorage(()=>localStorage),partialize:s=>({view:s.view,activeFloorId:s.activeFloorId,floors:s.floors,calibrations:s.calibrations})}));
