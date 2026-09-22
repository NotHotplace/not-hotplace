import {getSiteUser,googleReady} from '@/lib/site-auth';
import {db,allPlaces,isOwner} from '@/lib/store';
import {membershipFor,paymentConfig} from '@/lib/membership';
import {qualityState} from '@/lib/discovery';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const country=new URL(request.url).searchParams.get('country')==='US'?'US':'KR';
 const user=await getSiteUser(),d=db(),cutoff=Date.now()-90*86400000;
 const membership=user?await membershipFor(user.userId):{active:false,trialUsed:false,until:null,kind:'free'};
 const [places,stats,recent,paused,held,own,saves,proposals,admin,buckets]=await Promise.all([
  allPlaces(),d.prepare("SELECT place_id,COUNT(*) count,SUM(satisfied) positive,SUM(CASE WHEN noise='조용함' THEN 1 ELSE 0 END) quiet,MAX(updated_at) latest FROM reviews WHERE updated_at>=? GROUP BY place_id").bind(cutoff).all<any>(),
  d.prepare("SELECT place_id,COUNT(*) n,SUM(CASE WHEN noise='시끄러움' OR crowd='붐빔' THEN 1 ELSE 0 END) bad,COUNT(DISTINCT date(updated_at/1000,'unixepoch')) days,MIN(updated_at) first,MAX(updated_at) last FROM reviews WHERE updated_at>=? GROUP BY place_id").bind(Date.now()-30*86400000).all<any>(),
  d.prepare("SELECT place_id FROM place_moderation WHERE mode='paused'").all<any>(),d.prepare('SELECT place_id FROM place_quality WHERE paused=1').all<any>(),
  user?d.prepare('SELECT * FROM reviews WHERE user_id=?').bind(user.userId).all<any>():null,
  user?d.prepare('SELECT place_id FROM saved WHERE user_id=?').bind(user.userId).all<any>():null,
  user?d.prepare('SELECT id,name,city,status,reason,created_at FROM suggestions WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(user.userId).all<any>():null,
  user?isOwner(user):false,
  membership.active?d.prepare("SELECT place_id,day,time,COUNT(*) n,SUM(CASE WHEN noise='조용함' THEN 1 ELSE 0 END) quiet,SUM(CASE WHEN crowd='여유로움' THEN 1 ELSE 0 END) relaxed FROM reviews WHERE updated_at>=? GROUP BY place_id,day,time").bind(cutoff).all<any>():null,
 ]);
 const map=new Map(stats.results.map(p=>[p.place_id,p])),recentMap=new Map(recent.results.map(p=>[p.place_id,p]));const stopped=new Set([...paused.results,...held.results].map(p=>p.place_id));
 return Response.json({places:places.filter(p=>(p.country||'KR')===country).map(p=>{const quality=stopped.has(p.id)?'resting':qualityState(recentMap.get(p.id)||{n:0,bad:0,days:0,first:null,last:null});return {...p,count:0,positive:0,quiet:0,latest:null,...map.get(p.id),quality,resting:quality==='resting',...(membership.active?{insights:buckets?.results.filter(b=>b.place_id===p.id).map(({place_id,...b})=>b)||[]}:{} )};}),reviews:own?.results||[],saved:saves?.results.filter(s=>places.some(p=>p.id===s.place_id&&(p.country||'KR')===country)).map(p=>p.place_id)||[],suggestions:proposals?.results||[],signedIn:!!user,isOwner:admin,membership,auth:{googleReady:googleReady(),provider:user?.provider||''},paymentsReady:paymentConfig().ready,paymentsTest:paymentConfig().test},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){console.error('data load failed',e);return Response.json({error:'정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'},{status:503});}
}
