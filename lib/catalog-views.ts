import type {Place} from './catalog';
import {countries,type CountryCode} from './countries';
import {inRegion} from './regions';
import {defaultRestPreferences,restMatches,type FinderPlace,type RestPreferences} from './rest-finder';
import {homeRestMatches} from './home-recommendations';

export type JournalPlace=Pick<Place,'id'|'country'|'name'|'area'|'image'|'imageCredit'|'imageLicense'|'lat'|'lon'>;
export type CollectionPlace=Pick<Place,'id'|'country'|'name'|'city'|'address'|'states'>;
const purposes:RestPreferences['purpose'][]=['all','cafe','food','drive','private-room','premium-spa'];
export function finderMatches(places:FinderPlace[],params:URLSearchParams,country:CountryCode){
 const region=params.get('region')||countries[country].defaultRegion;
 const purpose=params.get('purpose')||'all';
 if(region!=='전국'&&!(countries[country].regions as readonly string[]).includes(region))throw new Error('Invalid region');
 if(!purposes.includes(purpose as RestPreferences['purpose']))throw new Error('Invalid purpose');
 const candidates=places.filter(p=>(p.country||'KR')===country&&inRegion(p,region));
 const preferences={...defaultRestPreferences,purpose:purpose as RestPreferences['purpose']};
 // Bounded rollout: only explicitly selected Seoul has been reviewed for this
 // stricter shortlist. Other countries/regions retain their existing behavior.
 return country==='KR'&&params.get('region')==='서울'
  ?homeRestMatches(candidates,preferences)
  :restMatches(candidates,preferences).map(match=>({...match,reason:undefined}));
}
export function collectionPlace(place:Place):CollectionPlace{
 const {id,country,name,city,address,states}=place;
 return {id,country,name,city,address,states};
}
