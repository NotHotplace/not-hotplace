import {placeArea} from '@/lib/place-area';
import {placePathWithReturn} from '@/lib/place-return';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {findRegionalGuide,regionalPlaces} from '@/lib/regional-guides';
import {paginateRegion,parseRegionPage,regionalEvidence,regionPageNumbers,regionPagePath,type RegionQuery} from '@/lib/regional-browsing';
import {catalog} from '@/lib/catalog';
import {countryPath} from '@/lib/countries';
import {SITE_URL} from '@/lib/seo';
import SeoLinks from '@/components/seo-links';
import {placePath,isPlaceLanguage} from '@/lib/place-pages';
import {placeDescription} from '@/lib/place-copy';
import {conciseText} from '@/lib/place-presentation';
import GuideEngagement from '@/app/guides/guide-engagement';
import PhotoCredit from '@/app/photo-credit';

type Props = {params: Promise<{slug:string;language:string}>; searchParams: Promise<RegionQuery>};
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{
  const [{slug,language},query]=await Promise.all([params,searchParams]);
  const g=findRegionalGuide(slug),page=parseRegionPage(query.page);
  if(!g||!isPlaceLanguage(language)||page===null)return {};
  const ko=language==='ko',name=ko?g.nameKo:g.nameEn;
  const title=(ko?`${name} 카페·정원·산책: 사진과 방문 정보`:`${name} cafés, gardens & walks`)+(page>1?(ko?` · ${page}페이지`:` · Page ${page}`):'')+' | NotHotplace';
  const description=ko?g.introKo:g.introEn;
  return {title,description,openGraph:{title,description,url:SITE_URL+regionPagePath(slug,language,page)}};
}
export default async function Page({params,searchParams}:Props){
  const [{slug,language},paramsQuery]=await Promise.all([params,searchParams]);
  const g=findRegionalGuide(slug),page=parseRegionPage(paramsQuery.page);
  if(!g||!isPlaceLanguage(language)||page===null)notFound();
  const result=paginateRegion(regionalPlaces(g,catalog),page);
  if(!result)notFound();
  const {places,total,totalPages,offset}=result,ko=language==='ko',name=ko?g.nameKo:g.nameEn;
  const query=new URLSearchParams({lang:language,region:g.region,...(g.area?{q:g.area==='New York City'?'':g.area}:{})});
  const path=regionPagePath(slug,language,page),numbers=regionPageNumbers(page,totalPages);
  // Serialize only this page in both HTML and RSC. Global positions preserve list order.
  const structured={'@context':'https://schema.org','@type':'ItemList',name:(ko?`${name}의 쉼 후보`:`Places to pause in ${name}`),numberOfItems:places.length,itemListElement:places.map((p,i)=>({'@type':'ListItem',position:offset+i+1,name:p.name,url:SITE_URL+placePath(p.id,language)}))};
  return <main className="journal-page regional-page" lang={language}>
    <SeoLinks canonical={SITE_URL+path} languages={{ko:SITE_URL+regionPagePath(slug,'ko',page),en:SITE_URL+regionPagePath(slug,'en',page),'x-default':SITE_URL+regionPagePath(slug,'en',page)}} noindex={page>1}/>
    <GuideEngagement country={g.country}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}}/>
    <header><a className="brand" href={'/?lang='+language}>Not<span>_</span>Hotplace</a><a href={regionPagePath(slug,ko?'en':'ko',page)}>{ko?'English':'한국어'}</a></header>
    <span className="place-eyebrow">{g.country} / {total} {ko?'곳의 방문 후보':'PLACES TO EXPLORE'}</span><h1>{ko?`${name}에서, 잠깐의 쉼.`:`A pause in ${name}.`}</h1><p>{ko?g.introKo:g.introEn}</p>
    <section className="regional-checks"><h2>{ko?'방문 전에 확인해요':'Before your visit'}</h2><ul>{(ko?g.notesKo:g.notesEn).map(n=><li key={n}>{n}</li>)}</ul><p>{ko?'사진·관광자료는 공간의 특징을 보여줍니다. 조용함과 혼잡은 실제 방문 시간에 따라 달라져요.':'Photos and source information describe the setting. Quietness and crowds depend on your visiting time.'}</p><a className="place-primary" href={countryPath(g.country)+'?'+query}>{ko?'지역·조건으로 더 찾아보기':'Explore with region and filters'} ↗</a></section>
    <section className="regional-order" aria-labelledby="regional-order-heading"><h2 id="regional-order-heading">{ko?'방문 정보가 있는 곳부터':'More visit information first'}</h2><p>{ko?'출처·확인일이 있는 추천 이유, 방문 정보·공간 조건이 많은 순서예요. 동률은 이름순이며, 사진 유무나 조용함 순위가 아닙니다. 위치·공간 종류만 있는 곳은 기초 정보로 표시해요.':'Ordered by dated, sourced recommendation reasons, then visit details and conditions; ties use name order. Photos do not affect the order, and this is not a quietness ranking. Location-only listings are marked as basic information.'}</p></section>
    <p id="regional-results">{total?(ko?`전체 ${total}곳 중 ${offset+1}–${offset+places.length}곳`:`${offset+1}–${offset+places.length} of ${total} places`):(ko?'아직 이 지역의 후보가 없어요.':'No candidates in this region yet.')}</p>
    <div className="journal-grid">{places.map(p=>{const evidence=regionalEvidence(p),rich=evidence.reasonCount+evidence.detailCount+evidence.conditionCount>0;return <article key={p.id} data-region-place={p.id} id={'region-place-'+p.id}>
      {p.image&&<a href={placePathWithReturn(p.id,language,path+'#region-place-'+p.id)}><img className="regional-photo" src={p.image} alt={p.name} loading="lazy"/></a>}
      <div><small>{placeArea(p.area,language)} · {p.image?(ko?'사진 있음':'Photos available'):(ko?'사진 확인 전':'No photo yet')}</small><h2><a href={placePathWithReturn(p.id,language,path+'#region-place-'+p.id)}>{p.name} ↗</a></h2>
        <p className="regional-evidence">{rich?(ko?`출처 있는 추천 이유 ${evidence.reasonCount} · 방문 정보·조건 ${evidence.detailCount+evidence.conditionCount}`:`Sourced reasons: ${evidence.reasonCount} · Visit details & conditions: ${evidence.detailCount+evidence.conditionCount}`):(ko?'위치·공간 기초 정보 · 방문 조건 확인 전':'Basic location & setting · Visit conditions pending')}</p>
        <p>{conciseText(evidence.reason?(ko?evidence.reason.textKo:evidence.reason.textEn):placeDescription(p,language),ko?140:230)}</p>
        {evidence.detail&&<p className="regional-fact">{ko?evidence.detail.labelKo+': '+evidence.detail.textKo:evidence.detail.labelEn+': '+evidence.detail.textEn}</p>}
        <small>{ko?'자료 확인':'Source checked'} {p.checked} · {ko?'현장 방문 검증 아님':'Not a field visit'}</small>{p.image&&<PhotoCredit place={p} language={language}/>}<div className="quick-footer"><a href={placePathWithReturn(p.id,language,path+'#region-place-'+p.id)+'#reviews'}>{ko?'다녀왔다면 한 번 눌러 후기 남기기':'Visited? Leave one-tap feedback'}</a></div>
      </div></article>;})}</div>
    {totalPages>1&&<nav className="regional-pagination" aria-label={ko?'지역 목록 페이지':'Region list pages'}>
      {page>1?<a rel="prev" href={regionPagePath(slug,language,page-1)}>{ko?'이전':'Previous'}</a>:<span aria-disabled="true">{ko?'이전':'Previous'}</span>}
      {numbers.map((number,index)=><span key={number} className="regional-page-number">{index>0&&number>numbers[index-1]+1&&<span aria-hidden="true">…</span>}<a href={regionPagePath(slug,language,number)} aria-current={number===page?'page':undefined} aria-label={ko?`${number}페이지`:`Page ${number}`}>{number}</a></span>)}
      {page<totalPages?<a rel="next" href={regionPagePath(slug,language,page+1)}>{ko?'다음':'Next'}</a>:<span aria-disabled="true">{ko?'다음':'Next'}</span>}
    </nav>}
    <footer><a href={'/regions?lang='+language}>{ko?'다른 지역 찾아보기':'Browse other regions'} ↗</a></footer>
  </main>;
}
