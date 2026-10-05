// Server-side place lookup. Client components import ./place-links instead.
import {catalog, type Place} from './catalog';
export {isPlaceLanguage,placePath,explorerPath,sharePlacePath,mapPath,type PlaceLanguage} from './place-links';
export {placeDescription} from './place-copy';
export function findCatalogPlace(id: string) {
  return catalog.find(place => place.id === id);
}
export function relatedPlaces(place: Place, limit = 3) {
  return catalog.filter(other => other.id !== place.id && other.country === place.country
    && other.city === place.city && other.category === place.category).slice(0, limit);
}
