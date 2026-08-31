import {store,keys} from "./storage.js";
let interval=null;
export function restoreTimer(onTick,onDone){const s=store.get(keys.timer,null);if(s?.end>Date.now())start(s.end,s.alert,onTick,onDone);else store.remove(keys.timer)}
export function start(seconds,alertMin,onTick,onDone){const end=Date.now()+seconds*1000;store.set(keys.timer,{end,alert:alertMin});run(end,alertMin,onTick,onDone)}
function run(end,alert,onTick,onDone){clearInterval(interval);let warned=false;interval=setInterval(()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));onTick(left);if(left<=alert*60&&!warned){warned=true;if(navigator.vibrate)navigator.vibrate([250,120,250]);if(Notification.permission==="granted")new Notification("EletroCalc",{body:`Faltam aproximadamente ${alert} minutos.`})}if(!left){clearInterval(interval);store.remove(keys.timer);onDone()}},500)}
export function stop(){clearInterval(interval);store.remove(keys.timer)}