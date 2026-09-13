import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
import {env} from 'cloudflare:workers';
import {getChatGPTUser,type ChatGPTUser} from '@/app/chatgpt-auth';
import {verifiedGoogleIdentity} from './google-identity';
export const launchEnv=()=>env as unknown as Record<string,string|undefined>;
export function googleReady(){const e=launchEnv();return !!(e.SUPABASE_URL&&e.SUPABASE_PUBLISHABLE_KEY);}
export function chatGPTReady(){return false;}
export function safeNext(value:string|null){if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/';const u=new URL(value,'https://app.invalid');return u.origin==='https://app.invalid'&&!u.pathname.startsWith('/auth/')?u.pathname+u.search+u.hash:'/';}
export function siteOrigin(){const value=launchEnv().SITE_URL;if(!value)throw new Error('SITE_URL must be configured for this deployment');const u=new URL(value);if(u.protocol!=='https:')throw new Error('HTTPS site origin required');return u.origin;}
export async function authClient(){
 if(!googleReady())return null;const e=launchEnv(),jar=await cookies();
 return createServerClient(e.SUPABASE_URL!,e.SUPABASE_PUBLISHABLE_KEY!,{cookieOptions:{secure:true,sameSite:'lax',httpOnly:true,path:'/'},cookies:{getAll(){return jar.getAll();},setAll(values){for(const {name,value,options} of values){try{jar.set(name,value,options);}catch{/* Server components cannot refresh cookies; API routes and OAuth callback can. */}}}}});
}
export type SiteUser=ChatGPTUser&{provider:'google'|'chatgpt';googleEmailVerified?:boolean};
export async function getSiteUser():Promise<SiteUser|null>{
 const client=await authClient();if(client){const {data:{user},error}=await client.auth.getUser();if(!error&&user){const verified=verifiedGoogleIdentity(user);if(verified)return verified;}}
 if(!chatGPTReady())return null;
 const user=await getChatGPTUser();return user?{...user,provider:'chatgpt'}:null;
}
