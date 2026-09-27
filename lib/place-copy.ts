import type {Place} from './catalog';

export function placeDescription(place: Place, language: 'en' | 'ko') {
  if (language === 'ko') return place.descriptionKo || place.description;
  return place.descriptionEn || (place.country === 'US' ? place.description :
    'Explore this place in South Korea. See the source for visitor information and check recent visitor reviews before planning your pause.');
}

export function placeTags(place: Place, language: 'en' | 'ko') {
  return language === 'ko' ? place.tagsKo || place.tags : place.tagsEn || (place.country === 'US' ? place.tags : []);
}

export function placeVisitHint(place: Place, language: 'en' | 'ko') {
  const experience = place.experiences?.[0];
  if (experience) return language === 'ko' ? experience.bookingKo : experience.bookingEn;
  const detail = place.visitDetails?.find(item => /reservation|booking|access|parking|plan your route/i.test(item.labelEn)) || place.visitDetails?.[0];
  if (detail) return language === 'ko' ? detail.textKo : detail.textEn;
  return language === 'ko'
    ? '운영 시간과 이용 조건은 방문 전 정보 출처에서 확인해 주세요.'
    : 'Check opening hours and access with the information source before visiting.';
}
