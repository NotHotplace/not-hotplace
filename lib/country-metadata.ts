import type {Metadata} from 'next';
import {countries, type CountryCode} from './countries';
import {SITE_URL} from './seo';

export function countryMetadata(code: CountryCode): Metadata {
  const country = countries[code];
  return {
    title: `${country.nameKo} · ${country.nameEn} | NotHotplace`,
    description: `${country.nameKo}의 정원·산책 공간과 방문 정보를 찾아보세요.`,
    alternates: {canonical: `${SITE_URL}/${country.slug}`},
  };
}
