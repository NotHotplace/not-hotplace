import ExternalReviewMemo from '../../../external-review-memo';
import RestEvidence from '../../../rest-evidence';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {findGuide,guidePlaces,guides} from '@/lib/guides';
import {catalog} from '@/lib/catalog';
import {SITE_URL} from '@/lib/seo';
import SeoLinks from '@/components/seo-links';
import {placePath} from '@/lib/place-pages';
import {placeDescription} from '@/lib/place-copy';
import {privateBookingFacts} from '@/lib/place-themes';
import {trips} from '@/lib/trips';
import english from '@/lib/en.json';
import PlaceSummary from '@/app/place-summary';
import GuideLinks from '@/app/guide-links';
import {LanguageProvider} from '@/app/locale';
import GuideEngagement from '@/app/guides/guide-engagement';

type Props={params:Promise<{slug:string;language:string}>};
function resolve(slug:string,language:string){const guide=findGuide(slug);if(!guide||!['ko','en'].includes(language))return null;return {guide,language:language as 'ko'|'en'};}
export async function generateMetadata({params}:Props):Promise<Metadata>{const p=await params,item=resolve(p.slug,p.language);if(!item)return {robots:{index:false,follow:false}};const {guide,language}=item,ko=language==='ko',title=ko?guide.titleKo:guide.titleEn,description=ko?guide.descriptionKo:guide.descriptionEn,path=`/guides/${guide.slug}/${language}`;
 return {title:`${title} | NotHotplace`,description,openGraph:{title,description,url:SITE_URL+path,locale:ko?'ko_KR':'en_US'},twitter:{title,description}};
}
export function generateStaticParams(){return guides.flatMap(guide=>['ko','en'].map(language=>({slug:guide.slug,language})));}
export default async function GuidePage({params}:Props){const p=await params,item=resolve(p.slug,p.language);if(!item)notFound();const {guide,language}=item,ko=language==='ko',places=guidePlaces(guide,catalog),label=(kr:string,en:string)=>ko?kr:en;
 const translate=(value:string)=>ko?value:(english as Record<string,string>)[value]||value;
 const title=ko?guide.titleKo:guide.titleEn,description=ko?guide.descriptionKo:guide.descriptionEn;
 const jsonLd={'@context':'https://schema.org','@type':'CollectionPage',name:title,description,url:`${SITE_URL}/guides/${guide.slug}/${language}`,inLanguage:language,mainEntity:{'@type':'ItemList',itemListElement:places.map((place,index)=>({'@type':'ListItem',position:index+1,url:SITE_URL+placePath(place.id,language),name:place.name,description:placeDescription(place,language)}))}};
 return <LanguageProvider initialLanguage={language}><SeoLinks canonical={`${SITE_URL}/guides/${guide.slug}/${language}`} languages={{ko:`${SITE_URL}/guides/${guide.slug}/ko`,en:`${SITE_URL}/guides/${guide.slug}/en`,'x-default':`${SITE_URL}/guides/${guide.slug}/en`}}/><main className="guide-page"><GuideEngagement country={guide.country}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/>
  <header className="guide-nav"><a className="brand" href={`/?lang=${language}`}>Not<span>_</span>Hotplace</a><a href={`/guides/${guide.slug}/${ko?'en':'ko'}`}>{ko?'EN':'한국어'}</a></header>
  <nav className="guide-breadcrumb" aria-label={label('현재 위치','Breadcrumb')}><a href={`/guides?lang=${language}`}>{label('휴식 가이드','Pause guides')}</a><span>/</span><span>{title}</span></nav>
  <div className="guide-heading"><span className="world-kicker">MAKE ROOM FOR A SLOWER DAY.</span><h1>{title}</h1><p>{description}</p><a className="place-primary" href={`/${guide.country.toLowerCase()}?lang=${language}`}>{label('지도에서 더 찾아보기','Explore more on the map')}</a></div>
  {guide.countryGroup&&<nav className="continent-filters" aria-label={label('나라별로 살펴보기','Browse countries')}>{guide.countryGroup.map(c=><a className="place-secondary" href={'/'+c.toLowerCase()+'?lang='+language} key={c}>{c}</a>)}</nav>}
  <section className="guide-checks"><h2>{label('방문 전에 확인할 세 가지','Three things to check')}</h2><ol>{(ko?guide.checksKo:guide.checksEn).map(check=><li key={check}>{check}</li>)}</ol></section>
  {guide.kind==='temple'?<section className="guide-grid">{trips.filter(trip=>trip.theme==='temple').map(trip=><article key={trip.id} className="guide-card"><span className="finder-area">{translate(trip.duration)}</span><h2>{translate(trip.title)}</h2><p>{translate(trip.description)}</p><ol>{trip.steps.map(step=><li key={step}>{translate(step)}</li>)}</ol><p className="guide-source">{translate(trip.tip)}</p><a className="place-secondary" href="https://www.templestay.com/" target="_blank" rel="noopener noreferrer">{label('공식 프로그램과 예약 확인','Official programs and booking')}</a></article>)}</section>:<section className="guide-grid">{places.map(place=><article className="guide-card" key={place.id}>{place.image&&<a href={placePath(place.id,language)}><img src={place.image} alt={place.name} loading="lazy"/></a>}<span className="finder-area">{place.area}</span><h2><a href={placePath(place.id,language)}>{place.name}</a></h2><PlaceSummary place={place} language={language}/>{guide.kind==='intent'&&<ExternalReviewMemo place={place} language={language}/>}{guide.condition&&<RestEvidence place={place} language={language}/>}{place.experiences?.slice(0,1).map(experience=><dl key={experience.kind} className="private-booking-facts">{privateBookingFacts(experience,language).map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>)}<a className="place-secondary" href={placePath(place.id,language)}>{label('사진·이용 조건·후기 보기','Photos, conditions and reviews')}</a><p className="guide-source">{label('정보 확인','Source checked')}: {place.checked} · <a href={place.source} target="_blank" rel="noopener noreferrer">{label('정보 출처','Information source')}</a></p></article>)}</section>}
  <p className="guide-source">{label('공개 자료로 살펴본 탐색 후보입니다. 실제 방문 검증이나 실시간 혼잡도 확인을 뜻하지 않아요. 이용 조건은 방문일에 다시 확인하세요.','These are discovery candidates based on published information. They are not visit-verified or live crowd measurements. Recheck conditions for your visit.')}</p>
  <section className="guide-related"><h2>{label('다른 쉼도 찾아보세요','Find another kind of pause')}</h2><GuideLinks language={language}/></section><footer className="rest-footer"><a href={`/privacy?lang=${language}`}>{label('개인정보처리방침','Privacy')}</a></footer>
 </main></LanguageProvider>;
}
