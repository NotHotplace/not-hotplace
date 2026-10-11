'use client';
import {placeArea} from '@/lib/place-area';
import {useEffect,useState,useRef} from 'react';
import PlaceReasons from './place-reasons';
import PhotoCredit from './photo-credit';
import {candidateReasons,conciseText,placeIdentity} from '@/lib/place-presentation';
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
export default function HomeFinder({country,initialRegion='전국',initialPurpose='all',ready=false,homeTheme='all',onRegionChange,onPurposeChange}:{country:CountryCode;initialRegion?:string;initialPurpose?:HomePurpose;ready?:boolean;homeTheme?:string;onRegionChange?:(region:string)=>void;onPurposeChange?:(purpose:HomePurpose)=>void}){
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
 return <section className={'home-finder'+(evidenceShortlist?' home-evidence-shortlist':'')} id="home-finder"><div className="home-finder-title"><h2>{text('What kind of pause?','어떤 쉼이 필요한가요?')}</h2></div><div className="home-finder-controls"><label>{text('Your pause','쉬는 방식')}<select id="home-pause-choice" value={purpose} onChange={e=>setPurpose(e.target.value as RestPreferences['purpose'])}>{purposes.map(([id,kr,en])=><option key={id} value={id}>{lang==='ko'?kr:en}</option>)}</select></label><label>{text('Region · optional','지역 · 선택 사항')}<select aria-label={text('Region in '+countries[country].nameEn,countries[country].nameKo+'의 지역')} value={region==='전국'||(countries[country].regions as readonly string[]).includes(region)?region:'전국'} onChange={e=>setRegion(e.target.value)}><option value="전국">{text('All regions','전체 지역')}</option>{countries[country].regions.map(r=><option key={r} value={r}>{t(r)}</option>)}</select></label></div>
 <div className="home-recommendations-title"><h2>{text('Recommended places','추천 장소')}</h2><a href={'/'+countries[country].slug+'?lang='+lang}>{text('Browse all '+countries[country].nameEn+' places',countries[country].nameKo+'의 전체 후보 보기')}<span aria-hidden="true"> ↗</span></a></div>
 <p className="finder-note">{evidenceShortlist?text('Up to three candidates with reasons for your pause. Published information does not guarantee quietness.','선택한 쉼의 근거가 있는 후보를 최대 세 곳 골라요. 공개 안내가 조용함을 보장하지는 않아요.'):text('Candidates based on published information. Visit feedback is shown when sufficient.','공개 안내로 고른 후보예요. 방문 후기가 충분하면 함께 반영합니다.')}{state==='fallback'&&text(' Live feedback could not load.',' 최신 후기를 불러오지 못해 공개 자료로 표시합니다.')}</p><div className="home-finder-grid">{rows.map(match=>{const {place,reviewed,reason}=match;return <article key={place.id} className={place.image?undefined:'home-card-no-photo'}><a href={isCatalogPlace(place.id)?placePathWithReturn(place.id,lang,homeReturnPath(lang,country,region,purpose,homeTheme)):sharePlacePath(place,lang)} onClick={()=>trackEngagement('recommendation_open',country)}>{place.image&&<img src={place.image} alt="" loading="lazy" width="480" height="280"/>}<div><small>{placeArea(place.area,lang)} · {reviewed?text('Visitor feedback available','방문 후기 근거'):text('Published-information candidate','공개 안내 후보')}</small><h3>{place.name}</h3><p>{cardIntroduction(match,lang,evidenceShortlist)}</p><strong>{text('Photos and visit details','사진·방문 정보 보기')}<span aria-hidden="true">↗</span></strong></div></a><details className="home-card-evidence"><summary>{text('Sources and visit notes','출처·방문 조건')}</summary>{(reason||!reviewed||!evidenceShortlist)&&<PlaceReasons place={place} language={lang} selectedReason={reason} compact/>}{reviewed&&evidenceShortlist&&<p>{text(`Recent visitor feedback: ${place.count} responses, ${place.quiet} reported quietness and ${place.positive} were satisfied.`,`최근 방문 후기 ${place.count}명 · 조용함 ${place.quiet}명 · 만족 ${place.positive}명`)}</p>}{place.image&&<PhotoCredit place={place} language={lang}/>}</details></article>;})}</div>{evidenceShortlist&&rows.length>0&&rows.length<3&&(state==='ready'||state==='fallback')&&<p className="finder-note">{text(`Only ${rows.length} supported ${rows.length===1?'candidate':'candidates'} for these choices so far. Browse all places for more options.`,`이 조건에서 근거를 확인한 후보는 ${rows.length}곳이에요. 더 많은 장소는 전체 후보에서 볼 수 있어요.`)}</p>}{state==='loading'&&<p role="status">{text('Finding candidates with supporting information…','근거가 있는 후보를 찾고 있어요…')}</p>}{state==='error'&&<p role="status">{text('Unable to load candidates. Please try again.','후보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')}</p>}{!rows.length&&(state==='ready'||state==='fallback')&&<p role="status">{text('No candidates match this region and purpose yet. Try a different pause or region.','이 지역과 쉼 방식에 맞는 후보를 아직 모으지 못했어요. 다른 쉼이나 지역을 골라보세요.')}</p>}</section>;
}
