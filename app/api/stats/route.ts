import {getSiteUser} from '@/lib/site-auth';
import {isOwner} from '@/lib/store';
import {trafficSummary} from '@/lib/traffic';
export const dynamic='force-dynamic';
export async function GET(){
 try{const user=await getSiteUser();if(!user||!await isOwner(user))return Response.json({error:'운영자 전용입니다.'},{status:403});
 return Response.json(await trafficSummary(),{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'이용 통계를 불러오지 못했어요.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
