import {z} from 'zod';
import {getSiteUser} from '@/lib/site-auth';
import {db,isOwner,allPlaces} from '@/lib/store';
import {validSiteOrigin} from '@/lib/anonymous-actor';
import {validCollection} from '@/lib/community';
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile'),id:z.string().uuid(),status:z.enum(['approved','rejected']),reason:z.string().trim().max(300)}).strict(),
 z.object({action:z.literal('collection'),id:z.string().uuid(),status:z.enum(['approved','rejected']),reason:z.string().trim().max(300)}).strict(),
 z.object({action:z.literal('report'),id:z.string().uuid(),status:z.enum(['resolved','dismissed'])}).strict(),
]);
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export const dynamic='force-dynamic';
export async function GET(){try{
 const u=await getSiteUser();if(!u||!await isOwner(u))return reply({error:'Owner only'},403);
 const d=db();await d.prepare('DELETE FROM place_reports WHERE updated_at<?').bind(Date.now()-90*86400000).run();
 const [profiles,collections,reports]=await Promise.all([
  d.prepare("SELECT id,name,country,region,link,bio,status,consent,reason FROM contributor_profiles WHERE status='pending' AND consent=1 ORDER BY updated_at LIMIT 100").all(),
  d.prepare("SELECT c.id,c.title,c.country,c.region,c.place_ids,c.note,c.status,p.name author,p.status profile_status,p.consent FROM contributor_collections c JOIN contributor_profiles p ON p.user_id=c.user_id WHERE c.status='pending' ORDER BY c.created_at LIMIT 100").all(),
  d.prepare("SELECT id,place_id,kind,note,status,updated_at FROM place_reports WHERE status='pending' ORDER BY updated_at LIMIT 100").all(),
 ]);return reply({profiles:profiles.results,collections:collections.results,reports:reports.results});
}catch{return reply({error:'Unable to load moderation'},503);}}
export async function POST(request:Request){try{
 if(!validSiteOrigin(request))return reply({error:'Forbidden'},403);
 if(request.headers.get('content-type')!=='application/json')return reply({error:'JSON required'},415);
 const u=await getSiteUser();if(!u||!await isOwner(u))return reply({error:'Owner only'},403);
 const raw=await request.text();if(raw.length>1800)return reply({error:'Too large'},413);
 const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return reply({error:'Invalid decision'},400);
 const p=parsed.data,d=db(),now=Date.now();let result;
 if(p.action==='profile')result=await d.prepare("UPDATE contributor_profiles SET status=?,reason=?,updated_at=? WHERE id=? AND status='pending' AND consent=1").bind(p.status,p.reason,now,p.id).run();
 else if(p.action==='collection'){
  const row=await d.prepare("SELECT c.*,p.status profile_status,p.consent FROM contributor_collections c JOIN contributor_profiles p ON p.user_id=c.user_id WHERE c.id=? AND c.status='pending'").bind(p.id).first<any>();
  if(!row)return reply({error:'Already handled'},409);
  if(p.status==='approved'&&(row.profile_status!=='approved'||!row.consent||!validCollection(await allPlaces(),JSON.parse(row.place_ids),row.country,row.region)))return reply({error:'Approve the consenting profile and verify places first'},400);
  result=await d.prepare("UPDATE contributor_collections SET status=?,reason=?,updated_at=? WHERE id=? AND status='pending'").bind(p.status,p.reason,now,p.id).run();
 }else result=await d.prepare("UPDATE place_reports SET status=?,updated_at=? WHERE id=? AND status='pending'").bind(p.status,now,p.id).run();
 return result.meta.changes?reply({ok:true}):reply({error:'Already handled'},409);
}catch(e){return reply({error:'Unable to decide'},e instanceof SyntaxError?400:503);}}
