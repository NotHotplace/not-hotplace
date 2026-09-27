import GlobeHome from './globe';
import {LanguageProvider} from './locale';
import {SITE_URL,SITE_DESCRIPTION} from '@/lib/seo';
export const metadata={alternates:{canonical:SITE_URL}};
export default async function Home({searchParams}:{searchParams:Promise<{lang?:string}>}){const params=await searchParams;return <LanguageProvider initialLanguage={params.lang==='ko'?'ko':'en'}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'NotHotplace',alternateName:['Not_Hotplace','낫핫플레이스'],url:SITE_URL,description:SITE_DESCRIPTION,inLanguage:['en','ko']})}}/><GlobeHome/></LanguageProvider>;}
