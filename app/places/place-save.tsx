'use client';
import {useEffect,useState} from 'react';
import {Bookmark,Check} from 'lucide-react';
import {countryPath,type CountryCode} from '@/lib/countries';
import {trackEngagement} from '@/lib/engagement-client';
import {readBookmarks,setBookmark,bookmarkEvent} from '@/lib/device-bookmarks';
export default function PlaceSave({id,country,language,compact=false}:{id:string;country:CountryCode;language:'ko'|'en';compact?:boolean}){
 const ko=language==='ko',[saved,setSaved]=useState(false),[ready,setReady]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{const update=()=>{setSaved(readBookmarks().includes(id));setReady(true);};update();window.addEventListener(bookmarkEvent,update);window.addEventListener('storage',update);return()=>{window.removeEventListener(bookmarkEvent,update);window.removeEventListener('storage',update);};},[id]);
 function save(){
  const next=!readBookmarks().includes(id),ok=setBookmark(id,next);
  if(ok){setSaved(next);if(next)trackEngagement('save',country);}
  setNotice(ok?(next?(ko?'이 기기의 저장한 곳에 보관했어요.':'Saved in this device’s saved places.'):(ko?'기기 저장을 취소했어요. 방문 기록은 유지돼요.':'Removed the bookmark. Visit history is unchanged.')):(ko?'기기 저장을 사용할 수 없거나 200곳 한도에 도달했어요.':'Device storage is unavailable or the 200-place limit is reached.'));
 }
 return <>{compact?<button type="button" disabled={!ready} aria-pressed={saved} onClick={save}>{saved?(ko?'저장됨':'Saved'):(ko?'기기 저장':'Save here')}</button>:<><button type="button" disabled={!ready} className="place-secondary place-local-save" aria-pressed={saved} onClick={save}>{saved?<Check size={17}/>:<Bookmark size={17}/>} {saved?(ko?'이 기기에 저장됨 · 취소':'Saved on this device · remove'):(ko?'로그인 없이 이 기기에 저장':'Save on this device without sign-in')}</button><small>{ko?'이 브라우저에만 보관합니다.':'Kept only in this browser.'} <a href={countryPath(country)+'?lang='+language+'&view=saved'}>{ko?'저장한 곳':'Saved places'} ↗</a></small></>}{notice&&<span className="place-save-notice" role="status">{notice}</span>}</>;
}
