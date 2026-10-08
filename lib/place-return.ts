import {findRegionalGuide} from './regional-guides';
import {countries,countryCodes,type CountryCode} from './countries';
import {emptyFilters} from './explore-filters';
import {isPlaceTheme} from './place-themes';
import {placePath,type PlaceLanguage} from './place-links';

export const homePurposes=['all','cafe','food','drive','private-room','premium-spa'] as const;
export type HomePurpose=typeof homePurposes[number];
export function readHomeChoices(query:URLSearchParams){
  const code=query.get('country') as CountryCode;
  const country=countryCodes.includes(code)?code:undefined;
  const region=query.get('region')||'전국';
  const purpose=query.get('purpose') as HomePurpose;
  const theme=query.get('homeTheme');
  return {country,region:country&&(countries[country].regions as readonly string[]).includes(region)?region:'전국',purpose:homePurposes.includes(purpose)?purpose:'all' as HomePurpose,theme:isPlaceTheme(theme)?theme:'all' as const};
}
export function homeReturnPath(language:PlaceLanguage,country:CountryCode,region='전국',purpose:HomePurpose='all',theme='all',section='home-finder'){
  const query=new URLSearchParams({lang:language,country});
  if(region!=='전국')query.set('region',region);
  if(purpose!=='all')query.set('purpose',purpose);
  if(theme!=='all'&&isPlaceTheme(theme))query.set('homeTheme',theme);
  return '/?'+query+'#'+section;
}
const publicKeys=new Set(['lang','country','region','purpose','homeTheme','category','theme','q','view','scope','resume',...Object.keys(emptyFilters),'finderPurpose','finderParty','finderDay','finderTime','finderBudget','finderExpanded']);
// Never accept schemes, protocol-relative URLs, credentials, encoded paths or
// arbitrary same-origin routes. Reconstruct only known browsing destinations.
export function safeReturnTarget(value:unknown):string|null{
  if(typeof value!=='string'||value.length>2048||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u001f\u007f]/.test(value))return null;
  const url=new URL(value,'https://return.invalid');
  if(url.origin!=='https://return.invalid'||/%/.test(url.pathname))return null;
  const region=url.pathname.match(/^\/regions\/([a-z][a-z-]*)\/(ko|en)$/);
  const home=url.pathname==='/',map=countryCodes.some(code=>'/'+countries[code].slug===url.pathname);
  if(!home&&!map&&!region||region&&!findRegionalGuide(region[1]))return null;
  const query=new URLSearchParams();
  if(region){const page=url.searchParams.get('page');if(page!==null&&(!/^[1-9]\d*$/.test(page)||!Number.isSafeInteger(Number(page))))return null;if(page&&page!=='1')query.set('page',page);}
  else for(const [key,val]of url.searchParams){if(publicKeys.has(key)&&val.length<=180&&!query.has(key))query.set(key,val);}
  let hash='';
  if(home&&['#home-finder','#home-themes'].includes(url.hash)||region&&/^#region-place-[a-zA-Z0-9_-]+$/.test(url.hash))hash=url.hash;
  return url.pathname+(query.size?'?'+query:'')+hash;
}
export function localizedReturnTarget(value:unknown,language:PlaceLanguage):string|null{
  const safe=safeReturnTarget(value);if(!safe)return null;
  const url=new URL(safe,'https://return.invalid');
  if(url.pathname.startsWith('/regions/'))url.pathname=url.pathname.replace(/\/(ko|en)$/,'/'+language);
  else url.searchParams.set('lang',language);
  return url.pathname+url.search+url.hash;
}
export function placePathWithReturn(id:string,language:PlaceLanguage,returnTo?:string|null){
  const target=localizedReturnTarget(returnTo,language);
  return placePath(id,language)+(target?'?'+new URLSearchParams({returnTo:target}):'');
}
export function detailReturn(value:unknown,language:PlaceLanguage,country:CountryCode){
  const target=localizedReturnTarget(value,language);
  return {href:target||'/'+countries[country].slug+'?lang='+language,kind:!target?'direct':target.startsWith('/regions/')?'region':target.startsWith('/?')||target==='/'?'home':'map'} as const;
}
