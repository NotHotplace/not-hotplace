import {authClient,safeNext,siteOrigin} from '@/lib/site-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const u=new URL(request.url),code=u.searchParams.get('code'),client=await authClient();
 if(code&&client){const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return Response.redirect(siteOrigin()+safeNext(u.searchParams.get('next')),303);}
 return Response.redirect(siteOrigin()+'/login?notice=failed',303);
}
