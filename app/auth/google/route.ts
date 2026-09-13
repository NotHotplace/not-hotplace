import {authClient,safeNext,siteOrigin} from '@/lib/site-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const client=await authClient();if(!client)return Response.redirect(siteOrigin()+'/login?notice=setup',303);
 const next=safeNext(new URL(request.url).searchParams.get('next'));
 const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:siteOrigin()+'/auth/callback?next='+encodeURIComponent(next),skipBrowserRedirect:true}});
 if(error||!data.url)return Response.redirect(siteOrigin()+'/login?notice=failed',303);
 return Response.redirect(data.url,303);
}
