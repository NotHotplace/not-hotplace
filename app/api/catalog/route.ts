// Public source material only. Account state, reviews and moderation stay in
// /api/data and are never returned from or cached by this endpoint.
import {catalog} from '@/lib/catalog';
import {countryCodes,type CountryCode} from '@/lib/countries';
import {isPlaceTheme,matchesPlaceTheme} from '@/lib/place-themes';
import {finderMatches,collectionPlace} from '@/lib/catalog-views';
import {informationScore} from '@/lib/place-presentation';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,view=params.get('view')||'country';
 if(!['country','finder','themes','collection'].includes(view))return Response.json({error:'Invalid view'},{status:400});
 const country=params.get('country') as CountryCode;
 if(!countryCodes.includes(country))return Response.json({error:'Country required'},{status:400});
 let places=catalog.filter(p=>(p.country||'KR')===country);
 const headers={'Cache-Control':'public, max-age=300'};
 if(view==='finder'){
  try{return Response.json({matches:finderMatches(places,params,country)},{headers});}
  catch{return Response.json({error:'Invalid finder filters'},{status:400});}
 }
 if(view==='themes'){
  const theme=params.get('theme')||'all';
  if(!isPlaceTheme(theme))return Response.json({error:'Invalid theme'},{status:400});
  places=places.filter(p=>matchesPlaceTheme(p,theme)).sort((a,b)=>informationScore(b)-informationScore(a)).slice(0,4);
 }
 return Response.json({places:view==='collection'?places.map(collectionPlace):places},{headers});
}
