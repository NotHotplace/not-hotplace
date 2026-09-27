import {catalog, type Place} from './catalog';

export type PlaceLanguage = 'en' | 'ko';
export function isPlaceLanguage(value: string): value is PlaceLanguage {
  return value === 'en' || value === 'ko';
}
export function findCatalogPlace(id: string) {
  return catalog.find(place => place.id === id);
}
export function placePath(id: string, language: PlaceLanguage) {
  return `/places/${encodeURIComponent(id)}/${language}`;
}
export function explorerPath(place: Pick<Place, 'id' | 'country'>, language: PlaceLanguage) {
  const query = new URLSearchParams({lang: language, place: place.id});
  return `/${place.country === 'US' ? 'us' : 'kr'}?${query}`;
}
export function sharePlacePath(place: Place, language: PlaceLanguage) {
  // Approved community suggestions are served by the live explorer, not the source catalog.
  return findCatalogPlace(place.id) ? placePath(place.id, language) : explorerPath(place, language);
}
export {placeDescription} from './place-copy';
export function mapPath(place: Place) {
  return place.country === 'US'
    ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.name + ' ' + place.address)
    : 'https://map.kakao.com/link/search/' + encodeURIComponent(place.name + ' ' + place.address);
}
export function relatedPlaces(place: Place, limit = 3) {
  return catalog.filter(other => other.id !== place.id && other.country === place.country
    && other.city === place.city && other.category === place.category).slice(0, limit);
}
