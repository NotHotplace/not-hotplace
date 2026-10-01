import {guides} from '@/lib/guides';
export default function GuideLinks({language='ko',country}: {language?:'ko'|'en';country?:'KR'|'US'}) {
 const ko=language==='ko';
 return <nav className="guide-links" aria-label={ko?'목적별 휴식 가이드':'Guides for your pause'}>{guides.filter(guide=>(!country||guide.country===country)&&guide.kind!=='photos').map(guide=><a key={guide.slug} href={`/guides/${guide.slug}/${language}`}>{ko?guide.titleKo:guide.titleEn}</a>)}</nav>;
}
