import {db,hasPlace} from '@/lib/store';
import {contributionSchema} from '@/lib/place-contributions';
import {reactionToken,reactionCookie,validSiteOrigin,anonymousHash,allowedAnonymous} from '@/lib/anonymous-actor';
import {koreaDay} from '@/lib/traffic';
const reply=(body:unknown,status=200,cookie?:string)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store',...(cookie?{'Set-Cookie':reactionCookie(cookie)}:{})}});
export async function POST(request:Request){try{
 if(!validSiteOrigin(request))return reply({error:'Forbidden'},403);
 if(request.headers.get('content-type')!=='application/json')return reply({error:'JSON required'},415);
 const raw=await request.text();if(raw.length>3500)return reply({error:'Too large'},413);
 const parsed=contributionSchema.safeParse(JSON.parse(raw));if(!parsed.success)return reply({error:'Invalid contribution'},400);
 const p=parsed.data;if(!await hasPlace(p.placeId))return reply({error:'Unknown place'},404);
 const prior=reactionToken(request),token=prior||crypto.randomUUID(),actor=await anonymousHash(token),ip=request.headers.get('cf-connecting-ip');
 if(ip&&!await allowedAnonymous(await anonymousHash('contribution-ip:'+koreaDay()+':'+ip),30))return reply({error:'Daily limit reached'},429);
 if(!await allowedAnonymous('contribution:'+actor,5))return reply({error:'Daily limit reached'},429);
 const now=Date.now(),d=db();
 // URLs are stored for private operator review. Neither URL is fetched or auto-published.
 await d.prepare("INSERT INTO place_contributions(id,actor,place_id,note,source_url,photo_url,rights_consent,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'pending',?,?)").bind(crypto.randomUUID(),actor,p.placeId,p.note,p.sourceUrl,p.photoUrl,p.rightsConsent?1:0,now,now).run();
 await d.prepare('DELETE FROM place_contributions WHERE updated_at<?').bind(now-90*86400000).run();
 await d.prepare('DELETE FROM quick_feedback_limits WHERE day<?').bind(koreaDay(now-2*86400000)).run();
 return reply({ok:true,status:'pending'},200,prior?undefined:token);
}catch(e){return reply({error:'Unable to submit'},e instanceof SyntaxError?400:503);}}
export async function DELETE(request:Request){try{
 if(!validSiteOrigin(request))return reply({error:'Forbidden'},403);
 const token=reactionToken(request);if(token)await db().prepare('DELETE FROM place_contributions WHERE actor=?').bind(await anonymousHash(token)).run();
 return reply({ok:true});
}catch{return reply({error:'Unavailable'},503);}}
