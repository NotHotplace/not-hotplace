'use client';
import {useEffect,useState} from 'react';
import {countries,type CountryCode} from '@/lib/countries';
import {loadGeo} from '@/lib/geo-client';
import type {Place} from '@/lib/catalog';
import {useLocale} from './locale';

export default function CountryMap({country,places,city,onEnter}:{country:CountryCode;places:Place[];city:string;onEnter:(c:string)=>void}){
 const {text,t}=useLocale(),[geo,setGeo]=useState<any>(null),[world,setWorld]=useState<any>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let live=true;Promise.all([loadGeo(),fetch('/maps/world.json').then(r=>{if(!r.ok)throw Error();return r.json();})]).then(([g,w])=>{if(live){setGeo(()=>g);setWorld(w);}}).catch(()=>{if(live)setFailed(true);});return()=>{live=false;};},[]);
 const config=countries[country],feature=world?.features.find((f:any)=>f.properties.code===config.iso3);
 const projection=geo&&feature?geo.geoMercator().fitExtent([[28,28],[572,422]],feature):null,path=projection?geo.geoPath(projection):null;
 const known=places.filter(p=>typeof p.lat==='number'&&typeof p.lon==='number'&&Number.isFinite(p.lat)&&Number.isFinite(p.lon));
 return <section className="country-map-panel" aria-label={text('Country outline and cities','국가 지도와 도시')}>
 <div className="country-map-caption"><strong>{text(config.nameEn,config.nameKo)}</strong><span>{text('Choose a city','도시를 골라보세요')}</span></div>
 {feature&&path?<svg viewBox="0 0 600 450" aria-label={text(config.nameEn+' map',config.nameKo+' 지도')} role="img"><path d={path(feature)||''} fill="#183f35" stroke="#97bca3" strokeWidth="1.2"/>{known.map(p=>{const point=projection([p.lon,p.lat]);if(!point||point[0]<20||point[0]>580||point[1]<20||point[1]>430)return null;return <circle key={p.id} cx={point[0]} cy={point[1]} r={city===p.city?4:2.6} fill={city===p.city?'#d1ff73':'#84ae7f'} opacity=".8"><title>{p.name}</title></circle>;})}</svg>:<div className="country-map-fallback"><span>{world?text('Choose a city below. This map does not include an outline for this country.','아래에서 도시를 골라주세요. 이 지도에는 해당 국가의 경계가 포함되지 않았어요.'):failed?text('The map could not load. Choose a city below.','지도를 불러오지 못했어요. 아래에서 도시를 골라주세요.'):text('Loading map…','지도를 불러오는 중…')}</span></div>}
 <div className="country-cities">{config.regions.map(r=><button type="button" key={r} aria-pressed={city===r} onClick={()=>onEnter(r)}>{t(r)}<span>{places.filter(p=>p.city===r||p.states?.includes(r)).length}</span></button>)}</div>
 <p>{text('Only coordinates identified in a published source are shown. City names do not set a place’s location.','출처에서 확인한 장소 좌표만 표시해요. 도시 이름으로 위치를 추정하지 않습니다.')}</p>
 </section>;
}
