import type {Place} from '@/lib/catalog';

// The record's latest visit evidence and the linked source have separate dates.
export default function PlaceSourceSummary({place, language}: {place: Place; language: 'ko' | 'en'}) {
  const ko = language === 'ko', checked = place.sourceChecked || place.checked;
  return <p className="guide-source place-source-summary">
    <span>{ko ? '방문 정보 갱신: ' : 'Visit information updated: '}<time dateTime={place.checked}>{place.checked}</time></span><br/>
    <span><a href={place.source} target="_blank" rel="noopener noreferrer">{ko ? '장소 정보 출처' : 'Main information source'}</a>{' · '}{ko ? '이 출처 확인: ' : 'This source checked: '}<time dateTime={checked}>{checked}</time></span>
  </p>;
}
