import {readHomeChoices} from '@/lib/place-return';
import GlobeHome from './globe';
import {LanguageProvider} from './locale';
import {SITE_URL,SITE_DESCRIPTION} from '@/lib/seo';
export const metadata={alternates:{canonical:SITE_URL}};
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams,choices=readHomeChoices(new URLSearchParams(Object.entries(params).filter((entry):entry is [string,string]=>typeof entry[1]==='string')));return <LanguageProvider initialLanguage={params.lang==='ko'?'ko':'en'}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'NotHotplace',alternateName:['Not_Hotplace','낫핫플레이스'],url:SITE_URL,description:SITE_DESCRIPTION,inLanguage:['en','ko']})}}/><GlobeHome initialChoices={choices}/></LanguageProvider>;}
