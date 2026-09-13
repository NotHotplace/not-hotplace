import {authClient,siteOrigin} from '@/lib/site-auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 const c=await authClient();if(c)await c.auth.signOut({scope:'local'});
 return Response.redirect(siteOrigin()+'/login',303);
}
