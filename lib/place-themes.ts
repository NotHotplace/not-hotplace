import type {Place} from './catalog';

export type PlaceTheme = 'all' | 'private-room' | 'premium-spa' | 'exclusive-hire';
export type PrivateExperience = {
  kind: 'private-room' | 'private-suite' | 'exclusive-hire' | 'semi-private';
  nameKo: string;
  nameEn: string;
  bookingKo: string;
  bookingEn: string;
  maxGuests?: number;
  minimumSpendKo?: string;
  minimumSpendEn?: string;
  scopeKo?: string;
  scopeEn?: string;
  source: string;
  checked: string;
};

export function privateBookingFacts(experience: PrivateExperience, language: 'ko' | 'en') {
  const ko = language === 'ko';
  return [
    {label: ko ? '이용 인원' : 'Party size', value: experience.maxGuests
      ? (ko ? `최대 ${experience.maxGuests}명` : `Up to ${experience.maxGuests} guests`)
      : (ko ? '룸별 정원 문의 필요' : 'Confirm capacity for your room')},
    {label: ko ? '최소 이용금액' : 'Minimum spend', value: (ko ? experience.minimumSpendKo : experience.minimumSpendEn)
      || (ko ? '공개 금액 없음 · 예약 시 문의' : 'Not published · ask when booking')},
    {label: ko ? '예약 조건' : 'Booking conditions', value: ko ? experience.bookingKo : experience.bookingEn},
  ];
}

export const placeThemes = [
  {id:'all', en:'All spaces', ko:'모든 공간'},
  {id:'private-room', en:'Private rooms', ko:'프라이빗 룸'},
  {id:'premium-spa', en:'Premium spas', ko:'프리미엄 스파'},
  {id:'exclusive-hire', en:'Exclusive hire', ko:'전용 대관'},
] as const;

export function isPlaceTheme(value: unknown): value is PlaceTheme {
  return placeThemes.some(theme => theme.id === value);
}

export function matchesPlaceTheme(place: Pick<Place, 'themes' | 'experiences'>, theme: PlaceTheme) {
  if (theme === 'all') return true;
  if (theme === 'premium-spa') return !!place.themes?.includes('premium-spa');
  // A semi-private area or venue buyout must never imply a private room.
  return !!place.experiences?.some(experience => theme === 'private-room'
    ? experience.kind === 'private-room' || experience.kind === 'private-suite'
    : experience.kind === 'exclusive-hire');
}

export function privacyLabel(kind: PrivateExperience['kind'], language: 'ko' | 'en') {
  const labels = {
    'private-room': ['Private room', '프라이빗 룸'],
    'private-suite': ['Private suite', '프라이빗 스위트'],
    'exclusive-hire': ['Exclusive hire', '전용 대관'],
    'semi-private': ['Semi-private', '반독립 공간'],
  };
  return labels[kind][language === 'ko' ? 1 : 0];
}
