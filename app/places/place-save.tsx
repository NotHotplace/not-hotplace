'use client';
import {useEffect,useState} from 'react';
import {Bookmark,Check} from 'lucide-react';
import {readJournal,recordPause,journalEvent} from '@/lib/rest-journal';
export default function PlaceSave({id,language,compact=false}:{id:string;language:'ko'|'en';compact?:boolean}){
 const ko=language==='ko',[saved,setSaved]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{const update=()=>setSaved(readJournal().some(p=>p.placeId===id));update();window.addEventListener(journalEvent,update);return()=>window.removeEventListener(journalEvent,update);},[id]);
 function save(){
  if(readJournal().some(p=>p.placeId===id)){setNotice(ko?'이미 내 쉼 기록에 저장돼 있어요.':'Already saved in your rest journal.');return;}
  const ok=recordPause({placeId:id,state:'planned',at:Date.now()});setSaved(ok);setNotice(ok?(ko?'이 기기에 저장했어요. 내 쉼 기록에서 다시 볼 수 있어요.':'Saved on this device. Find it in your rest journal.'):(ko?'기기 저장을 사용할 수 없어요. 브라우저 설정을 확인해 주세요.':'Device storage is unavailable. Check browser settings.'));
 }
 return <>{compact?<button type="button" onClick={save}>{saved?(ko?'저장됨':'Saved'):(ko?'기기 저장':'Save here')}</button>:<><button type="button" className="place-secondary place-local-save" aria-pressed={saved} onClick={save}>{saved?<Check size={17}/>:<Bookmark size={17}/>} {saved?(ko?'이 기기에 저장됨':'Saved on this device'):(ko?'로그인 없이 이 기기에 저장':'Save on this device without sign-in')}</button><small>{ko?'이 브라우저의 내 쉼 기록에 보관합니다.':'Kept in this browser’s rest journal.'} <a href={'/journal?lang='+language}>{ko?'내 쉼 기록':'Rest journal'} ↗</a></small></>}{notice&&<span className="place-save-notice" role="status">{notice}</span>}</>;
}
