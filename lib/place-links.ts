// Client-safe links and identity checks. Full catalog records stay on the server.
import {countryPath} from './countries';
import type {Place} from './catalog';
import ids from './catalog-ids.json';
const sourceIds = new Set(ids);
export type PlaceLanguage = 'en' | 'ko';
export function isPlaceLanguage(value: string): value is PlaceLanguage {
  return value === 'en' || value === 'ko';
}
export function isCatalogPlace(id: string) {
  return sourceIds.has(id);
}
export function placePath(id: string, language: PlaceLanguage) {
  return `/places/${encodeURIComponent(id)}/${language}`;
}
export function explorerPath(place: Pick<Place, 'id' | 'country'>, language: PlaceLanguage) {
  const query = new URLSearchParams({lang: language, place: place.id});
  return `${countryPath(place.country || 'KR')}?${query}`;
}
export function sharePlacePath(place: Pick<Place, 'id' | 'country'>, language: PlaceLanguage) {
  return isCatalogPlace(place.id) ? placePath(place.id, language) : explorerPath(place, language);
}
export function mapPath(place: Pick<Place, 'country' | 'name' | 'address'>) {
  return place.country !== 'KR'
    ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.name + ' ' + place.address)
    : 'https://map.kakao.com/link/search/' + encodeURIComponent(place.name + ' ' + place.address);
}
