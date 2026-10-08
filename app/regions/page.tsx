import {regionalGuides} from '@/lib/regional-guides';
import {catalog} from '@/lib/catalog';
import {regionalPlaces} from '@/lib/regional-guides';
import {SITE_URL} from '@/lib/seo';
export const metadata={title:'지역별 카페·정원·산책 가이드 | NotHotplace',alternates:{canonical:SITE_URL+'/regions'}};
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string}>}){const p=await searchParams,lang=p.lang==='en'?'en':'ko',ko=lang==='ko';return <main className="journal-page"><header><a className="brand" href={'/?lang='+lang}>Not<span>_</span>Hotplace</a><a href={'/guides?lang='+lang}>{ko?'목적별 가이드':'Browse by purpose'} ↗</a></header><span className="place-eyebrow">A SLOWER DAY, SOMEWHERE.</span><h1>{ko?'동네부터 골라볼까요?':'Start with a place.'}</h1><p>{ko?'사진, 방문 준비 정보와 실제 후기를 함께 살펴보고 다음 쉼을 계획하세요.':'Compare photos, visitor information and actual feedback for your next pause.'}</p><div className="journal-grid">{regionalGuides.map(g=><article key={g.slug}><div><small>{g.country} · {regionalPlaces(g,catalog).length} {ko?'곳':'places'}</small><h2><a href={'/regions/'+g.slug+'/'+lang}>{ko?g.nameKo:g.nameEn} ↗</a></h2><p>{ko?g.introKo:g.introEn}</p></div></article>)}</div></main>;}
