'use client';
import {countries,countryCodes,type CountryCode} from '@/lib/countries';
import {catalog} from '@/lib/catalog';
import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import privateCatalog from '@/lib/private-catalog.json';
import type {Place} from '@/lib/catalog';
import {matchesPlaceTheme, type PlaceTheme} from '@/lib/place-themes';
import {useLocale} from './locale';
import ThemePicker from './theme-picker';
import PlaceSummary from './place-summary';

export default function HomeThemes({country, onCountryChange}: {country: CountryCode; onCountryChange: (country: CountryCode) => void}) {
  const {lang, text} = useLocale();
  const [theme, setTheme] = useState<PlaceTheme>('all');
  const places = (country==='JP'?catalog:privateCatalog as Place[]).filter(place => place.country === country && matchesPlaceTheme(place, theme));
  const explore = '/' + country.toLowerCase() + '?' + new URLSearchParams({lang, ...(theme === 'all' ? {} : {theme})});
  return <section className="home-themes" aria-labelledby="home-themes-heading">
    <div className="home-themes-heading"><div><span className="world-kicker">ROOM TO YOURSELF.</span><h2 id="home-themes-heading">{text('A little space of your own.', '오늘은, 이런 쉼.')}</h2></div>
      <div className="home-country-picker" role="group" aria-label={text('Preview country', '미리 볼 국가')}>{countryCodes.map(value => <button key={value} type="button" aria-pressed={country === value} onClick={() => onCountryChange(value)}>{text(countries[value].nameEn,countries[value].nameKo)}</button>)}</div>
    </div>
    <ThemePicker value={theme} onChange={setTheme} language={lang}/>
    <div className="home-space-grid" aria-live="polite">{places.slice(0,4).map(place => <article className="home-space-card" key={place.id}>
      <span className="home-space-meta">{country === 'KR' ? text('Seoul', place.area) : place.area}</span>
      <h3><a href={'/places/' + encodeURIComponent(place.id) + '/' + lang}>{place.name}<ArrowUpRight size={20}/></a></h3>
      <PlaceSummary place={place} language={lang}/>
      <a className="home-space-details" href={'/places/' + encodeURIComponent(place.id) + '/' + lang}>{text('Details & visitor reviews', '상세 정보와 방문 후기')}<ArrowUpRight size={16}/></a>
    </article>)}{!places.length && <p className="home-space-empty">{text('No verified spaces in this theme yet. Try another theme or explore all places.', '이 테마에서 아직 확인한 공간이 없어요. 다른 테마나 전체 장소를 둘러보세요.')}</p>}</div>
    <div className="home-themes-footer"><p>{text('Private space and quietness are different. Check room conditions before booking.', '프라이빗 공간과 조용함은 별도로 확인해요. 예약 전 룸 이용 조건을 살펴보세요.')}</p><a href={explore}>{text('Explore this country', '이 나라에서 더 찾아보기')}<ArrowUpRight size={17}/></a></div>
  </section>;
}
