import {z} from 'zod';
import {countries,type CountryCode} from './countries';
import {inRegion} from './regions';
import type {Place} from './catalog';
export const publicLink=z.string().trim().max(240).refine(value=>{if(!value)return true;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}},'HTTPS link required');
export function supportedRegion(country:CountryCode,region:string){return (countries[country].regions as readonly string[]).includes(region);}
export function validCollection(places:Place[],ids:string[],country:CountryCode,region:string){
 return supportedRegion(country,region)&&ids.length>=2&&ids.length<=8&&new Set(ids).size===ids.length&&ids.every(id=>places.some(p=>p.id===id&&(p.country||'KR')===country&&inRegion(p,region)));
}
export function publicProfile(p:any){return {id:p.id,name:p.name,country:p.country,region:p.region,link:p.link,bio:p.bio};}
export function publicCollection(p:any){let ids:string[]=[];try{ids=JSON.parse(p.place_ids);}catch{}return {id:p.id,title:p.title,country:p.country,region:p.region,placeIds:ids,note:p.note,profileId:p.profile_id,author:p.author,link:p.link};}
