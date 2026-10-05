// Explicit bookmarks are separate from map-open and visited journal records.
// No place IDs or browser identifiers are sent to analytics.
export const bookmarkKey='nhp-device-bookmarks-v1';
export const bookmarkEvent='nhp-bookmarks-change';
export const MAX_BOOKMARKS=200;
export function parseBookmarks(raw:string|null):string[]{
 try {const value:unknown=JSON.parse(raw||'[]');return Array.isArray(value)?[...new Set(value.filter((id):id is string=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,180}$/.test(id)))].slice(0,MAX_BOOKMARKS):[];}catch{return [];}
}
export function readBookmarks():string[]{try{return parseBookmarks(localStorage.getItem(bookmarkKey));}catch{return [];}}
export function setBookmark(id:string,saved:boolean):boolean{
 if(!/^[a-zA-Z0-9_-]{1,180}$/.test(id))return false;
 try {
  const current=parseBookmarks(localStorage.getItem(bookmarkKey));
  if(saved&&!current.includes(id)&&current.length>=MAX_BOOKMARKS)return false;
  const next=saved?[id,...current.filter(value=>value!==id)]:current.filter(value=>value!==id);
  localStorage.setItem(bookmarkKey,JSON.stringify(next));
  window.dispatchEvent(new Event(bookmarkEvent));return true;
 }catch{return false;}
}
