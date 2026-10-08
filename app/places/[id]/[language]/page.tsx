import {detailReturn,placePathWithReturn} from '@/lib/place-return';
import PlaceSave from '../../place-save';
import DisclosureNavigation from '../../disclosure-navigation';
import PlaceReasons from '../../../place-reasons';
import {placeIdentity,essentialDetails,conciseText} from '@/lib/place-presentation';
import TrackedMapLink from '../../tracked-map-link';
import PlaceContribution from '../../../place-contribution';
import ExternalReviewMemo from '../../../external-review-memo';
import RestEvidence from '../../../rest-evidence';
import ReportPlace from '../../../report-place';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ArrowLeft, ArrowUpRight, MapPin, Leaf} from 'lucide-react';
import {SITE_URL} from '@/lib/seo';
import SeoLinks from '@/components/seo-links';
import {findCatalogPlace, isPlaceLanguage, mapPath, placeDescription, placePath, relatedPlaces} from '@/lib/place-pages';
import PlaceInteractions from '../../place-interactions';
import PlaceGallery from '../../place-gallery';
import PhotoCredit from '../../../photo-credit';
import PrivateExperiences from '../../../private-experiences';

type Props = {params: Promise<{id: string; language: string}>; searchParams: Promise<{returnTo?:string|string[]}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {id, language} = await params;
  const place = findCatalogPlace(id);
  if (!place || !isPlaceLanguage(language)) return {title: 'Place not found | NotHotplace', robots: {index: false}};
  const title = `${place.name} · ${place.area} | NotHotplace`;
  const description = placeDescription(place, language);
  const url = SITE_URL + placePath(id, language);
  return {
    title, description,
    openGraph: {title, description, url, type: 'website', siteName: 'NotHotplace',
      locale: language === 'ko' ? 'ko_KR' : 'en_US',
      images: [{url: place.image || '/og.png', alt: place.name}]},
    twitter: {card: 'summary_large_image', title, description, images: [place.image || '/og.png']},
  };
}

