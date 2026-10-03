import type {Place} from './catalog';
import english from './en.json';
import koreanRegions from './ko-regions.json';

const translations = english as Record<string, string>;
const regions = koreanRegions as Record<string, string>;
const englishRegions = Object.fromEntries(Object.entries(regions).map(([en, ko]) => [ko, en]));
const categoryTerms: Record<string, string[]> = {
  cafe: ['카페', '찻집', 'cafe', 'café', 'coffee', 'tea'],
  food: ['음식점', '식당', 'food', 'restaurant'],
  drive: ['드라이브', 'drive', 'scenic stop'],
  walk: ['산책', '정원', 'walk', 'garden', 'park'],
  spa: ['스파', 'spa'],
};
const normalize = (value: string) => value.normalize('NFKC').toLowerCase();

// Search both languages regardless of the current interface language.
export function matchesSearchText(values: (string | undefined)[], term: string) {
  const words = normalize(term).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const fields = values.filter((value): value is string => !!value).flatMap(value =>
    [value, translations[value], regions[value], englishRegions[value]].filter(Boolean).map(normalize));
  return words.every(word => fields.some(field => field.includes(word) || field.replace(/\s+/g, '').includes(word)));
}

export function matchesPlaceSearch(place: Place, term: string) {
  return matchesSearchText([
    place.name, place.city, place.area, place.address,
    ...place.states || [], ...place.tags || [], ...place.tagsKo || [], ...place.tagsEn || [],
    ...categoryTerms[place.category] || [],
  ], term);
}
