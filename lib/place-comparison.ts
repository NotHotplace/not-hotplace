import type {Place} from './catalog';
import {privacyLabel, privateBookingFacts} from './place-themes';

export const MAX_COMPARISON = 3;
export function toggleComparison(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter(value => value !== id)
    : ids.length < MAX_COMPARISON ? [...ids, id] : ids;
}

export type ComparisonPlace = Place & {count: number; quiet: number; positive: number};
export function comparisonFacts(place: ComparisonPlace, language: 'ko' | 'en') {
  const ko = language === 'ko';
  const experiences = place.experiences || [];
  const unknown = ko ? '공식 안내에서 확인 필요' : 'Check with the venue';
  const cost = place.visitDetails?.find(detail => /^(admission|price|pricing|cost|fee|menu prices|programme|program|tea experience)$/i.test(detail.labelEn));
  return [
    {label: ko ? '위치' : 'Location', value: place.address},
    {label: ko ? '공간 구분' : 'Space type', value: experiences.length
      ? [...new Set(experiences.map(item => privacyLabel(item.kind, language)))].join(' · ')
      : ko ? '독립 공간 확인 전' : 'Privacy not verified'},
    {label: ko ? '이용 인원' : 'Party size', value: experiences.length
      ? experiences.map(item => `${ko ? item.nameKo : item.nameEn}: ${privateBookingFacts(item, language)[0].value}`).join('\n') : unknown},
    {label: ko ? '요금·최소 이용금액' : 'Price / minimum spend', value: experiences.length
      ? experiences.map(item => `${ko ? item.nameKo : item.nameEn}: ${privateBookingFacts(item, language)[1].value}`).join('\n')
      : cost ? (ko ? cost.textKo : cost.textEn) : unknown},
    {label: ko ? '최근 90일 후기' : 'Reviews · last 90 days', value: place.count
      ? ko ? `${place.count}명 · 만족 ${Math.round(place.positive / place.count * 100)}% · 조용함 ${Math.round(place.quiet / place.count * 100)}%${place.count < 3 ? ' · 표본 적음' : ''}`
        : `${place.count} visitors · ${Math.round(place.positive / place.count * 100)}% satisfied · ${Math.round(place.quiet / place.count * 100)}% quiet${place.count < 3 ? ' · small sample' : ''}`
      : ko ? '후기 대기 · 조용함 확인 전' : 'Awaiting reviews · quietness unverified'},
  ];
}
