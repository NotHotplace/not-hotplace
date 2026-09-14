import Explorer from './explorer';
import {getSiteUser} from '@/lib/site-auth';
import {SITE_URL,SITE_DESCRIPTION} from '@/lib/seo';
export const metadata={alternates:{canonical:SITE_URL}};
export const dynamic='force-dynamic';
export default async function Home(){const user=await getSiteUser();return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'NotHotplace',alternateName:['Not_Hotplace','낫핫플레이스'],url:SITE_URL,description:SITE_DESCRIPTION,inLanguage:'ko-KR'})}}/><Explorer signedIn={!!user} signInPath="/login" /></>;}
