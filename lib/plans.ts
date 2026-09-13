export const plans=[
 {id:'month',name:'1개월',months:1,amount:4900,monthly:4900,discount:0},
 {id:'half',name:'6개월',months:6,amount:26460,monthly:4410,discount:10},
 {id:'year',name:'1년',months:12,amount:41160,monthly:3430,discount:30},
] as const;
export function addMonths(time:number,months:number){
 const d=new Date(time),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);
 const end=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,end));return d.getTime();
}
