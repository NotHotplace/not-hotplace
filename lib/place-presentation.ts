import type {Place,VisitDetail} from './catalog';
import {conditionLabels,type RestCondition} from './rest-conditions';
import {placeDescription} from './place-copy';
export type RecommendationReason={textKo:string;textEn:string;source:string;checked:string;sourceKind?:string};
export function categoryConditions(category?:string):RestCondition[]{
 if(category==='spa')return ['privateRoom','parking','quietMusic'];
 if(category==='walk'||category==='drive')return ['parking'];
 if(category==='food')return ['soloSeats','privateRoom','parking','quietMusic','partitions','soloOrder','selfOrder'];
 return ['books','soloSeats','privateRoom','parking','quietMusic','partitions','soloOrder','selfOrder'];
}
const sourced=(fact:{source?:string;checked?:string})=>!!fact.source&&/^https:\/\//.test(fact.source)&&!!fact.checked&&/^\d{4}-\d{2}-\d{2}$/.test(fact.checked);
export function conciseText(value:string,max=180){const clean=value.replace(/\s+/g,' ').trim();if(clean.length<=max)return clean;const sentence=clean.match(/^.*?[.!?。](?:\s|$)/)?.[0]?.trim();return sentence&&sentence.length<=max?sentence:clean.slice(0,max).trimEnd()+'…';}
export function placeIdentity(place:Place,language:'ko'|'en'){return conciseText(placeDescription(place,language),language==='ko'?95:160);}
export function candidateReasons(place:Place):RecommendationReason[]{
 const reasons:RecommendationReason[]=(place.recommendationReasons||[]).filter(sourced);
 const relevant=categoryConditions(place.category);
 for(const fact of place.conditions||[])if(relevant.includes(fact.kind)&&sourced(fact)&&!reasons.length)reasons.push({textKo:conditionLabels[fact.kind][0]+' 안내가 있어요.',textEn:'Published details cover '+conditionLabels[fact.kind][1].toLowerCase()+'.',source:fact.source,checked:fact.checked});
 if(!reasons.length){const detail=(place.visitDetails||[]).find(d=>/hours|admission|booking|reservation|access|location/i.test(d.labelEn)&&sourced(d));if(detail&&place.detailLevel!=='basic')reasons.push({textKo:'방문을 계획할 '+detail.labelKo+' 안내가 있어요.',textEn:'Published '+detail.labelEn.toLowerCase()+' details help plan a visit.',source:detail.source!,checked:detail.checked!});}
 return reasons.slice(0,2);
}
export function essentialDetails(place:Place):VisitDetail[]{
 const details=place.visitDetails||[],patterns=place.category==='spa'?[/price|admission|fee/i,/shared|privacy|room|age|who|adults/i,/booking|reservation|duration|session/i]:place.category==='cafe'||place.category==='food'?[/price|minimum.spend|admission/i,/seating|solo|ordering/i,/hours|booking|reservation/i]:[/price|admission|fee/i,/hours|access|entrance/i,/parking|route|closure/i];
 const result:VisitDetail[]=[];
 for(const pattern of patterns){const fact=details.find(d=>pattern.test(d.labelEn)&&!result.includes(d));if(fact)result.push(fact);}
 if(!result.some(d=>/price|minimum.spend|admission|fee/i.test(d.labelEn)))result.unshift({labelKo:'비용',labelEn:'Cost',textKo:'최신 요금은 공식 안내에서 확인',textEn:'Check current prices with the official source',source:place.source,checked:place.checked});
 return result.slice(0,3);
}
export function informationScore(place:Place){
 const facts=(place.visitDetails||[]).filter(sourced).length;
 const licensedPhoto=!!place.image&&!!place.imageCredit&&!!(place.imageLicenseUrl||place.photos?.some(p=>p.licenseUrl&&p.credit));
 return (place.detailLevel==='basic'?-20:0)+Math.min(facts,6)*3+(licensedPhoto?8:0);
}
export function reviewValue(positive:number,count:number,language:'ko'|'en'){
 const n=Math.max(0,Math.floor(count)),p=Math.min(n,Math.max(0,Math.floor(positive)));
 if(!n)return language==='ko'?'후기 없음':'No reviews';
 return n<3?(language==='ko'?`${n}명 중 ${p}명`:`${p} of ${n}`):`${Math.round(p/n*100)}%`;
}
export function reviewTags(category?:string):[string,string][]{
 if(category==='spa')return [['작은 음악','Low music']];
 if(category==='drive'||category==='walk')return [['풍경','Scenery'],['짧은 산책','Short walks']];
 return [['작은 음악','Low music'],['1인석','Individual seats'],['칸막이 좌석','Partitioned seats'],['혼자 주문','Solo ordering'],['셀프 주문','Self ordering']];
}
