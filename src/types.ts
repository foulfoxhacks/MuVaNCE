export type RadioKind = 'wifi' | 'ble' | 'csi' | 'sdr';
export type AdapterStatus = 'online' | 'calibrating' | 'offline';
export interface Point { x: number; y: number }
export interface Adapter { id:string; name:string; kind:RadioKind; status:AdapterStatus; capabilities:string[]; position:Point }
export interface SignalSample { adapterId:string; kind:RadioKind; timestamp:number; rssi:number; phase:number; amplitude:number; motion:number; channel:number }
export interface Floor { id:string; name:string; width:number; height:number; walls:Wall[]; imageData?:string; imageName?:string; imageOpacity?:number }
export interface Wall { id:string; start:Point; end:Point; material:'drywall'|'brick'|'concrete'|'glass' }
export interface OccupancyEstimate { position:Point; confidence:number; motion:number; sources:number }
