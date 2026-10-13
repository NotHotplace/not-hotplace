import {countries,type CountryCode} from '@/lib/countries';
import {guides,type Guide} from '@/lib/guides';

// Short display copy only. Guide content and eligibility remain in lib/guides.
const introductions:Record<string,{ko:[string,string,string];en:[string,string,string]}>= {
 'korea-reading-cafes':{ko:['책이 있는 공간','책 읽을 자리를 고를 때','열람 가능한 책과 좌석 이용 조건부터'],en:['BOOKS & SEATS','Choosing a place to read','Reading copies, seating and house rules']},
 'seoul-solo-seating':{ko:['서울 · 혼자 가는 카페','1인석이 안내된 카페','자리 확보와 주문 조건은 따로 확인해요'],en:['SEOUL · SOLO CAFÉ VISITS','Cafés with individual seats','Check availability and ordering conditions']},
};
export default function HomeGuides({language,country}:{language:'ko'|'en';country:CountryCode}){
 const ko=language==='ko';
 const eligible=guides.filter(guide=>(guide.country===country||guide.countryGroup?.includes(country))&&guide.kind!=='photos');
 const preferred=country==='KR'?['korea-reading-cafes','seoul-solo-seating']:[];
 const ordered=[...preferred.flatMap(slug=>eligible.filter(guide=>guide.slug===slug)),...eligible.filter(guide=>!preferred.includes(guide.slug))];
 function row(guide:Guide,index:number){
  const short=introductions[guide.slug]?.[language],scope=ko?(guide.scopeKo||countries[guide.country].nameKo):(guide.scopeEn||countries[guide.country].nameEn);
  return <a key={guide.slug} className="editorial-guide-row" href={`/guides/${guide.slug}/${language}`}><span className="editorial-guide-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><span><small>{short?.[0]||scope}</small><strong>{short?.[1]||(ko?guide.titleKo:guide.titleEn)}</strong><span>{short?.[2]||(ko?guide.checksKo[0]:guide.checksEn[0])}</span></span><span className="editorial-arrow" aria-hidden="true">↗</span></a>;
 }
 return <section className="editorial-guides" id="home-guides" aria-labelledby="home-guides-title"><div className="editorial-section-heading"><div><span className="editorial-kicker">{ko?'다음 쉼을 위한 안내':'THE SHORTLIST'}</span><h2 id="home-guides-title">{ko?'다음에는 이런 곳으로':'For a different kind of day'}</h2></div><span>{ko?countries[country].nameKo+' 가이드':countries[country].nameEn+' guides'}</span></div><nav className="editorial-guide-list" aria-label={ko?'대표 가이드':'Featured guides'}>{ordered.slice(0,2).map(row)}</nav>{ordered.length>2&&<details className="editorial-more-guides" key={country}><summary>{ko?'가이드 더 보기':'More guides'} <span>({ordered.length-2})</span></summary><nav className="editorial-guide-list" aria-label={ko?'다른 가이드':'More guides'}>{ordered.slice(2).map((guide,index)=>row(guide,index+2))}</nav></details>}<nav className="editorial-guide-tools" aria-label={ko?'더 찾아보기':'Keep exploring'}><a href={'/regions?lang='+language}>{ko?'지역별로 찾아보기':'Browse by region'} ↗</a><a href={'/journal?lang='+language}>{ko?'내 쉼 기록':'My rest journal'} ↗</a><a href={'/guides?lang='+language}>{ko?'전체 가이드':'All guides'} ↗</a></nav></section>;
}
