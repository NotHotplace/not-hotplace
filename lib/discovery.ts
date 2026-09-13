export function distanceKm(a:{lat:number;lon:number},b:{lat:number;lon:number}){
 const r=Math.PI/180,dlat=(b.lat-a.lat)*r,dlon=(b.lon-a.lon)*r;
 const v=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlon/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(v),Math.sqrt(Math.max(0,1-v)));
}
export type QualityEvidence={n:number;bad:number;days:number;first:number|null;last:number|null};
export function qualityState(e:QualityEvidence,now=Date.now()){
 const enough=e.n>=8&&e.days>=3&&e.first!==null&&e.last!==null&&e.last-e.first>=7*86400000;
 const recent=e.last!==null&&now-e.last<30*86400000;
 if(enough&&recent&&e.bad/e.n>=.5)return 'resting';
 if(e.n>=3&&e.bad/e.n>=.5)return 'watch';
 return 'normal';
}
