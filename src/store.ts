import { create } from 'zustand';
import type { Floor, SignalSample } from './types';
import { createSamples } from './engine';

interface State { view:'scope'|'map'|'devices'|'lab'; running:boolean; recording:boolean; selectedAdapter:string|null; floor:Floor; samples:SignalSample[]; history:SignalSample[][]; setView:(v:State['view'])=>void; toggleRun:()=>void; toggleRecord:()=>void; selectAdapter:(id:string|null)=>void; tick:()=>void }
export const useAppStore=create<State>((set)=>({
  view:'map',running:true,recording:false,selectedAdapter:null,
  floor:{id:'floor-1',name:'Level 1',width:100,height:100,walls:[
    {id:'w1',start:{x:8,y:8},end:{x:92,y:8},material:'brick'},{id:'w2',start:{x:92,y:8},end:{x:92,y:92},material:'brick'},{id:'w3',start:{x:92,y:92},end:{x:8,y:92},material:'brick'},{id:'w4',start:{x:8,y:92},end:{x:8,y:8},material:'brick'},
    {id:'w5',start:{x:49,y:8},end:{x:49,y:43},material:'drywall'},{id:'w6',start:{x:49,y:59},end:{x:49,y:92},material:'drywall'},{id:'w7',start:{x:49,y:43},end:{x:74,y:43},material:'glass'}]},
  samples:createSamples(),history:[],setView:view=>set({view}),toggleRun:()=>set(s=>({running:!s.running})),toggleRecord:()=>set(s=>({recording:!s.recording})),selectAdapter:selectedAdapter=>set({selectedAdapter}),tick:()=>set(s=>{if(!s.running)return s;const samples=createSamples();return {samples,history:s.recording?[...s.history.slice(-899),samples]:s.history};})
}));
