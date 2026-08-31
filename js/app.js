import {APP_VERSION,BUILD_DATE} from "./version.js";
import {store,keys} from "./storage.js"; import {loadVehicles} from "./database.js";
import {calc,fmt,money} from "./calculator.js"; import {exportTxt,shareResult} from "./export.js";
import * as timer from "./timer.js";

const $=id=>document.getElementById(id); let base=[],result=null,paused=false;
const prefs=()=>({price:parseNum($("pricePerKwh").value),fee:parseNum($("startFee").value),efficiency:Number($("efficiency").value)||90});
const parseNum=v=>Number(String(v).replace(",","."))||0;
function allCars(){return [...base.flatMap(g=>g.modelos),...store.get(keys.customVehicles,[])]}
function selectedCar(){return allCars().find(c=>String(c.id)===$("modelSelect").value)}
function getInput(){const o=$("chargerPower").selectedOptions[0],custom=o.value==="custom",power=custom?parseNum($("manualChargerPower").value):Number(o.value),type=custom?$("manualType").value:o.dataset.type;return {car:selectedCar(),current:Number($("currentBattery").value),target:Number($("targetBattery").value),power,type,shared:$("sharedPower").checked,...prefs()}}
function render(){
 const i=getInput(); if(!i.car)return; result=calc(i); const c=i.car;
 $("currentOut").textContent=i.current+"%";$("targetOut").textContent=i.target+"%";
 $("totalCostDisplay").textContent=money(result.cost);$("gridEnergyDisplay").textContent=`Energia da rede: ${fmt(result.gridKwh)} kWh`;
 $("timeDisplay").textContent=`${Math.floor(result.hours)}h ${Math.round((result.hours%1)*60)}min`;$("kwhNeededDisplay").textContent=`Energia na bateria: ${fmt(result.batteryKwh)} kWh`;
 $("currentRangeDisplay").textContent=`Carga atual: ${fmt(result.rangeNow)} km`;$("targetRangeDisplay").textContent=`Meta: ${fmt(result.rangeTarget)} km`;
 $("limitWarning").textContent=result.warning;$("limitWarning").classList.toggle("hidden",!result.warning);
 $("vehicleSpec").innerHTML=[["Marca",c.marca],["Modelo",c.modelo],["Versão",c.versao],["Tecnologia",c.tecnologia],["Bateria",c.bateria],["AC",`${c.maxAC??"—"} kW`],["DC",`${c.maxDC??"—"} kW`],["Autonomia",c.autonomia_eletrica]].map(x=>`<div class="spec"><small>${x[0]}</small>${x[1]??"—"}</div>`).join("");
 const fav=store.get(keys.favorite,null);$("favoriteBtn").textContent=String(fav)===String(c.id)?"★ Veículo favorito":"☆ Favoritar veículo";
 store.set(keys.prefs,{...i,carId:c.id});
}
function populateBrands(){ $("brandSelect").innerHTML=base.map(g=>`<option>${g.marca}</option>`).join("");populateModels() }
function populateModels(){const brand=$("brandSelect").value;const cars=allCars().filter(c=>c.marca===brand);$("modelSelect").innerHTML=cars.map(c=>`<option value="${c.id}">${c.disp_name||`${c.modelo} ${c.versao}`}</option>`).join("");const p=store.get(keys.prefs,{});if(p.carId&&cars.some(c=>String(c.id)===String(p.carId)))$("modelSelect").value=p.carId;render()}
function renderProfiles(){const cs=store.get(keys.chargers,[]);$("chargerProfile").innerHTML=`<option value="">Selecionar perfil salvo...</option>`+cs.map((c,i)=>`<option value="${i}">${c.name} — ${c.power} kW</option>`).join("")}
function showCustomVehicles(){const list=store.get(keys.customVehicles,[]);$("customVehiclesList").innerHTML=list.length?list.map(c=>`<div class="item"><b>${c.marca} ${c.modelo} ${c.versao}</b><span class="muted">${c.bateria} · AC ${c.maxAC} kW · DC ${c.maxDC} kW</span></div>`).join(""):"<p class='muted'>Nenhum veículo personalizado.</p>"}
function showChargers(){const list=store.get(keys.chargers,[]);$("chargersList").innerHTML=list.length?list.map(c=>`<div class="item"><b>${c.name}</b><span class="muted">${c.power} kW · ${c.type.toUpperCase()} · ${money(c.price)}/kWh</span></div>`).join(""):"<p class='muted'>Nenhum carregador salvo.</p>"}
function showHistory(){const h=store.get(keys.history,[]);const cost=h.reduce((s,x)=>s+x.cost,0),energy=h.reduce((s,x)=>s+x.gridKwh,0);$("historySummary").innerHTML=`<div class="result-card"><span>Recargas</span><strong>${h.length}</strong></div><div class="result-card"><span>Total gasto</span><strong>${money(cost)}</strong></div><div class="result-card"><span>Energia da rede</span><strong>${fmt(energy)} kWh</strong></div>`;$("historyList").innerHTML=h.length?h.map(x=>`<div class="item"><b>${x.car}</b><span class="muted">${new Date(x.date).toLocaleString("pt-BR")} · ${x.current}%→${x.target}% · ${money(x.cost)}</span></div>`).join(""):"<p class='muted'>Nenhuma recarga salva.</p>"}
function dialog(title,fields,onSave){$("dialogContent").innerHTML=`<h2>${title}</h2>`+fields.map(f=>`<label>${f.label}<input id="f_${f.id}" type="${f.type||"text"}" value="${f.value||""}" ${f.step?`step="${f.step}"`:""}></label>`).join("");const d=$("formDialog");d.showModal();$("dialogSaveBtn").onclick=e=>{e.preventDefault();onSave(Object.fromEntries(fields.map(f=>[f.id,$("f_"+f.id).value])));d.close()}}
function setup(){
 document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab-panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("tab-"+b.dataset.tab).classList.add("active");if(b.dataset.tab==="history")showHistory()});
 ["currentBattery","targetBattery","chargerPower","manualChargerPower","manualType","sharedPower","pricePerKwh","startFee","efficiency"].forEach(id=>$(id).addEventListener("input",()=>{ $("customPowerBox").classList.toggle("hidden",$("chargerPower").value!=="custom");render()}));
 $("brandSelect").onchange=populateModels;$("modelSelect").onchange=render;
 $("favoriteBtn").onclick=()=>{store.set(keys.favorite,selectedCar().id);render()};
 $("chargerProfile").onchange=()=>{const c=store.get(keys.chargers,[])[$("chargerProfile").value];if(c){$("manualChargerPower").value=c.power;$("chargerPower").value="custom";$("manualType").value=c.type;$("pricePerKwh").value=String(c.price).replace(".",",");$("customPowerBox").classList.remove("hidden");render()}};
 $("addVehicleBtn").onclick=()=>dialog("Adicionar veículo",[{id:"marca",label:"Marca"},{id:"modelo",label:"Modelo"},{id:"versao",label:"Versão"},{id:"bateria",label:"Bateria (ex.: 60 kWh)"},{id:"kwh",label:"Capacidade kWh",type:"number",step:"0.1"},{id:"km100",label:"Autonomia km",type:"number"},{id:"maxAC",label:"Máx. AC kW",type:"number",step:"0.1"},{id:"maxDC",label:"Máx. DC kW",type:"number",step:"0.1"}],v=>{const a=store.get(keys.customVehicles,[]);a.push({...v,id:"custom_"+Date.now(),disp_name:`${v.modelo} ${v.versao}`,tecnologia:"BEV",potencia:"—",autonomia_eletrica:(v.km100||0)+" km",autonomia_total:"—",tracao:"—",motor:"—",kwh:Number(v.kwh),km100:Number(v.km100),maxAC:Number(v.maxAC),maxDC:Number(v.maxDC)});store.set(keys.customVehicles,a);showCustomVehicles();populateBrands()});
 $("addChargerBtn").onclick=()=>dialog("Adicionar carregador",[{id:"name",label:"Nome"},{id:"power",label:"Potência kW",type:"number",step:"0.1"},{id:"type",label:"Tipo (ac ou dc)"},{id:"price",label:"Preço R$/kWh",type:"number",step:"0.01"}],v=>{const a=store.get(keys.chargers,[]);a.push({...v,power:Number(v.power),price:Number(v.price),type:(v.type||"ac").toLowerCase()});store.set(keys.chargers,a);showChargers();renderProfiles()});
 $("saveChargeBtn").onclick=()=>{const i=getInput();const h=store.get(keys.history,[]);h.unshift({date:Date.now(),car:`${i.car.marca} ${i.car.modelo} ${i.car.versao}`,current:i.current,target:i.target,cost:result.cost,gridKwh:result.gridKwh});store.set(keys.history,h);alert("Recarga salva no histórico.");showHistory()};
 $("clearHistoryBtn").onclick=()=>{if(confirm("Limpar todo o histórico?")){store.set(keys.history,[]);showHistory()}};
 $("exportTxtBtn").onclick=()=>{const i=getInput();exportTxt({...i,result})};$("shareBtn").onclick=()=>{const i=getInput();shareResult({...i,result})};
 $("findChargersBtn").onclick=()=>window.open("https://www.google.com/maps/search/eletroposto+perto+de+mim","_blank");
 $("startTimerBtn").onclick=async()=>{if(!result?.seconds){alert("Defina uma recarga válida.");return}if("Notification"in window&&Notification.permission==="default")await Notification.requestPermission();paused=false;timer.start(result.seconds,Number($("alertMinutes").value)||10,tick,done)};
 $("pauseTimerBtn").onclick=()=>{timer.stop();paused=true;$("timerStatusMsg").textContent="Simulação pausada."};$("stopTimerBtn").onclick=()=>{timer.stop();$("countdownDisplay").textContent="00:00:00";$("timerStatusMsg").textContent="Simulação encerrada."};
 $("themeBtn").onclick=()=>{document.body.classList.toggle("light");store.set(keys.theme,document.body.classList.contains("light"))}
}
function tick(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60),z=s%60;$("countdownDisplay").textContent=[h,m,z].map(n=>String(n).padStart(2,"0")).join(":");$("timerStatusMsg").textContent="Simulação em andamento..."}
function done(){$("countdownDisplay").textContent="00:00:00";$("timerStatusMsg").textContent="⚡ Simulação concluída!";if(navigator.vibrate)navigator.vibrate([500,200,500]);if(Notification.permission==="granted")new Notification("EletroCalc",{body:"Simulação concluída!"})}
async function init(){base=await loadVehicles();$("appVersion").textContent="v"+APP_VERSION;$("settingsVersion").textContent=APP_VERSION;$("footerVersion").textContent="v"+APP_VERSION;$("buildDate").textContent=BUILD_DATE;if(store.get(keys.theme,false))document.body.classList.add("light");populateBrands();renderProfiles();showCustomVehicles();showChargers();showHistory();setup();timer.restoreTimer(tick,done)}
init().catch(e=>alert(e.message));
