import type {CountryCode} from '@/lib/countries';
import {guides} from '@/lib/guides';
export default function GuideLinks({language='ko',country}: {language?:'ko'|'en';country?:CountryCode}) {
 const ko=language==='ko';
 return <nav className="guide-links" aria-label={ko?'목적별 휴식 가이드':'Guides for your pause'}>{guides.filter(guide=>(!country||(guide.country===country||guide.countryGroup?.includes(country)))&&guide.kind!=='photos').map(guide=><a key={guide.slug} href={`/guides/${guide.slug}/${language}`}>{ko?guide.titleKo:guide.titleEn}</a>)}<a href={'/regions?lang='+language}>{ko?'지역별로 찾아보기':'Browse by region'} ↗</a><a href={'/journal?lang='+language}>{ko?'내 쉼 기록':'My rest journal'} ↗</a></nav>;
}
