import type {Place} from './catalog';
export const conditionKeys=['books','soloSeats','privateRoom','parking','quietMusic','partitions','soloOrder','selfOrder'] as const;
export type RestCondition=typeof conditionKeys[number];
export type ConditionFact={kind:RestCondition;textKo:string;textEn:string;source:string;checked:string};
export const conditionLabels:Record<RestCondition,[string,string]>={
 books:['책·독서 공간','Books and reading'],soloSeats:['1인석 안내','Individual seats'],privateRoom:['독립된 룸','Private room'],parking:['주차 가능 안내','Parking available'],
 quietMusic:['음악이 작다는 후기','Low-music feedback'],partitions:['칸막이 좌석','Partitioned seats'],soloOrder:['혼자 주문 가능','Solo ordering'],selfOrder:['셀프 주문','Self ordering'],
};
export const reviewConditionTags:Partial<Record<RestCondition,string>>={quietMusic:'작은 음악',partitions:'칸막이 좌석',soloOrder:'혼자 주문',selfOrder:'셀프 주문',soloSeats:'1인석'};
export function restFeedbackCounts(rows:{tag:string;n:number}[]){
 const counts:Partial<Record<RestCondition,number>>={};
 for(const [key,tag] of Object.entries(reviewConditionTags)){const row=rows.find(r=>r.tag===tag);if(row)counts[key as RestCondition]=Number(row.n);}
 return counts;
}
export type ConditionPlace=Pick<Place,'conditions'>&{restFeedback?:Partial<Record<RestCondition,number>>;resting?:boolean};
export function matchesCondition(place:ConditionPlace,kind:RestCondition){
 return !!place.conditions?.some(f=>f.kind===kind)||(!place.resting&&(place.restFeedback?.[kind]||0)>=3);
}
export function conditionEvidence(place:ConditionPlace,kind:RestCondition,language:'ko'|'en'){
 const fact=place.conditions?.find(f=>f.kind===kind);
 if(fact)return {text:language==='ko'?fact.textKo:fact.textEn,source:fact.source,checked:fact.checked};
 const n=place.restFeedback?.[kind]||0;
 return n>=3&&!place.resting?{text:language==='ko'?'최근 90일 방문 후기 '+n+'건':'Reported in '+n+' account reviews in the last 90 days',source:'',checked:''}:null;
}
