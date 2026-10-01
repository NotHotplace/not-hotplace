import {db} from './store';
import {siteOrigin} from './site-auth';
import {koreaDay} from './traffic';
export const reactionCookieName='__Host-nhp-reaction';
export function reactionToken(request:Request){
 const value=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(reactionCookieName+'='))?.slice(reactionCookieName.length+1);
 return value&&/^[0-9a-f-]{36}$/.test(value)?value:null;
}
export function reactionCookie(value:string){return reactionCookieName+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7776000';}
export function validSiteOrigin(request:Request){return request.headers.get('origin')===siteOrigin()&&request.headers.get('sec-fetch-site')!=='cross-site';}
export async function anonymousHash(value:string){
 const d=db();await d.prepare('INSERT OR IGNORE INTO quick_feedback_settings(name,value) VALUES(?,?)').bind('salt',crypto.randomUUID()+crypto.randomUUID()).run();
 const row=await d.prepare('SELECT value FROM quick_feedback_settings WHERE name=?').bind('salt').first<{value:string}>();if(!row)throw new Error('salt');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(row.value),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function allowedAnonymous(actor:string,max:number){
 const r=await db().prepare('INSERT INTO quick_feedback_limits(day,actor,total) VALUES(?,?,1) ON CONFLICT(day,actor) DO UPDATE SET total=total+1 WHERE total<?').bind(koreaDay(),actor,max).run();return (r.meta.changes||0)>0;
}
