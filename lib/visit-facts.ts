import type {Place} from './catalog';

export type FactSource={source:string;checked:string};
export type VisitFacts={
 price?:FactSource&{amount?:number;currency:string;basis:'admission'|'menu'|'experience'|'minimum-spend';textKo:string;textEn:string};
 parking?:FactSource&{status:'available'|'unavailable'|'nearby';textKo:string;textEn:string};
 seating?:FactSource&{solo:boolean;groupSizes:number[];group:boolean;textKo:string;textEn:string};
};

// Infer only explicit published facts. An omitted fact never means unavailable.
export function visitFacts(place:Place):VisitFacts {
 const facts:VisitFacts={...place.visitFacts};
 const source={source:place.source,checked:place.checked};
 const parking=place.visitDetails?.find(d=>/^parking$/i.test(d.labelEn));
 if(!facts.parking&&parking){
  const s=parking.textKo+' '+parking.textEn;
  const status=/불가능|주차\s*불가|주차장\s*없|no\s+(?:on.site\s+)?parking|parking\s+unavailable/i.test(s)?'unavailable':/인근|주변\s*주차|nearby\s+(?:public\s+)?parking/i.test(s)?'nearby':/주차\s*가능|안내:\s*가능|parking\s+available/i.test(s)?'available':null;
  if(status)facts.parking={...source,status,textKo:parking.textKo,textEn:parking.textEn};
 }
 if(!facts.seating){
  const seating=place.visitDetails?.find(d=>/^seating$/i.test(d.labelEn));
  const soloFact=place.conditions?.find(d=>d.kind==='soloSeats');
  const s=[seating?.textKo,seating?.textEn,soloFact?.textKo,soloFact?.textEn].filter(Boolean).join(' ');
  const solo=/1인석|individual\s+seats|single\s+seats/i.test(s)&&!/1인석\s*(?:없|불가)|no\s+(?:individual|single)\s+seats/i.test(s);
  const groupSizes=[...s.matchAll(/(?:([2-9])\s*인석|([2-9])\s*[- ]?seat\s+(?:table|seating))/gi)].map(m=>Number(m[1]||m[2]));
  const group=groupSizes.length>0||/다인석|공용\s*테이블|communal\s+table/i.test(s);
  if(solo||group)facts.seating={...(soloFact||source),solo,group,groupSizes:[...new Set(groupSizes)],textKo:seating?.textKo||soloFact?.textKo||'',textEn:seating?.textEn||soloFact?.textEn||''};
 }
 if(!facts.price){
  const admission=place.visitDetails?.find(d=>/^admission$/i.test(d.labelEn));
  if(admission&&/^(?:무료|free)\.?$/i.test(admission.textKo.trim())) facts.price={...source,amount:0,currency:'',basis:'admission',textKo:'일반 입장 무료',textEn:'Free general admission'};
 }
 return facts;
}
