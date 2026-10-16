import names from './place-names.json';
import type {Place} from './catalog';

type NamedPlace = Pick<Place, 'id' | 'name'>;
type NameEvidence = {nameEn: string; aliases: string[]; source: string; checked: string};
const verifiedNames = names as Record<string, NameEvidence>;

// Verified English names take precedence. These limited reading aids are
// editorial romanizations of stored Korean names, not official English names.
const romanizedNames: Record<string, string> = {
  'seoul-suyeon': 'Suyeonsanbang',
  'seoul-sueno': 'Suaenyo 339',
  'seoul-san': 'Sanmotungi',
};
function romanizedName(place: NamedPlace) {
  return Object.hasOwn(romanizedNames, place.id) ? romanizedNames[place.id] : undefined;
}
export function placeName(place: NamedPlace, language: 'ko' | 'en') {
  return language === 'en' ? placeNameEvidence(place)?.nameEn || romanizedName(place) || place.name : place.name;
}
export function placeNameEvidence(place: NamedPlace) {
  return Object.hasOwn(verifiedNames, place.id) ? verifiedNames[place.id] : undefined;
}
export function placeSearchNames(place: NamedPlace) {
  const evidence = placeNameEvidence(place);
  return evidence ? [place.name, evidence.nameEn, ...evidence.aliases] : [place.name, ...(romanizedName(place) ? [romanizedName(place)!] : [])];
}
