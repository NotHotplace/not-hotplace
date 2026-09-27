import Explorer from '../explorer';
import {LanguageProvider} from '../locale';
import {getSiteUser} from '@/lib/site-auth';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string}>}){const [user,params]=await Promise.all([getSiteUser(),searchParams]);return <LanguageProvider initialLanguage={params.lang==='ko'?'ko':'en'}><Explorer country="KR" signedIn={!!user} signInPath="/login"/></LanguageProvider>;}
