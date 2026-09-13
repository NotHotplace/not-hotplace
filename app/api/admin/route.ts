import {getSiteUser} from '@/lib/site-auth';
import {db,isOwner} from '@/lib/store';
export const dynamic='force-dynamic';
export async function GET(){try{const u=await getSiteUser();if(!u||!await isOwner(u))return Response.json({error:'운영자 전용 페이지입니다.'},{status:403});const r=await db().prepare('SELECT id,name,city,category,address,source,note,status,reason,created_at FROM suggestions ORDER BY created_at DESC LIMIT 200').all();return Response.json({suggestions:r.results},{headers:{'Cache-Control':'private, no-store'}});}catch(e){console.error(e);return Response.json({error:'제안을 불러오지 못했어요.'},{status:503});}}