export default async function PlacePage({params,searchParams}: Props) {
  const {id, language} = await params;
  const place = findCatalogPlace(id);
  if (!place || !isPlaceLanguage(language)) notFound();
  const back=detailReturn((await searchParams)?.returnTo,language,place.country||'KR');
  const returnTo=back.kind==='direct'?null:back.href;
  const ko = language === 'ko';
  const label = (en: string, kr: string) => ko ? kr : en;
  const category = place.category === 'cafe' ? label('CAFÉ & TEA', '카페 · 찻집')
    : place.category === 'food' ? label('FOOD & A PAUSE', '음식점') : place.category === 'spa' ? label('SPA & WELLNESS', '스파 · 웰니스') : place.category === 'walk' ? label('WALKS & GARDENS', '산책 · 정원') : label('SCENIC STOP', '풍경 · 드라이브');
  const nearby = relatedPlaces(place);
  const essentials=essentialDetails(place);
  const photoSource = place.imageSource || place.imageRemote || place.source;
  const license = place.imageLicense === 'Type1' ? label('KOGL Type 1', '공공누리 제1유형') : place.imageLicense;
  const structured = {
    '@context': 'https://schema.org', '@type': 'Place', name: place.name,
    description: placeDescription(place, language), url: SITE_URL + placePath(id, language),
    address: place.address,
    ...(place.image ? {image: new URL(place.image, SITE_URL).href} : {}),
    ...(typeof place.lat === 'number' && typeof place.lon === 'number'
      ? {geo: {'@type': 'GeoCoordinates', latitude: place.lat, longitude: place.lon}} : {}),
  };
  return <main className="place-page photo-led-place" lang={language}><SeoLinks canonical={SITE_URL+placePath(id,language)} languages={{en:SITE_URL+placePath(id,'en'),ko:SITE_URL+placePath(id,'ko'),'x-default':SITE_URL+placePath(id,'en')}} noindex={place.detailLevel==='basic'}/><DisclosureNavigation/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structured).replace(/</g, '\\u003c')}}/>
    <header className="place-topbar">
      <a className="brand" href={`/?lang=${language}`}>Not<span>_</span>Hotplace</a>
      <nav className="place-languages" aria-label="Language / 언어">
        <a href={placePathWithReturn(id, 'ko',returnTo)} hrefLang="ko" lang="ko" aria-current={ko ? 'page' : undefined}>한국어</a>
        <a href={placePathWithReturn(id, 'en',returnTo)} hrefLang="en" lang="en" aria-current={!ko ? 'page' : undefined}>EN</a>
      </nav>
    </header>
    <a className="place-back" href={back.href}><ArrowLeft size={16}/>{back.kind==='home'?label('Back to home recommendations','홈 추천으로 돌아가기'):back.kind==='region'?label('Back to the region list','지역 목록으로 돌아가기'):back.kind==='map'?label('Back to the map','지도로 돌아가기'):label('Explore the map','지도에서 더 찾아보기')}</a>
    <div className="place-heading"><span className="place-eyebrow">{category} <span> / {place.area}</span></span>
      <h1>{place.name}</h1><p><MapPin size={16}/>{place.address}</p>
    </div>
    <div className="place-layout">
      <div className="place-photo-section">
        {place.photos?.length ? <PlaceGallery photos={place.photos} name={place.name} language={language}/> : place.image ? <figure className="place-cover">
          <img src={place.image} alt={place.name} fetchPriority="high"/>
          <figcaption>{place.imageCredit}{license && <> · {place.imageLicenseUrl
            ? <a href={place.imageLicenseUrl} target="_blank" rel="noopener noreferrer">{license}</a> : license}</>}
            {' · '}<a href={photoSource} target="_blank" rel="noopener noreferrer">{label('Photo source', '사진 출처')}</a>
            {place.imageNote && <span>{label(place.imageNote, place.imageNoteKo || '크기 조정 및 형식 변환 · 화면에 따라 사진 일부가 잘릴 수 있습니다.')}</span>}
          </figcaption>
        </figure> : <div className="place-no-photo"><Leaf size={36}/><p>{label('A place to discover.', '다음 쉼을 발견하는 곳.')}</p><span>{label('A photo of this place has not been added yet.', '아직 등록된 장소 사진이 없어요.')}</span></div>}
        </div>
      <section className="place-first-look" aria-label={label('At a glance','한눈에 보기')}><p className="place-identity">{placeIdentity(place,language)}</p><PlaceReasons place={place} language={language}/><dl className="place-essential-facts">{essentials.map(fact=><div key={fact.labelEn}><dt>{ko?fact.labelKo:fact.labelEn}</dt><dd>{conciseText(ko?fact.textKo:fact.textEn,ko?100:180)}</dd></div>)}</dl><p className="place-summary-note">{label('A sourced candidate, not a guarantee of quietness. Full conditions below.','자료로 고른 후보예요. 조용함을 보장하지 않으며 자세한 이용 조건은 아래에서 확인하세요.')}</p></section>
      <PlaceInteractions id={place.id} name={place.name} category={place.category} conditions={place.conditions} language={language} country={place.country || 'KR'} path={placePath(id, language)} mapUrl={mapPath(place)}/>
      <article className="place-story">
        <nav className="place-section-nav" aria-label={label('Place information sections','장소 정보 바로가기')}><a href="#visit-info">{label('Visit details','자세한 방문 정보')}</a><a href="#reviews">{label('Visitor feedback','방문 후기')}</a><a href="#place-source">{label('Sources','출처')}</a></nav>

        <details className="place-disclosure" id="visit-info"><summary>{label('Visit conditions and full information','이용 조건·방문 정보 자세히')}</summary><div className="place-disclosure-body"><p>{placeDescription(place,language)}</p><PrivateExperiences experiences={place.experiences} language={language}/>{!!place.visitDetails?.length&&<dl className="place-full-facts">{place.visitDetails.map(detail=><div key={detail.labelEn}><dt>{label(detail.labelEn,detail.labelKo)}</dt><dd>{label(detail.textEn,detail.textKo)}{detail.source&&<small><a href={detail.source} target="_blank" rel="noopener noreferrer">{label('Source','출처')}</a> · {detail.checked||place.checked}{detail.additionalSources?.map(source=><span key={source.url}> · <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></span>)}</small>}</dd></div>)}</dl>}{place.photoGallery&&<a href={place.photoGallery} target="_blank" rel="noopener noreferrer">{label('More photos from the venue','공식 공간 사진 더 보기')} ↗</a>}</div></details>
        <details className="place-disclosure"><summary>{label('Conditions and external review evidence','공간 조건·외부 후기 근거')}</summary><div className="place-disclosure-body"><RestEvidence place={place} language={language}/><ExternalReviewMemo place={place} language={language}/></div></details>
        <details className="place-disclosure" id="place-source"><summary>{label('Sources and information dates','출처·정보 확인일')}</summary><div className="place-disclosure-body"><p>{label('Source checked: ','자료 확인일: ')}<time dateTime={place.checked}>{place.checked}</time></p><p>{label('Hours, prices and access may change. Confirm with the venue before visiting.','운영 시간·가격·이용 조건은 달라질 수 있어요. 방문 전 운영기관의 최신 안내를 확인해 주세요.')}</p><a href={place.source} target="_blank" rel="noopener noreferrer">{label('Main information source','장소 정보 출처')} ↗</a>{place.locationInfo&&<p>{label('Map reference checked: ','지도 기준점 확인: ')}{place.locationInfo.checked} · <a href={place.locationInfo.source} target="_blank" rel="noopener noreferrer">{label('Location source','위치 출처')}</a><br/>{place.locationInfo.kind==='reference'?label('Reference point near the place; confirm the actual entrance.','장소 주변 기준점입니다. 실제 입구는 출처에서 확인하세요.'):label('Entrance identified by the source.','출처에 안내된 입구 기준입니다.')}</p>}</div></details>
        <details className="place-disclosure"><summary>{label('Suggest an update','정보 수정·제보')}</summary><div className="place-disclosure-body"><ReportPlace id={place.id} language={language}/><PlaceContribution id={place.id} language={language}/></div></details>
      </article>

    </div>
    {nearby.length > 0 && <section className="place-related"><div><span className="place-eyebrow">{label('KEEP EXPLORING', '함께 둘러봐요')}</span><h2>{label('More places in the region', '같은 지역의 다른 장소')}</h2></div>
      <div className="place-related-grid">{nearby.map(other => <article className="place-related-entry" key={other.id}><a href={placePathWithReturn(other.id, language,returnTo)}>
        {other.image ? <img src={other.image} alt="" loading="lazy"/> : <div className="place-related-placeholder"><Leaf size={28}/></div>}
        <div><span>{other.area}</span><h3>{other.name}</h3><ArrowUpRight size={18}/></div>
      </a>{other.image&&<details className="related-photo-credit"><summary>{label('Photo credits','사진 출처·이용 허락')}</summary><PhotoCredit place={other} language={language}/></details>}</article>)}</div>
    </section>}
    <footer className="place-footer"><span>WE WANT REST.</span><a href={`/privacy?lang=${language}`}>{label('Privacy', '개인정보처리방침')}</a></footer>
    <div className="place-sticky-actions"><PlaceSave id={place.id} country={place.country||'KR'} language={language} compact/><TrackedMapLink id={place.id} country={place.country||'KR'} href={mapPath(place)}>{label('Directions','길 찾기')}</TrackedMapLink></div>
  </main>;
}
