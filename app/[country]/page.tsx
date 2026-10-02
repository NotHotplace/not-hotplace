import {notFound} from 'next/navigation';
import Explorer from '../explorer';
import {LanguageProvider} from '../locale';
import {countryCodes,countries} from '@/lib/countries';
import {getSiteUser} from '@/lib/site-auth';
import {SITE_URL} from '@/lib/seo';

type Props={params:Promise<{country:string}>;searchParams:Promise<{lang?:string}>};
const codeForSlug=(slug:string)=>countryCodes.find(c=>countries[c].slug===slug);
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props){
 const {country}=await params,code=codeForSlug(country);
 if(!code)return {title:'NotHotplace',robots:{index:false}};
 return {title: `${countries[code].nameKo} · ${countries[code].nameEn} | NotHotplace`,description:`${countries[code].nameKo}의 정원·산책 공간과 방문 정보를 찾아보세요.`,alternates:{canonical:SITE_URL+'/'+country}};
}
export default async function CountryPage({params,searchParams}:Props){
 const [{country},query,user]=await Promise.all([params,searchParams,getSiteUser()]);
 const code=codeForSlug(country);if(!code)notFound();
 return <LanguageProvider initialLanguage={query.lang==='ko'?'ko':'en'}><Explorer country={code} signedIn={!!user} signInPath="/login"/></LanguageProvider>;
}
