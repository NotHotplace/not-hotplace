'use client';
import {useEffect,useState} from 'react';
import PlaceReasons from './place-reasons';
import {candidateReasons,conciseText,placeIdentity} from '@/lib/place-presentation';
import {countries,type CountryCode} from '@/lib/countries';
import type {restMatches,RestPreferences} from '@/lib/rest-finder';
import {sharePlacePath} from '@/lib/place-links';
import {trackEngagement} from '@/lib/engagement-client';
import {useLocale} from './locale';
function cardIntroduction(place:Parameters<typeof placeIdentity>[0],language:'ko'|'en'){
 const reason=candidateReasons(place)[0];
 // Prefer a curated, sourced reason; generic operational evidence stays in details.
 const copy=reason&&place.recommendationReasons?.length?(language==='ko'?reason.textKo:reason.textEn):placeIdentity(place,language);
 return conciseText(copy,language==='ko'?90:150);
}
const purposes=[['all','가볍게 쉬기','A little pause'],['cafe','차 한 잔','Coffee or tea'],['food','식사하며 쉬기','A meal'],['drive','산책·풍경','A walk or a view'],['private-room','일행만의 룸','A private room'],['premium-spa','스파에서 쉬기','A spa visit']] as const;
export default function HomeFinder({country}:{country:CountryCode}){
 const {lang,text,t}=useLocale(),[region,setRegion]=useState<string>('전국'),[purpose,setPurpose]=useState<RestPreferences['purpose']>('all'),[rows,setRows]=useState<ReturnType<typeof restMatches>>([]),[state,setState]=useState('loading');
 useEffect(()=>{setRegion('전국');},[country]);
 useEffect(()=>{
  const controller=new AbortController();let live=true;
  const selectedRegion=region==='전국'||(countries[country].regions as readonly string[]).includes(region)?region:'전국';
  const query=new URLSearchParams({country,view:'finder',region:selectedRegion,purpose});
  setState('loading');setRows([]);
  async function load(){
   try{const r=await fetch('/api/data?'+query,{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();const d=await r.json() as {matches:ReturnType<typeof restMatches>};if(live){setRows(d.matches);setState('ready');}}
   catch{if(!live)return;try{const r=await fetch('/api/catalog?'+query,{credentials:'omit',signal:controller.signal});if(!r.ok)throw Error();const d=await r.json() as {matches:ReturnType<typeof restMatches>};if(live){setRows(d.matches);setState('fallback');}}catch{if(live)setState('error');}}
  }
  void load();return()=>{live=false;controller.abort();};
 },[country,region,purpose]);
 return <section className="home-finder" id="home-finder"><div className="home-finder-title"><h2>{text('What kind of pause?','어떤 쉼이 필요한가요?')}</h2></div><div className="home-finder-controls"><label>{text('Your pause','쉬는 방식')}<select id="home-pause-choice" value={purpose} onChange={e=>setPurpose(e.target.value as RestPreferences['purpose'])}>{purposes.map(([id,kr,en])=><option key={id} value={id}>{lang==='ko'?kr:en}</option>)}</select></label><label>{text('Region · optional','지역 · 선택 사항')}<select aria-label={text('Region in '+countries[country].nameEn,countries[country].nameKo+'의 지역')} value={region==='전국'||(countries[country].regions as readonly string[]).includes(region)?region:'전국'} onChange={e=>setRegion(e.target.value)}><option value="전국">{text('All regions','전체 지역')}</option>{countries[country].regions.map(r=><option key={r} value={r}>{t(r)}</option>)}</select></label></div>
 <div className="home-recommendations-title"><h2>{text('Recommended places','추천 장소')}</h2><a href={'/'+countries[country].slug+'?lang='+lang}>{text('Explore '+countries[country].nameEn,countries[country].nameKo+'에서 더 찾아보기')}<span aria-hidden="true"> ↗</span></a></div>
 <p className="finder-note">{text('Three candidates based on published information. Visit feedback is shown when sufficient.','공개 안내로 고른 후보예요. 방문 후기가 충분하면 함께 반영합니다.')}{state==='fallback'&&text(' Live feedback could not load.',' 최신 후기를 불러오지 못해 공개 자료로 표시합니다.')}</p><div className="home-finder-grid">{rows.map(({place,reviewed})=><article key={place.id} className={place.image?undefined:'home-card-no-photo'}><a href={sharePlacePath(place,lang)} onClick={()=>trackEngagement('recommendation_open',country)}>{place.image&&<img src={place.image} alt="" loading="lazy" width="480" height="280"/>}<div><small>{t(place.area)} · {reviewed?text('Visitor feedback available','방문 후기 근거'):text('Published-information candidate','공개 안내 후보')}</small><h3>{place.name}</h3><p>{cardIntroduction(place,lang)}</p><strong>{text('Photos and visit details','사진·방문 정보 보기')}<span aria-hidden="true">↗</span></strong></div></a><details className="home-card-evidence"><summary>{text('Sources and visit notes','출처·방문 조건')}</summary><PlaceReasons place={place} language={lang} compact/></details></article>)}</div>{state==='loading'&&<p role="status">{text('Finding three places…','세 곳을 찾고 있어요…')}</p>}{state==='error'&&<p role="status">{text('Unable to load candidates. Please try again.','후보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')}</p>}{!rows.length&&(state==='ready'||state==='fallback')&&<p role="status">{text('No candidates match this region and purpose yet. Try a different pause or region.','이 지역과 쉼 방식에 맞는 후보를 아직 모으지 못했어요. 다른 쉼이나 지역을 골라보세요.')}</p>}</section>;
}
