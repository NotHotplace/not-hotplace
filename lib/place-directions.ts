import type {Place} from './catalog';

export type TravelMode = 'driving' | 'walking' | 'transit';
export const travelModes: TravelMode[] = ['driving', 'walking', 'transit'];
export type DirectionPlace = Pick<Place, 'id' | 'country' | 'name' | 'address' | 'lat' | 'lon' | 'locationInfo'>;
export type DirectionLink = {provider: 'google' | 'naver' | 'kakao'; href: string; kind: 'route' | 'search' | 'web-route'; appOnly?: boolean};

export function validCoordinates(place: DirectionPlace) {
  return typeof place.lat === 'number' && Number.isFinite(place.lat) && Math.abs(place.lat) <= 90 &&
    typeof place.lon === 'number' && Number.isFinite(place.lon) && Math.abs(place.lon) <= 180;
}
// A catalog pin is not an entrance. Unsourced/approximate pins never become route destinations.
export function hasSourcedCoordinates(place: DirectionPlace) {
  const info = place.locationInfo;
  if (!validCoordinates(place) || !info || !['reference', 'entrance'].includes(info.kind)) return false;
  try {
    const source = new URL(info.source);
    if (source.protocol !== 'https:' || !source.hostname || source.username || source.password) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(info.checked)) return false;
    const checked = new Date(info.checked + 'T00:00:00Z');
    return Number.isFinite(checked.getTime()) && checked.toISOString().slice(0, 10) === info.checked &&
      info.checked <= new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
  } catch { return false; }
}
export function directionLinks(place: DirectionPlace, mode: TravelMode): DirectionLink[] {
  if (!travelModes.includes(mode)) return [];
  const query = [place.name.trim(), place.address.trim()].filter(Boolean).join(' ');
  if (!query) return [];
  const sourced = hasSourcedCoordinates(place);
  const destination = sourced ? `${place.lat},${place.lon}` : query;
  const google = {provider: 'google' as const, kind: 'route' as const,
    href: 'https://www.google.com/maps/dir/?' + new URLSearchParams({api: '1', destination, travelmode: mode})};
  if ((place.country || 'KR') !== 'KR') return [google];
  const search: DirectionLink[] = [
    {provider: 'naver', kind: 'search', href: 'https://map.naver.com/p/search/' + encodeURIComponent(query)},
    {provider: 'kakao', kind: 'search', href: 'https://map.kakao.com/link/search/' + encodeURIComponent(query)},
  ];
  // Naver documents this coordinate range. No guessed origin, entrance or place ID.
  if (!sourced || place.lat! < 31.43 || place.lat! > 44.35 || place.lon! < 122.37 || place.lon! > 132) return [...search, google];
  return [
    {provider: 'naver', kind: 'route', appOnly: true, href: 'nmap://route/' + ({driving: 'car', walking: 'walk', transit: 'public'}[mode]) + '?' +
      new URLSearchParams({dlat: String(place.lat), dlng: String(place.lon), dname: place.name, appname: 'https://nothotplace.com'})},
    {provider: 'kakao', kind: 'route', appOnly: true, href: 'kakaomap://route?' +
      new URLSearchParams({ep: `${place.lat},${place.lon}`, by: {driving: 'car', walking: 'foot', transit: 'publictransit'}[mode]})},
    google,
    search[0],
    {provider: 'kakao', kind: 'web-route', href: 'https://map.kakao.com/link/to/' + encodeURIComponent(place.name) + `,${place.lat},${place.lon}`},
  ];
}
