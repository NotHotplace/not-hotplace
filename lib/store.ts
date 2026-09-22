import { env } from 'cloudflare:workers';
import {usRegions} from './us-regions';
import {catalog, type Place} from './catalog';
import type {SiteUser} from './site-auth';
export function db(){if(!env.DB)throw new Error('DB unavailable');return env.DB;}
export async function isOwner(user:SiteUser){
 const ownerEmail=(env as unknown as Record<string,string|undefined>).OWNER_GOOGLE_EMAIL?.trim().toLowerCase();
 if(ownerEmail&&user.provider==='google'&&user.googleEmailVerified===true&&user.email.trim().toLowerCase()===ownerEmail)return true;
 return !!await db().prepare('SELECT id FROM owner WHERE id=1 AND user_id=?').bind(user.userId).first();
}
export async function allPlaces():Promise<Place[]>{const r=await db().prepare("SELECT * FROM suggestions WHERE status='approved' ORDER BY created_at DESC").all<any>();return [...catalog,...r.results.map(p=>({id:p.id,country:(usRegions.includes(p.city)?'US':'KR') as 'US'|'KR',city:p.city,category:p.category,name:p.name,area:p.city,address:p.address,description:p.note||'사용자 제안으로 등록된 장소입니다.',source:p.source,checked:new Date(p.decided_at).toISOString().slice(0,10),tags:['운영자 승인']}))];}
export async function hasPlace(id:string){if(catalog.some(p=>p.id===id))return true;return !!await db().prepare("SELECT id FROM suggestions WHERE id=? AND status='approved'").bind(id).first();}
