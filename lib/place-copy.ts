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
  const details = place.visitDetails || [];
  const useful = (value: string) => value.trim() && !/^(관광정보 안내:\s*)?(가능|불가능|없음|문의|미정|정보 없음|상시|연중무휴)\.?$/.test(value.trim())
    && !/조건과 좌석은 매장에 확인|최신 가격은 매장|no verified price|confirm solo.dining|tourism listing: parking/i.test(value);
  // Prefer booking/access constraints to boilerplate. Missing details need no repeated card footer.
  for (const pattern of [/reservation|booking|solo visit|access/i, /closures|hours|admission|plan your route/i, /parking/i]) {
    const detail = details.find(item => pattern.test(item.labelEn) && useful(language === 'ko' ? item.textKo : item.textEn));
    if (detail) return `${language === 'ko' ? detail.labelKo : detail.labelEn} · ${language === 'ko' ? detail.textKo : detail.textEn}`;
  }
  return '';
}

export function placePreviewDescription(place: Place, language: 'en' | 'ko') {
  const description = placeDescription(place, language).replace(/\s+/g, ' ').trim();
  const sentences = description.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [description];
  // Keep complete sentences; full visitor detail stays on the place page.
  return sentences.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
}
