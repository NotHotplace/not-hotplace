import names from './place-names.json';
import type {Place} from './catalog';

type NamedPlace = Pick<Place, 'id' | 'name'>;
type NameEvidence = {nameEn: string; aliases: string[]; source: string; checked: string};
const verifiedNames = names as Record<string, NameEvidence>;

// Explicitly sourced names only. Never infer a translation from a Korean name.
export function placeName(place: NamedPlace, language: 'ko' | 'en') {
  return language === 'en' ? placeNameEvidence(place)?.nameEn || place.name : place.name;
}
export function placeNameEvidence(place: NamedPlace) {
  return Object.hasOwn(verifiedNames, place.id) ? verifiedNames[place.id] : undefined;
}
export function placeSearchNames(place: NamedPlace) {
  const evidence = placeNameEvidence(place);
  return evidence ? [place.name, evidence.nameEn, ...evidence.aliases] : [place.name];
}
