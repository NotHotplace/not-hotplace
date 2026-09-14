import {db} from '@/lib/store';
import {koreaDay} from '@/lib/traffic';
import {siteOrigin} from '@/lib/site-auth';
export async function POST(request:Request){
 try{
  if(request.headers.get('origin')!==siteOrigin()||request.headers.get('content-type')!=='application/json')return new Response(null,{status:403});
  // This table deliberately has only a calendar day and an aggregate count.
  await db().prepare('INSERT INTO daily_visits(day,views) VALUES(?,1) ON CONFLICT(day) DO UPDATE SET views=views+1').bind(koreaDay()).run();
  return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
 }catch{return new Response(null,{status:503,headers:{'Cache-Control':'no-store'}});}
}
