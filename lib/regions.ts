export const regionKeys=['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'] as const;
export const supportedCities=[...regionKeys,'청주'] as const;
export function regionOf(city:string){return city==='청주'?'충북':city;}
export function inRegion(place:{city:string;address?:string;states?:string[]},region:string){return region==='전국'||!!place.states?.includes(region)||(region==='청주'?(place.city==='청주'||/청주시/.test(place.address||'')):regionOf(place.city)===region);}
