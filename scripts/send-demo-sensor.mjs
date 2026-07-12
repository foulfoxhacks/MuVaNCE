import dgram from 'node:dgram';
const socket=dgram.createSocket('udp4');
const sources=[['csi-1','csi',-56,6],['wifi-1','wifi',-63,36],['ble-1','ble',-71,37],['csi-2','csi',-60,11]];
let frame=0;
const timer=setInterval(()=>{
  const now=Date.now();
  const values=sources.map(([adapterId,kind,rssi,channel],i)=>({adapterId,kind,timestamp:now,rssi:rssi+Math.sin(frame/9+i)*3,phase:(frame/13+i)%6.283,amplitude:.62+Math.sin(frame/11+i)*.12,motion:.3+Math.sin(frame/7+i)*.15,channel}));
  const payload=Buffer.from(JSON.stringify(values));
  socket.send(payload,5006,'127.0.0.1'); frame++;
},100);
function stop(){clearInterval(timer);socket.close();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
console.log('Sending MuVance demo sensor frames to 127.0.0.1:5006');
