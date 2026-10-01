import type {Place} from './catalog';
export type ExternalMemo={checked:string;periodKo:string;periodEn:string;summaryKo:string;summaryEn:string;cautionKo:string;cautionEn:string;sources:{provider:string;url:string}[]};
export function externalReviewLinks(place:Pick<Place,'name'|'address'|'country'>){
 const query=place.name.replace(/\s*·.*$/,'')+' '+place.address;
 const google={name:'Google Maps',url:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query)};
 if((place.country||'KR')==='KR')return [{name:'네이버지도',url:'https://map.naver.com/p/search/'+encodeURIComponent(query)},{name:'카카오맵',url:'https://map.kakao.com/link/search/'+encodeURIComponent(query)},google];
 return [google,{name:'Tripadvisor',url:'https://www.tripadvisor.com/Search?q='+encodeURIComponent(query)},...(place.country==='US'?[{name:'Yelp',url:'https://www.yelp.com/search?find_desc='+encodeURIComponent(place.name)+'&find_loc='+encodeURIComponent(place.address)}]:[])];
}
