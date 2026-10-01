import {z} from 'zod';
import {db,hasPlace} from '@/lib/store';
import {reactionToken,reactionCookie,validSiteOrigin,anonymousHash,allowedAnonymous} from '@/lib/anonymous-actor';
import {koreaDay} from '@/lib/traffic';
const schema=z.object({placeId:z.string().min(1).max(100),kind:z.enum(['location','hours','parking','closed','conditions']),note:z.string().trim().max(400).optional()}).strict();
const reply=(body:unknown,status=200,cookie?:string)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store',...(cookie?{'Set-Cookie':reactionCookie(cookie)}:{})}});
export async function POST(request:Request){
 try{
  if(!validSiteOrigin(request))return reply({error:'Forbidden'},403);
  if(request.headers.get('content-type')!=='application/json')return reply({error:'JSON required'},415);
  const raw=await request.text();if(raw.length>1500)return reply({error:'Too large'},413);
  const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return reply({error:'Invalid report'},400);
  const p=parsed.data;if(!await hasPlace(p.placeId))return reply({error:'Unknown place'},404);
  const prior=reactionToken(request),token=prior||crypto.randomUUID(),actor=await anonymousHash(token),ip=request.headers.get('cf-connecting-ip');
  if(ip&&!await allowedAnonymous(await anonymousHash('report-ip:'+koreaDay()+':'+ip),30))return reply({error:'Daily limit reached'},429);
  if(!await allowedAnonymous('report:'+actor,5))return reply({error:'Daily limit reached'},429);
  const now=Date.now();
  await db().prepare("INSERT INTO place_reports(id,actor,place_id,kind,note,status,created_at,updated_at) VALUES(?,?,?,?,?,'pending',?,?) ON CONFLICT(actor,place_id,kind) DO UPDATE SET note=excluded.note,status='pending',updated_at=excluded.updated_at").bind(crypto.randomUUID(),actor,p.placeId,p.kind,p.note||'',now,now).run();
  await db().prepare('DELETE FROM place_reports WHERE updated_at<?').bind(now-90*86400000).run();
  await db().prepare('DELETE FROM quick_feedback_limits WHERE day<?').bind(koreaDay(now-2*86400000)).run();
  return reply({ok:true,status:'pending'},200,prior?undefined:token);
 }catch(e){return reply({error:'Unable to submit'},e instanceof SyntaxError?400:503);}
}
export async function DELETE(request:Request){
 try{
  if(!validSiteOrigin(request))return reply({error:'Forbidden'},403);
  const token=reactionToken(request);if(token)await db().prepare('DELETE FROM place_reports WHERE actor=?').bind(await anonymousHash(token)).run();
  return reply({ok:true});
 }catch{return reply({error:'Unavailable'},503);}
}
