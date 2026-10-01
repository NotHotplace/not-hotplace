import {z} from 'zod';
import {getSiteUser} from '@/lib/site-auth';
import {db,allPlaces} from '@/lib/store';
import {validSiteOrigin,allowedAnonymous} from '@/lib/anonymous-actor';
import {publicLink,publicProfile,publicCollection,supportedRegion,validCollection} from '@/lib/community';
const country=z.enum(['KR','US','JP']),region=z.string().trim().min(1).max(40);
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile'),name:z.string().trim().min(2).max(30),country,region,link:publicLink,bio:z.string().trim().max(160),consent:z.literal(true)}).strict(),
 z.object({action:z.literal('withdraw')}).strict(),
 z.object({action:z.literal('deleteProfile')}).strict(),
 z.object({action:z.literal('collection'),title:z.string().trim().min(4).max(70),country,region,placeIds:z.array(z.string().min(1).max(100)).min(2).max(8),note:z.string().trim().min(20).max(600)}).strict(),
 z.object({action:z.literal('cancel'),id:z.string().uuid()}).strict(),
]);
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export const dynamic='force-dynamic';
export async function GET(){try{
 const d=db(),user=await getSiteUser();
 const [profiles,collections,mine,own]=await Promise.all([
  d.prepare("SELECT id,name,country,region,link,bio FROM contributor_profiles WHERE consent=1 AND status='approved' ORDER BY updated_at DESC LIMIT 100").all<any>(),
  d.prepare("SELECT c.*,p.id profile_id,p.name author,p.link FROM contributor_collections c JOIN contributor_profiles p ON p.user_id=c.user_id WHERE c.status='approved' AND p.status='approved' AND p.consent=1 ORDER BY c.updated_at DESC LIMIT 100").all<any>(),
  user?d.prepare('SELECT id,name,country,region,link,bio,consent,status,reason FROM contributor_profiles WHERE user_id=?').bind(user.userId).first<any>():null,
  user?d.prepare('SELECT id,title,country,region,place_ids,note,status,reason FROM contributor_collections WHERE user_id=? ORDER BY updated_at DESC LIMIT 30').bind(user.userId).all<any>():null,
 ]);
 const places=await allPlaces();
 return reply({signedIn:!!user,profiles:profiles.results.map(publicProfile),collections:collections.results.filter(p=>{try{return validCollection(places,JSON.parse(p.place_ids),p.country,p.region);}catch{return false;}}).map(publicCollection),profile:mine,ownCollections:(own?.results||[]).map(p=>({...publicCollection(p),status:p.status,reason:p.reason}))});
}catch{return reply({error:'Unable to load community'},503);}}
export async function POST(request:Request){try{
 if(!validSiteOrigin(request))return reply({error:'Forbidden'},403);
 if(request.headers.get('content-type')!=='application/json')return reply({error:'JSON required'},415);
 const user=await getSiteUser();if(!user)return reply({error:'Sign in required'},401);
 const raw=await request.text();if(raw.length>4000)return reply({error:'Too large'},413);
 const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return reply({error:'Invalid input'},400);
 const p=parsed.data,d=db(),now=Date.now();
 if(p.action==='deleteProfile'){await d.batch([d.prepare('DELETE FROM contributor_collections WHERE user_id=?').bind(user.userId),d.prepare('DELETE FROM contributor_profiles WHERE user_id=?').bind(user.userId)]);return reply({ok:true});}
 if(p.action==='withdraw') {await d.prepare("UPDATE contributor_profiles SET consent=0,status='pending',updated_at=? WHERE user_id=?").bind(now,user.userId).run();return reply({ok:true});}
 if(p.action==='cancel'){await d.prepare('DELETE FROM contributor_collections WHERE id=? AND user_id=?').bind(p.id,user.userId).run();return reply({ok:true});}
 if(!supportedRegion(p.country,p.region))return reply({error:'Unsupported region'},400);
 if(!await allowedAnonymous('community:'+user.userId,10))return reply({error:'Daily limit reached'},429);
 if(p.action==='profile'){
  await d.prepare("INSERT INTO contributor_profiles(user_id,id,name,region,country,link,bio,consent,status,updated_at) VALUES(?,?,?,?,?,?,?,1,'pending',?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,region=excluded.region,country=excluded.country,link=excluded.link,bio=excluded.bio,consent=1,status='pending',reason='',updated_at=excluded.updated_at").bind(user.userId,crypto.randomUUID(),p.name,p.region,p.country,p.link,p.bio,now).run();
  return reply({ok:true,status:'pending'});
 }
 const profile=await d.prepare('SELECT consent FROM contributor_profiles WHERE user_id=?').bind(user.userId).first<any>();
 if(!profile?.consent)return reply({error:'Public profile consent required'},400);
 if(!validCollection(await allPlaces(),p.placeIds,p.country,p.region))return reply({error:'Select 2–8 registered places in this region'},400);
 const count=await d.prepare('SELECT COUNT(*) n FROM contributor_collections WHERE user_id=? AND created_at>?').bind(user.userId,now-86400000).first<any>();
 if(count.n>=3)return reply({error:'Three collections per day'},429);
 await d.prepare("INSERT INTO contributor_collections(id,user_id,title,country,region,place_ids,note,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'pending',?,?)").bind(crypto.randomUUID(),user.userId,p.title,p.country,p.region,JSON.stringify(p.placeIds),p.note,now,now).run();
 return reply({ok:true,status:'pending'});
}catch(e){return reply({error:'Unable to save'},e instanceof SyntaxError?400:503);}}
