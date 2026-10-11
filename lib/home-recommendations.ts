import type {Place} from './catalog';
import type {RecommendationReason,RestPurpose} from './place-presentation';
import type {RestCondition} from './rest-conditions';
import {restMatches,type FinderPlace,type RestPreferences} from './rest-finder';
import {wilson} from './ranking';

const sourced=(fact:RecommendationReason)=>typeof fact.source==='string'&&/^https:\/\//.test(fact.source)
  && typeof fact.checked==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(fact.checked)
  && typeof fact.textKo==='string'&&!!fact.textKo.trim()&&typeof fact.textEn==='string'&&!!fact.textEn.trim();
// Parking, hours, ordering systems and category tags alone do not explain a
// restorative visit. Keep such information available in the full browse lists.
const conditionsByPurpose:Record<RestPurpose,RestCondition[]>={
  all:['books','soloSeats'],
  cafe:['books','soloSeats','partitions'],
  food:['soloSeats','partitions','privateRoom'],
  drive:[],
  'private-room':['privateRoom'],
  'premium-spa':[],
};
export function homePurposeReason(place:Place,purpose:RestPurpose):RecommendationReason|undefined {
  const reason=place.recommendationReasons?.find(fact=>sourced(fact)
    && fact.sourceKind!=='visitor-impression' && fact.purposes?.includes(purpose));
  if(reason)return reason;
  // Use the specific published fact, rather than replacing it with a generic
  // "seating information available" sentence. Low-music anecdotes cannot alone
  // qualify as quietness evidence; account-review thresholds remain unchanged.
  const condition=place.conditions?.find(fact=>conditionsByPurpose[purpose].includes(fact.kind)&&sourced(fact));
  return condition?{textKo:condition.textKo,textEn:condition.textEn,source:condition.source,checked:condition.checked}:undefined;
}
export function homeRestMatches(places:FinderPlace[],preferences:RestPreferences,limit=3) {
  const position=preferences.position;
  if(position&&(!Number.isFinite(position.lat)||Math.abs(position.lat)>90
    ||!Number.isFinite(position.lon)||Math.abs(position.lon)>180
    ||!Number.isFinite(preferences.radiusKm??10)||(preferences.radiusKm??10)<0))return [];
  if(!Number.isInteger(limit)||limit<=0)return [];
  // Reuse existing category, party, budget, distance and paused-place filters.
  // Discard their completeness/photo score: this narrower home shortlist needs
  // actual purpose evidence, not enough details or a quota of three cards.
  const candidates=restMatches(places.filter(place=>!position||
    (typeof place.lat==='number'&&Math.abs(place.lat)<=90&&typeof place.lon==='number'&&Math.abs(place.lon)<=180)),preferences,places.length)
    .map(({score:_score,...match})=>({...match,reason:homePurposeReason(match.place,preferences.purpose)}))
    .filter(match=>match.reviewed||match.reason);
  return candidates.sort((a,b)=>Number(b.reviewed)-Number(a.reviewed)
    || (a.reviewed&&b.reviewed?(Number(!!b.time)-Number(!!a.time)
      || wilson(b.place.quiet||0,b.place.count||0)-wilson(a.place.quiet||0,a.place.count||0)):0)
    || (position?(a.distance??Infinity)-(b.distance??Infinity):0)
    || a.place.id.localeCompare(b.place.id,'en')).slice(0,Math.min(limit,3));
}
