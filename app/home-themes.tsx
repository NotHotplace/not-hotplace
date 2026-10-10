'use client';
import {placeArea} from '@/lib/place-area';
import {homeReturnPath,placePathWithReturn,type HomePurpose} from '@/lib/place-return';
import {type CountryCode} from '@/lib/countries';
import type {Place} from '@/lib/catalog';
import {useEffect,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {type PlaceTheme} from '@/lib/place-themes';
import {useLocale} from './locale';
import ThemePicker from './theme-picker';
import PlaceSummary from './place-summary';
import PlaceReasons from './place-reasons';

export default function HomeThemes({country,initialTheme='all',ready=false,homeRegion='전국',homePurpose='all',onThemeChange}: {country: CountryCode;initialTheme?:PlaceTheme;ready?:boolean;homeRegion?:string;homePurpose?:HomePurpose;onThemeChange?:(theme:PlaceTheme)=>void}) {
  const {lang, text,t} = useLocale();
  const [theme, setTheme] = useState<PlaceTheme>(initialTheme);
  const [places,setPlaces]=useState<Place[]>([]),[state,setState]=useState('loading');
  useEffect(()=>{let live=true;const controller=new AbortController();setPlaces([]);setState('loading');
    fetch('/api/catalog?'+new URLSearchParams({country,view:'themes',theme}),{credentials:'omit',signal:controller.signal}).then(async r=>{if(!r.ok)throw Error();return r.json() as Promise<{places:Place[]}>;}).then(d=>{if(live){setPlaces(d.places);setState('ready');}}).catch(()=>{if(live)setState('error');});
    return()=>{live=false;controller.abort();};
  },[country,theme]);
  const returnPath=homeReturnPath(lang,country,homeRegion,homePurpose,theme,'home-themes');
  useEffect(()=>{onThemeChange?.(theme);},[theme,onThemeChange]);
  useEffect(()=>{if(!ready||location.pathname!=='/')return;const url=new URL(location.href);if(theme==='all')url.searchParams.delete('homeTheme');else url.searchParams.set('homeTheme',theme);history.replaceState(history.state,'',url.pathname+url.search+url.hash);},[ready,theme]);
  const explore = '/' + country.toLowerCase() + '?' + new URLSearchParams({lang, ...(theme === 'all' ? {} : {theme})});
  return <section id="home-themes" className="home-themes" aria-labelledby="home-themes-heading">
    <div className="home-themes-heading"><div><span className="world-kicker">ROOM TO YOURSELF.</span><h2 id="home-themes-heading">{text('A little space of your own.', '오늘은, 이런 쉼.')}</h2></div>
    </div>
    <ThemePicker value={theme} onChange={setTheme} language={lang}/>
    {state==='loading'&&<p role="status">{text('Loading places…','장소를 불러오는 중…')}</p>}{state==='error'&&<p role="status">{text('Places could not load. Try exploring this country below.','장소를 불러오지 못했어요. 아래에서 이 나라를 둘러보세요.')}</p>}
    <div className="home-space-grid" aria-live="polite">{places.slice(0,4).map(place => <article className="home-space-card" key={place.id}>{place.image&&<a href={placePathWithReturn(place.id,lang,returnPath)} className="home-space-image"><img src={place.image} alt="" loading="lazy"/></a>}
      <span className="home-space-meta">{t(place.city)} · {placeArea(place.area,lang)}</span>
      <h3><a href={placePathWithReturn(place.id,lang,returnPath)}>{place.name}<ArrowUpRight size={20}/></a></h3>
      <PlaceSummary place={place} language={lang}/><PlaceReasons place={place} language={lang} compact/>
      <a className="home-space-details" href={placePathWithReturn(place.id,lang,returnPath)}>{text('Details & visitor reviews', '상세 정보와 방문 후기')}<ArrowUpRight size={16}/></a>
    </article>)}{!places.length && state==='ready' && <p className="home-space-empty">{text('No verified spaces in this theme yet. Try another theme or explore all places.', '이 테마에서 아직 확인한 공간이 없어요. 다른 테마나 전체 장소를 둘러보세요.')}</p>}</div>
    <div className="home-themes-footer"><p>{text('Private space and quietness are different. Check room conditions before booking.', '프라이빗 공간과 조용함은 별도로 확인해요. 예약 전 룸 이용 조건을 살펴보세요.')}</p><a href={explore}>{text('Explore this country', '이 나라에서 더 찾아보기')}<ArrowUpRight size={17}/></a></div>
  </section>;
}
