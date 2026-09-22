import GlobeHome from './globe';
import {SITE_URL,SITE_DESCRIPTION} from '@/lib/seo';
export const metadata={alternates:{canonical:SITE_URL}};
export default function Home(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'NotHotplace',alternateName:['Not_Hotplace','낫핫플레이스'],url:SITE_URL,description:SITE_DESCRIPTION,inLanguage:['en','ko']})}}/><GlobeHome/></>;}
