import {notFound} from 'next/navigation';
import Explorer from '../explorer';
import {LanguageProvider} from '../locale';
import {countryCodes,countries} from '@/lib/countries';
import {getSiteUser} from '@/lib/site-auth';
import {countryMetadata} from '@/lib/country-metadata';

type Props={params:Promise<{country:string}>;searchParams:Promise<{lang?:string}>};
const codeForSlug=(slug:string)=>countryCodes.find(c=>countries[c].slug===slug);
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props){
 const {country}=await params,code=codeForSlug(country);
 if(!code)return {title:'NotHotplace',robots:{index:false}};
 return countryMetadata(code);
}
export default async function CountryPage({params,searchParams}:Props){
 const [{country},query,user]=await Promise.all([params,searchParams,getSiteUser()]);
 const code=codeForSlug(country);if(!code)notFound();
 return <LanguageProvider initialLanguage={query.lang==='ko'?'ko':'en'}><Explorer country={code} signedIn={!!user} signInPath="/login"/></LanguageProvider>;
}
