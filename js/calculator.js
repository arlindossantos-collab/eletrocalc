export function calc(input){
 const c=input.car, pct=Math.max(0,input.target-input.current), battery=Number(c.kwh)||0;
 const batteryKwh=battery*pct/100, efficiency=Math.min(1,Math.max(.5,input.efficiency/100));
 const gridKwh=batteryKwh/efficiency, basePower=input.shared?input.power/2:input.power;
 const max=input.type==="dc"?(Number(c.maxDC)||0):(Number(c.maxAC)||0);
 let power=basePower, warning="";
 if(!battery){power=0;warning="Este veículo não possui bateria plugável."}
 else if(max===0){power=0;warning=`O veículo não suporta recarga ${input.type.toUpperCase()}.`}
 else if(power>max){power=max;warning=`Potência limitada pelo veículo a ${max} kW em ${input.type.toUpperCase()}.`}
 const cost=gridKwh*input.price+input.fee, hours=power>0?batteryKwh/power:0;
 const taper=input.type==="dc"&&input.target>80?1+(input.target-80)/100*.35:1;
 const seconds=Math.round(hours*taper*3600);
 const rangeNow=(Number(c.km100)||0)*input.current/100, rangeTarget=(Number(c.km100)||0)*input.target/100;
 return {pct,batteryKwh,gridKwh,cost,power,hours:hours*taper,seconds,warning,rangeNow,rangeTarget,efficiency};
}
export const fmt=n=>new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1}).format(n);
export const money=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);