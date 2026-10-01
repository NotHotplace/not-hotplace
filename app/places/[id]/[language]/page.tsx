import {countries} from '@/lib/countries';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ArrowLeft, ArrowUpRight, MapPin, Leaf} from 'lucide-react';
import {SITE_URL} from '@/lib/seo';
import {findCatalogPlace, isPlaceLanguage, mapPath, placeDescription, placePath, relatedPlaces} from '@/lib/place-pages';
import PlaceInteractions from '../../place-interactions';
import PlaceGallery from '../../place-gallery';
import PrivateExperiences from '../../../private-experiences';

type Props = {params: Promise<{id: string; language: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {id, language} = await params;
  const place = findCatalogPlace(id);
  if (!place || !isPlaceLanguage(language)) return {title: 'Place not found | NotHotplace', robots: {index: false}};
  const title = `${place.name} · ${place.area} | NotHotplace`;
  const description = placeDescription(place, language);
  const url = SITE_URL + placePath(id, language);
  return {
    title, description,
    alternates: {canonical: url, languages: {
      en: SITE_URL + placePath(id, 'en'), ko: SITE_URL + placePath(id, 'ko'),
      'x-default': SITE_URL + placePath(id, 'en'),
    }},
    openGraph: {title, description, url, type: 'website', siteName: 'NotHotplace',
      locale: language === 'ko' ? 'ko_KR' : 'en_US',
      images: [{url: place.image || '/og.png', alt: place.name}]},
    twitter: {card: 'summary_large_image', title, description, images: [place.image || '/og.png']},
  };
}

export default async function PlacePage({params}: Props) {
  const {id, language} = await params;
  const place = findCatalogPlace(id);
  if (!place || !isPlaceLanguage(language)) notFound();
  const ko = language === 'ko';
  const label = (en: string, kr: string) => ko ? kr : en;
  const country = countries[place.country||'KR'].slug;
  const category = place.category === 'cafe' ? label('CAFÉ & TEA', '카페 · 찻집')
    : place.category === 'food' ? label('FOOD & A PAUSE', '음식점') : place.category === 'spa' ? label('SPA & WELLNESS', '스파 · 웰니스') : place.category === 'walk' ? label('WALKS & GARDENS', '산책 · 정원') : label('SCENIC STOP', '풍경 · 드라이브');
  const nearby = relatedPlaces(place);
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
  return <main className="place-page" lang={language}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structured).replace(/</g, '\\u003c')}}/>
    <header className="place-topbar">
      <a className="brand" href={`/?lang=${language}`}>Not<span>_</span>Hotplace</a>
      <nav className="place-languages" aria-label="Language / 언어">
        <a href={placePath(id, 'ko')} hrefLang="ko" lang="ko" aria-current={ko ? 'page' : undefined}>한국어</a>
        <a href={placePath(id, 'en')} hrefLang="en" lang="en" aria-current={!ko ? 'page' : undefined}>EN</a>
      </nav>
    </header>
    <a className="place-back" href={`/${country}?lang=${language}&resume=1`}><ArrowLeft size={16}/>{label('Back to the map', '지도로 돌아가기')}</a>
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
            {place.imageNote && <span>{label(place.imageNote, '크기 조정 및 형식 변환 · 화면에 따라 사진 일부가 잘릴 수 있습니다.')}</span>}
          </figcaption>
        </figure> : <div className="place-no-photo"><Leaf size={36}/><p>{label('A place to discover.', '다음 쉼을 발견하는 곳.')}</p><span>{label('A photo of this place has not been added yet.', '아직 등록된 장소 사진이 없어요.')}</span></div>}
        </div>
      <article className="place-story"><section className="place-overview"><span className="place-eyebrow">{label('THE SETTING', '어떤 공간인가요')}</span>
          <h2>{label('Make room for a slower day.', '조금 느린 하루를 위한 공간.')}</h2>
          <p>{placeDescription(place, language)}</p>
          <div className="place-detail-tags">{(ko ? place.tagsKo || place.tags : place.tagsEn || (place.country !== 'KR' ? place.tags : [])).map(tag => <span key={tag}>{tag}</span>)}</div>
        </section>
        <PrivateExperiences experiences={place.experiences} language={language}/>
        {!!place.visitDetails?.length && <section className="place-facts"><h2>{label('Before you go', '방문을 준비해요')}</h2>
          <dl>{place.visitDetails.map(detail => <div key={detail.labelEn}><dt>{label(detail.labelEn, detail.labelKo)}</dt><dd>{label(detail.textEn, detail.textKo)}</dd></div>)}</dl>
        </section>}
        {place.photoGallery && <a className="place-gallery" href={place.photoGallery} target="_blank" rel="noopener noreferrer">{label('More photos on the venue’s website', '공식 홈페이지에서 공간 사진 더 보기')}<ArrowUpRight size={18}/></a>}
        <section className="place-source"><h2>{label('Know before you visit', '방문 전 확인해 주세요')}</h2>
          <p>{label('Source checked: ', '자료 확인일: ')}<time dateTime={place.checked}>{place.checked}</time></p>
          <p>{label('Opening hours, prices and access can change. Check the source before setting out.', '운영 시간·가격·이용 조건은 바뀔 수 있어요. 출발 전 정보 출처에서 최신 안내를 확인해 주세요.')}</p>
          <a href={place.source} target="_blank" rel="noopener noreferrer">{label('View the information source', '장소 정보 출처 보기')}<ArrowUpRight size={16}/></a>
        </section>
      </article>
      <PlaceInteractions id={place.id} name={place.name} language={language} country={place.country || 'KR'} path={placePath(id, language)} mapUrl={mapPath(place)}/>
    </div>
    {nearby.length > 0 && <section className="place-related"><div><span className="place-eyebrow">{label('KEEP EXPLORING', '함께 둘러봐요')}</span><h2>{label('More places in the region', '같은 지역의 다른 장소')}</h2></div>
      <div className="place-related-grid">{nearby.map(other => <a key={other.id} href={placePath(other.id, language)}>
        {other.image ? <img src={other.image} alt="" loading="lazy"/> : <div className="place-related-placeholder"><Leaf size={28}/></div>}
        <div><span>{other.area}</span><h3>{other.name}</h3><ArrowUpRight size={18}/></div>
      </a>)}</div>
    </section>}
    <footer className="place-footer"><span>WE WANT REST.</span><a href={`/privacy?lang=${language}`}>{label('Privacy', '개인정보처리방침')}</a></footer>
  </main>;
}
