'use client';
import {useState} from 'react';
import {Search,ArrowUpRight} from 'lucide-react';
import {countries,countryCodes} from '@/lib/countries';
import directory from '@/lib/catalog-directory.json';
import {useLocale} from './locale';
import {matchesSearchText} from '@/lib/place-search';
const continents=[['all','전체','All'],['Europe','유럽','Europe'],['Central Asia','중앙아시아','Central Asia'],['Asia','아시아','Asia'],['North America','북미','North America'],['Oceania','오세아니아','Oceania'],['Africa','아프리카','Africa']];
export default function CountryDirectory(){
 const {lang,text,t}=useLocale(),[term,setTerm]=useState(''),[continent,setContinent]=useState('all');
 const codes=countryCodes.filter(c=>{const x=countries[c];return (continent==='all'||x.continent===continent)&&matchesSearchText([x.nameKo,x.nameEn,c,...x.regions],term);});
 return <section className="country-directory" id="countries"><div className="country-directory-heading"><div><span className="world-kicker">A PAUSE, ANYWHERE.</span><h2>{text('Choose your next place to pause.','세계 어디에서 쉬어갈까요?')}</h2><p>{text(`${countryCodes.length} countries · published place information`,`${countryCodes.length}개국 · 공개 자료로 살펴보는 공간`)}</p></div><label className="country-search"><Search size={18}/><input value={term} onChange={e=>setTerm(e.target.value)} aria-label={text('Search countries or cities','나라·도시 검색')} placeholder={text('Country or city','나라 또는 도시')}/></label></div>
 <div className="continent-filters" role="group" aria-label={text('Continents','대륙 선택')}>{continents.map(([id,kr,en])=><button type="button" key={id} aria-pressed={continent===id} onClick={()=>setContinent(id)}>{lang==='ko'?kr:en}</button>)}</div>
 <div className="country-directory-grid">{codes.map(c=>{const x=countries[c],cities=directory[c].cities;return <a key={c} href={'/'+x.slug+'?lang='+lang}><span className="country-code">{c}</span><span><strong>{lang==='ko'?x.nameKo:x.nameEn}</strong><small>{cities.slice(0,3).map(t).join(' · ')}</small></span><span className="country-place-count">{directory[c].count}<small>{text(' places','곳')}</small><ArrowUpRight size={15}/></span></a>;})}</div>
 {!codes.length&&<p role="status">{text('No countries match. Try a different search.','검색에 맞는 나라가 없어요. 다른 이름으로 찾아보세요.')}</p>}
 </section>;
}
