'use client';
import {placeName} from '@/lib/place-names';
import {placeArea} from '@/lib/place-area';
import {useEffect,useState,useRef,type ReactNode} from 'react';
import PlaceReasons from './place-reasons';
import PhotoCredit from './photo-credit';
import {candidateReasons,conciseText,placeIdentity,essentialDetails} from '@/lib/place-presentation';
import {countries,type CountryCode} from '@/lib/countries';
import type {RestPreferences} from '@/lib/rest-finder';
import type {homeRestMatches} from '@/lib/home-recommendations';
import {homeReturnPath,placePathWithReturn,type HomePurpose} from '@/lib/place-return';
import {sharePlacePath,isCatalogPlace} from '@/lib/place-links';
import {trackEngagement} from '@/lib/engagement-client';
import {useLocale} from './locale';
function cardIntroduction(match:ReturnType<typeof homeRestMatches>[number],language:'ko'|'en',evidenceShortlist:boolean){
 const {place,reviewed}=match;
 const reason=match.reason||((!reviewed||!evidenceShortlist)&&place.recommendationReasons?.length?candidateReasons(place)[0]:undefined);
 const copy=reason?(language==='ko'?reason.textKo:reason.textEn):reviewed&&evidenceShortlist?(language==='ko'
  ?`최근 방문 후기 ${place.count}명 중 ${place.quiet}명이 조용했다고, ${place.positive}명이 만족했다고 답했어요.`
  :`Of ${place.count} recent visitors, ${place.quiet} reported quietness and ${place.positive} were satisfied.`):placeIdentity(place,language);
 return conciseText(copy,language==='ko'?90:150);
}
const purposes=[['all','가볍게 쉬기','A little pause'],['cafe','차 한 잔','Coffee or tea'],['food','식사하며 쉬기','A meal'],['drive','산책·풍경','A walk or a view'],['private-room','일행만의 룸','A private room'],['premium-spa','스파에서 쉬기','A spa visit']] as const;
export default function HomeFinder({country,initialRegion='전국',initialPurpose='all',ready=false,homeTheme='all',onRegionChange,onPurposeChange,children}:{country:CountryCode;children?:ReactNode;initialRegion?:string;initialPurpose?:HomePurpose;ready?:boolean;homeTheme?:string;onRegionChange?:(region:string)=>void;onPurposeChange?:(purpose:HomePurpose)=>void}){
 const {lang,text,t}=useLocale(),[region,setRegion]=useState<string>(initialRegion),[purpose,setPurpose]=useState<RestPreferences['purpose']>(initialPurpose),[rows,setRows]=useState<ReturnType<typeof homeRestMatches>>([]),[state,setState]=useState('loading');
 const evidenceShortlist=country==='KR'&&region==='서울';
 const previousCountry=useRef(country);
 useEffect(()=>{if(previousCountry.current!==country){previousCountry.current=country;setRegion('전국');}},[country]);
 useEffect(()=>{onRegionChange?.(region);onPurposeChange?.(purpose);},[region,purpose,onRegionChange,onPurposeChange]);
 useEffect(()=>{if(!ready||location.pathname!=='/')return;const url=new URL(location.href),next=new URL(homeReturnPath(lang,country,region,purpose,homeTheme),url.origin);history.replaceState(history.state,'',next.pathname+next.search+url.hash);},[ready,lang,country,region,purpose,homeTheme]);
 useEffect(()=>{
  const controller=new AbortController();let live=true;
  const selectedRegion=region==='전국'||(countries[country].regions as readonly string[]).includes(region)?region:'전국';
  const query=new URLSearchParams({country,view:'finder',region:selectedRegion,purpose});
  setState('loading');setRows([]);
  async function load(){
   try{const r=await fetch('/api/data?'+query,{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();const d=await r.json() as {matches:ReturnType<typeof homeRestMatches>};if(live){setRows(d.matches);setState('ready');}}
   catch{if(!live)return;try{const r=await fetch('/api/catalog?'+query,{credentials:'omit',signal:controller.signal});if(!r.ok)throw Error();const d=await r.json() as {matches:ReturnType<typeof homeRestMatches>};if(live){setRows(d.matches);setState('fallback');}}catch{if(live)setState('error');}}
  }
  void load();return()=>{live=false;controller.abort();};
 },[country,region,purpose]);
 const selectedRegion=region==='전국'||(countries[country].regions as readonly string[]).includes(region)?region:'전국';
 const returnPath=homeReturnPath(lang,country,selectedRegion,purpose,homeTheme);
 const placeHref=(place:ReturnType<typeof homeRestMatches>[number]['place'])=>isCatalogPlace(place.id)?placePathWithReturn(place.id,lang,returnPath):sharePlacePath(place,lang);
 // Only promote an eligible result. Never import a Seoul fallback into another scope.
 const lead=(evidenceShortlist&&purpose==='drive'?rows.find(match=>match.place.id==='kr-seoul-seonyudo-park'):undefined)||rows[0];
 const supporting=rows.filter(match=>match!==lead);
 const leadPlace=lead?.place, leadReason=lead?.reason;
 const seonyudo=leadPlace?.id==='kr-seoul-seonyudo-park';
 const facts=leadPlace?essentialDetails(leadPlace).slice(0,2):[];
 const evidence=(match:ReturnType<typeof homeRestMatches>[number])=>{const {place,reviewed,reason}=match;return <>{(reason||!reviewed||!evidenceShortlist)&&<PlaceReasons place={place} language={lang} selectedReason={reason} compact/>}{reviewed&&evidenceShortlist&&<p>{text(`Recent visitor feedback: ${place.count} responses, ${place.quiet} reported quietness and ${place.positive} were satisfied.`,`최근 방문 후기 ${place.count}명 · 조용함 ${place.quiet}명 · 만족 ${place.positive}명`)}</p>}</>;};
 return <section className={'home-finder editorial-finder'+(evidenceShortlist?' home-evidence-shortlist':'')} id="home-finder" aria-labelledby="home-finder-heading">
  <div className="editorial-controls">
   {children}
   <div className="editorial-location"><span className="editorial-step">01 <span>{text('PLACE','장소')}</span></span><div className="editorial-location-values"><span className="editorial-country" aria-label={text('Selected country','현재 선택한 나라')}>{text(countries[country].nameEn,countries[country].nameKo)}</span><span className="editorial-slash" aria-hidden="true">/</span><label><span className="sr-only">{text('Region in '+countries[country].nameEn,countries[country].nameKo+'의 지역')}</span><select id="home-region-choice" value={selectedRegion} onChange={e=>setRegion(e.target.value)}><option value="전국">{text('All regions','전체 지역')}</option>{countries[country].regions.map(r=><option key={r} value={r}>{t(r)}</option>)}</select></label></div></div>
   <label className="editorial-purpose"><span className="editorial-step">02 <span>{text('YOUR PAUSE','하고 싶은 일')}</span></span><select id="home-pause-choice" value={purpose} onChange={e=>setPurpose(e.target.value as RestPreferences['purpose'])}>{purposes.map(([id,kr,en])=><option key={id} value={id}>{lang==='ko'?kr:en}</option>)}</select></label>
  </div>
  <div className="editorial-scope"><h2 id="home-finder-heading">{text(countries[country].nameEn,countries[country].nameKo)} / {selectedRegion==='전국'?text('All regions','전체 지역'):t(selectedRegion)} / {purposes.find(item=>item[0]===purpose)?.[lang==='ko'?1:2]}</h2><a href={'/'+countries[country].slug+'?lang='+lang}>{text('All places · search & map','전체 장소 · 검색·지도')} ↗</a></div>
  {lead&&leadPlace&&<article className={'editorial-feature'+(!leadPlace.image?' editorial-feature-no-photo':'')}>
   <div className="editorial-feature-heading"><span className="editorial-eyebrow">{text('A place for your pause','선택한 쉼을 위한 한 곳')}</span><h1><a href={placeHref(leadPlace)} onClick={()=>trackEngagement('recommendation_open',country)}>{placeName(leadPlace,lang)}</a></h1><p className="editorial-place-line">{t(leadPlace.city||'')} · {placeArea(leadPlace.area,lang)}</p><p className="editorial-deck">{cardIntroduction(lead,lang,evidenceShortlist)}</p></div>
   {leadPlace.image&&<figure className="editorial-feature-photo"><a href={placeHref(leadPlace)} onClick={()=>trackEngagement('recommendation_open',country)} tabIndex={-1} aria-hidden="true"><img src={leadPlace.image} alt="" width="852" height="567" fetchPriority="high" decoding="async"/></a><figcaption><PhotoCredit place={leadPlace} language={lang}/></figcaption></figure>}
   <div className="editorial-feature-info"><dl className="editorial-facts">{facts.map((fact,index)=><div key={fact.labelEn}><dt>{seonyudo?(index===0?text('ENTRY','입장'):text('PARK HOURS','공원 시간')):text(fact.labelEn,fact.labelKo)}</dt><dd>{seonyudo?(index===0?text('Free general entry','일반 입장 무료'):'06:00–24:00'):conciseText(text(fact.textEn,fact.textKo),lang==='ko'?70:115)}</dd></div>)}</dl>
    <div className="editorial-before"><strong>{text('Before you go','가기 전에')}</strong><p>{seonyudo?text('No food allowed. No general on-site parking. Quietness and available shaded seats are not guaranteed.','음식물 반입 금지 · 공원 내 일반 주차 불가. 조용함과 그늘 빈자리는 보장되지 않아요.'):text('Check current opening hours, seat availability and visiting conditions. Published information does not guarantee quietness.','방문일 운영 시간과 빈자리, 이용 조건을 확인하세요. 공개 안내가 조용함을 보장하지는 않아요.')}</p></div>
    <div className="editorial-feature-actions"><a className="editorial-primary" href={placeHref(leadPlace)} onClick={()=>trackEngagement('recommendation_open',country)}>{text('Explore this place','이곳 자세히 보기')} <span aria-hidden="true">↗</span></a>
    <details className="editorial-feature-evidence" key={leadPlace.id}><summary>{text('Sources & visit details','출처·방문 조건')}</summary>{evidence(lead)}{(leadPlace.visitDetails||[]).map(fact=><div className="editorial-source-fact" key={fact.labelEn}><strong>{text(fact.labelEn,fact.labelKo)}</strong><p>{text(fact.textEn,fact.textKo)}</p>{fact.source&&<a href={fact.source} target="_blank" rel="noopener noreferrer">{text('Published source','자료 출처')} ↗</a>}{fact.additionalSources?.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}{fact.checked&&<small>{text('Checked ','자료 확인 ')}{fact.checked}</small>}</div>)}</details></div>
    <p className="editorial-checked">{leadReason?text('Reason checked '+leadReason.checked+' · based on published information','추천 근거 확인 '+leadReason.checked+' · 공개 자료 기준'):lead.reviewed?text('Based on visitor feedback; conditions can change.','방문 후기 기준 · 현장 상황은 달라질 수 있어요.'):text('Based on published information. Check details before visiting.','공개 자료 기준 · 방문 전 상세 정보를 확인하세요.')}</p>
   </div>
  </article>}
  <p className="finder-note">{evidenceShortlist?text('Up to three candidates with reasons for your pause. Published information does not guarantee quietness.','선택한 쉼의 근거가 있는 후보를 최대 세 곳 골라요. 공개 안내가 조용함을 보장하지는 않아요.'):text('Candidates based on published information. Visit feedback is shown when sufficient.','공개 안내로 고른 후보예요. 방문 후기가 충분하면 함께 반영합니다.')}{state==='fallback'&&text(' Live feedback could not load.',' 최신 후기를 불러오지 못해 공개 자료로 표시합니다.')}</p>
  {supporting.length>0&&<details className="editorial-more-candidates" key={country+'/'+selectedRegion+'/'+purpose}><summary>{text('Other places for this pause','이 쉼에 맞는 다른 후보')} <span>({supporting.length})</span></summary><div className="home-finder-grid">{supporting.map(match=>{const {place}=match;return <article key={place.id} className={place.image?undefined:'home-card-no-photo'}><a href={placeHref(place)} onClick={()=>trackEngagement('recommendation_open',country)}>{place.image&&<img src={place.image} alt="" loading="lazy" width="480" height="280"/>}<div><small>{placeArea(place.area,lang)}</small><h3>{placeName(place,lang)}</h3><p>{cardIntroduction(match,lang,evidenceShortlist)}</p><strong>{text('Photos and visit details','사진·방문 정보 보기')}<span aria-hidden="true">↗</span></strong></div></a><details className="home-card-evidence"><summary>{text('Sources and visit notes','출처·방문 조건')}</summary>{evidence(match)}{place.image&&<PhotoCredit place={place} language={lang}/>}</details></article>;})}</div></details>}
  {evidenceShortlist&&rows.length>0&&rows.length<3&&(state==='ready'||state==='fallback')&&<p className="finder-note">{text(`Only ${rows.length} supported ${rows.length===1?'candidate':'candidates'} for these choices so far. Browse all places for more options.`,`이 조건에서 근거를 확인한 후보는 ${rows.length}곳이에요. 더 많은 장소는 전체 후보에서 볼 수 있어요.`)}</p>}
  {state==='loading'&&<div className="editorial-empty" role="status"><h1>{text('A little room to pause.','잠시 쉬어갈 한 곳.')}</h1><p>{text('Finding candidates with supporting information…','근거가 있는 후보를 찾고 있어요…')}</p></div>}
  {state==='error'&&<div className="editorial-empty" role="status"><h1>{text('Let’s try again.','잠시 후 다시 만나요.')}</h1><p>{text('Unable to load candidates. Please try again.','후보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')}</p></div>}
  {!rows.length&&(state==='ready'||state==='fallback')&&<div className="editorial-empty" role="status"><h1>{text('Your next pause, still to find.','다음 쉼을 찾는 중이에요.')}</h1><p>{text('No candidates match this region and purpose yet. Try a different pause or region.','이 지역과 쉼 방식에 맞는 후보를 아직 모으지 못했어요. 다른 쉼이나 지역을 골라보세요.')}</p></div>}
 </section>;
}
