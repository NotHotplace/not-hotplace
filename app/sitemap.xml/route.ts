import {SITE_URL} from '@/lib/seo';
import {catalog} from '@/lib/catalog';
import {placePath} from '@/lib/place-pages';
import {guides} from '@/lib/guides';
export function GET(){
 const pages=['','/kr','/us','/trips','/install','/plus','/guides'];
 const guidePages=guides.flatMap(guide=>(['en','ko'] as const).map(language=>`<url><loc>${SITE_URL}/guides/${guide.slug}/${language}</loc>${(['en','ko'] as const).map(lang=>`<xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}/guides/${guide.slug}/${lang}"/>`).join('')}</url>`)).join('');
 const placePages=catalog.flatMap(place=>(['en','ko'] as const).map(language=>{
  const alternates=(['en','ko'] as const).map(lang=>`<xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}${placePath(place.id,lang)}"/>`).join('');
  return `<url><loc>${SITE_URL}${placePath(place.id,language)}</loc>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${placePath(place.id,'en')}"/></url>`;
 })).join('');
 const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+pages.map(path=>`<url><loc>${SITE_URL}${path}</loc></url>`).join('')+placePages+guidePages+'</urlset>';
 return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
