'use client';
import {useEffect,useState} from 'react';
import PlaceReasons from './place-reasons';
import {placeIdentity} from '@/lib/place-presentation';
import {countries,type CountryCode} from '@/lib/countries';
import type {restMatches,RestPreferences} from '@/lib/rest-finder';
import {conditionEvidence} from '@/lib/rest-conditions';
import {placeDescription} from '@/lib/place-copy';
import {sharePlacePath} from '@/lib/place-links';
import {trackEngagement} from '@/lib/engagement-client';
import {useLocale} from './locale';
const purposes=[['all','가볍게 쉬기','A little pause'],['cafe','차 한 잔','Coffee or tea'],['food','식사하며 쉬기','A meal'],['drive','산책·풍경','A walk or a view'],['private-room','일행만의 룸','A private room'],['premium-spa','스파에서 쉬기','A spa visit']] as const;
export default function HomeFinder({country,onCountryChange}:{country:CountryCode;onCountryChange:(c:CountryCode)=>void}){
 const {lang,text,t}=useLocale(),[region,setRegion]=useState<string>(countries[country].defaultRegion),[purpose,setPurpose]=useState<RestPreferences['purpose']>('all'),[rows,setRows]=useState<ReturnType<typeof restMatches>>([]),[state,setState]=useState('loading');
 useEffect(()=>{setRegion(r=>(countries[country].regions as readonly string[]).includes(r)?r:countries[country].defaultRegion);},[country]);
 useEffect(()=>{
  const controller=new AbortController();let live=true;
  const selectedRegion=(countries[country].regions as readonly string[]).includes(region)?region:countries[country].defaultRegion;
  const query=new URLSearchParams({country,view:'finder',region:selectedRegion,purpose});
  setState('loading');setRows([]);
  async function load(){
   try{const r=await fetch('/api/data?'+query,{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();const d=await r.json() as {matches:ReturnType<typeof restMatches>};if(live){setRows(d.matches);setState('ready');}}
   catch{if(!live)return;try{const r=await fetch('/api/catalog?'+query,{credentials:'omit',signal:controller.signal});if(!r.ok)throw Error();const d=await r.json() as {matches:ReturnType<typeof restMatches>};if(live){setRows(d.matches);setState('fallback');}}catch{if(live)setState('error');}}
  }
  void load();return()=>{live=false;controller.abort();};
 },[country,region,purpose]);
 return <section className="home-finder" id="home-finder"><div className="home-finder-title"><span className="world-kicker">YOUR NEXT LITTLE PAUSE.</span><h2>{text('Pick two things. Start with three places.','두 가지만 고르면, 세 곳부터.')}</h2></div><div className="home-finder-controls"><label>{text('Where','어디에서')}<select aria-label={text('Country and region','나라와 지역')} value={country+':'+region} onChange={e=>{const [c,r]=e.target.value.split(':');if(c!==country)onCountryChange(c as CountryCode);setRegion(r);}}>{Object.entries(countries).map(([code,c])=><optgroup key={code} label={lang==='ko'?c.nameKo:c.nameEn}>{c.regions.map(r=><option key={r} value={code+':'+r}>{t(r)}</option>)}</optgroup>)}</select></label><label>{text('Your pause','어떤 쉼이 필요한가요')}<select value={purpose} onChange={e=>setPurpose(e.target.value as RestPreferences['purpose'])}>{purposes.map(([id,kr,en])=><option key={id} value={id}>{lang==='ko'?kr:en}</option>)}</select></label></div>
 <p className="finder-note">{text('Three candidates based on published information. Visit feedback is shown when sufficient.','공개 안내로 고른 후보예요. 방문 후기가 충분하면 함께 반영합니다.')}{state==='fallback'&&text(' Live feedback could not load.',' 최신 후기를 불러오지 못해 공개 자료로 표시합니다.')}</p><div className="home-finder-grid">{rows.map(({place,reviewed})=><article key={place.id}><a href={sharePlacePath(place,lang)} onClick={()=>trackEngagement('recommendation_open',country)}>{place.image&&<img src={place.image} alt="" loading="lazy"/>}<div><small>{t(place.area)} · {reviewed?text('Visitor feedback available','방문 후기 근거'):text('Published-information candidate','공개 안내 후보')}</small><h3>{place.name}</h3><p>{placeIdentity(place,lang)}</p><strong>{text('See photos and visit details','사진·방문 정보 보기')} ↗</strong></div></a><PlaceReasons place={place} language={lang} compact/></article>)}</div>{state==='loading'&&<p role="status">{text('Finding three places…','세 곳을 찾고 있어요…')}</p>}{state==='error'&&<p role="status">{text('Unable to load candidates. Please try again.','후보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')}</p>}{!rows.length&&(state==='ready'||state==='fallback')&&<p role="status">{text('No candidates match this region and purpose yet. Try a different pause or region.','이 지역과 쉼 방식에 맞는 후보를 아직 모으지 못했어요. 다른 쉼이나 지역을 골라보세요.')}</p>}</section>;
}
