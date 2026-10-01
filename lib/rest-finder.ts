import type {Place} from './catalog';
import {distanceKm} from './discovery';
import {matchesPlaceTheme} from './place-themes';
import {wilson} from './ranking';

export type TimeBucket = {day:string;time:string;n:number;quiet:number;relaxed:number};
export type FinderPlace = Place & {count?:number;quiet?:number;positive?:number;latest?:number|null;resting?:boolean;insights?:TimeBucket[];bestTime?:TimeBucket|null};
export type RestPreferences = {
  purpose:'all'|'cafe'|'food'|'drive'|'private-room'|'premium-spa';
  party:'any'|'solo'|'together';
  day:'any'|'평일'|'주말·공휴일';
  time:'any'|'오전'|'오후'|'저녁';
  budget:number|null;
  position?:{lat:number;lon:number}|null;
  radiusKm?:number;
};
export const defaultRestPreferences:RestPreferences = {purpose:'all',party:'any',day:'any',time:'any',budget:null};

// A published admission fee is not the total cost of a visit. Unknown menu prices
// and room minimum spends must never pass a numeric budget filter.
export function publishedCost(place:Place) {
  const detail=place.visitDetails?.find(item=>/^admission$/i.test(item.labelEn));
  if(detail && /^(무료|free)\.?$/i.test(detail.textKo.trim())) return {amount:0,basis:'admission' as const};
  return null;
}
export function bestQuietTime(buckets:TimeBucket[], preferences?:Pick<RestPreferences,'day'|'time'>) {
  return buckets.filter(bucket=>bucket.n>=3 && bucket.quiet/bucket.n>=.6 && bucket.relaxed/bucket.n>=.6
    && (!preferences||preferences.day==='any'||bucket.day===preferences.day)
    && (!preferences||preferences.time==='any'||bucket.time===preferences.time))
    .sort((a,b)=>wilson(b.quiet,b.n)-wilson(a.quiet,a.n)||b.n-a.n||a.day.localeCompare(b.day)||a.time.localeCompare(b.time))[0]||null;
}
export function restMatches(places:FinderPlace[],preferences:RestPreferences,limit=3) {
  const matched=places.filter(place=>{
    if(place.resting) return false;
    if(preferences.purpose==='private-room'||preferences.purpose==='premium-spa') {
      if(!matchesPlaceTheme(place,preferences.purpose)) return false;
    } else if(preferences.purpose==='drive'?!['drive','walk'].includes(place.category):preferences.purpose!=='all'&&place.category!==preferences.purpose) return false;
    if(preferences.party==='solo'&&/2인\s*이상|최소\s*2명|at least two diners/i.test([place.description,place.descriptionEn,...(place.visitDetails||[]).map(item=>item.textKo+' '+item.textEn)].join(' '))) return false;
    if(preferences.position) {
      if(typeof place.lat!=='number'||typeof place.lon!=='number'||!Number.isFinite(place.lat)||!Number.isFinite(place.lon)) return false;
      if(distanceKm(preferences.position,{lat:place.lat,lon:place.lon})>(preferences.radiusKm??10)) return false;
    }
    if(preferences.budget!==null) {const cost=publishedCost(place);if(!cost||cost.amount>preferences.budget) return false;}
    return true;
  }).map(place=>{
    const count=place.count||0,quiet=place.quiet||0,positive=place.positive||0;
    const reviewed=count>=3&&quiet/count>=.6&&positive/count>=.7;
    const time=bestQuietTime(place.insights||(place.bestTime?[place.bestTime]:[]),preferences);
    const distance=preferences.position?distanceKm(preferences.position,{lat:place.lat!,lon:place.lon!}):null;
    const completeness=Number(!!place.image)*3+Math.min(place.visitDetails?.length||0,4)+Number(!!place.experiences?.length)*2;
    const score=Number(!!time)*30+Number(reviewed)*20+(reviewed?wilson(quiet,count)*5:0)+completeness-(distance===null?0:distance/10);
    return {place,reviewed,time,distance,score};
  });
  return matched.sort((a,b)=>b.score-a.score||a.place.id.localeCompare(b.place.id)).slice(0,limit);
}
export function visitingTimeLabel(bucket:Pick<TimeBucket,'day'|'time'>,language:'ko'|'en') {
  return language==='ko'?bucket.day+' '+bucket.time:(bucket.day==='평일'?'Weekday':'Weekend / holiday')+' · '+({오전:'Morning',오후:'Afternoon',저녁:'Evening'} as Record<string,string>)[bucket.time];
}
