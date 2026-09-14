import {SITE_URL} from '@/lib/seo';
export function GET(){
 const pages=['','/trips','/install','/plus'];
 const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(path=>`<url><loc>${SITE_URL}${path}</loc></url>`).join('')+'</urlset>';
 return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
