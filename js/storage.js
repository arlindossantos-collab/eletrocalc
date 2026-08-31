const P="eletrocalc_v3_";
export const store={get:(k,d)=>{try{const v=localStorage.getItem(P+k);return v?JSON.parse(v):d}catch{return d}},set:(k,v)=>localStorage.setItem(P+k,JSON.stringify(v)),remove:k=>localStorage.removeItem(P+k)};
export const keys={prefs:"prefs",customVehicles:"customVehicles",chargers:"chargers",history:"history",favorite:"favorite",theme:"theme",timer:"timer"};