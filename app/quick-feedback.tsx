'use client';
import {useEffect,useRef,useState} from 'react';
import {trackEngagement} from '@/lib/engagement-client';
import {readJournal,recordPause,removePause,journalEvent} from '@/lib/rest-journal';
import {isCatalogPlace} from '@/lib/place-links';
import type {CountryCode} from '@/lib/countries';
type Noise='조용함'|'보통'|'시끄러움';
export default function QuickFeedback({id,country,language}:{id:string;country:CountryCode;language:'ko'|'en'}){
 const ko=language==='ko',text=(kr:string,en:string)=>ko?kr:en;
 const [noise,setNoise]=useState<Noise|null>(null),[day,setDay]=useState(''),[time,setTime]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[saved,setSaved]=useState(false),[planned,setPlanned]=useState(false),[summary,setSummary]=useState<{count:number;quiet:number;moderate:number;loud:number}|null>(null);
 const lifecycle=useRef({id,alive:true,read:0,operation:0,controller:null as AbortController|null});
 if(lifecycle.current.id!==id){lifecycle.current.controller?.abort();lifecycle.current.id=id;lifecycle.current.read++;lifecycle.current.operation++;}
 function invalidateRead(){lifecycle.current.read++;lifecycle.current.controller?.abort();}
 function currentOperation(operation:number){return lifecycle.current.alive&&lifecycle.current.id===id&&lifecycle.current.operation===operation;}
 async function load(updateMine=true){
  const state=lifecycle.current,version=++state.read,operation=state.operation,controller=new AbortController();state.controller?.abort();state.controller=controller;
  const res=await fetch('/api/quick-feedback?place='+encodeURIComponent(id),{cache:'no-store',signal:controller.signal});if(!res.ok)throw new Error('load');
  const json=await res.json() as {summary:typeof summary;mine:{noise:Noise;day?:string;time?:string}|null};
  if(controller.signal.aborted||!currentOperation(operation)||version!==lifecycle.current.read)return;
  setSummary(json.summary);
  if(updateMine){if(json.mine){setNoise(json.mine.noise);setDay(json.mine.day||'');setTime(json.mine.time||'');setSaved(true);}else setSaved(false);}
 }
 useEffect(()=>{
  lifecycle.current.alive=true;setNoise(null);setDay('');setTime('');setSaved(false);setBusy(false);setSummary(null);setNotice('');void load().catch(()=>{});
  function journal(){setPlanned(readJournal().some(r=>r.placeId===id&&r.state==='planned'));}journal();window.addEventListener(journalEvent,journal);
  return()=>{lifecycle.current.alive=false;invalidateRead();lifecycle.current.operation++;window.removeEventListener(journalEvent,journal);};
 },[id]);
 async function submit(value:Noise,extra=false){
  const operation=++lifecycle.current.operation;invalidateRead();setBusy(true);setNotice('');if(!extra)trackEngagement('review_start',country);
  try{
   const res=await fetch('/api/quick-feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId:id,noise:value,...(day?{day}:{}),...(time?{time}:{})})});
   if(!res.ok)throw new Error(res.status===429?text('오늘은 여러 번 기록했어요. 내일 다시 알려주세요.','Daily limit reached. Please try tomorrow.'):text('저장하지 못했어요. 다시 눌러주세요.','Unable to save. Please try again.'));
   if(!currentOperation(operation))return;
   setNoise(value);setSaved(true);const local=recordPause({placeId:id,state:'visited',at:Date.now(),noise:value,day,time});
   const localNotice=local?text(' 내 쉼 기록에도 남겼어요.',' It is also in your rest journal.'):!isCatalogPlace(id)?text(' 사용자 제안 장소의 간단 후기는 온라인에 저장되며, 기기 쉼 기록은 아직 지원하지 않아요.',' Community-place responses are saved online; device journal entries for these places are not supported yet.'):text(' 이 브라우저에는 쉼 기록을 저장할 수 없어요.',' Your browser could not save the local journal.');
   setNotice(text('고마워요. 간단 후기가 반영됐어요.','Thank you. Your quick response was saved.')+localNotice);trackEngagement('quick_review',country);void load(false).catch(()=>{});
  }catch(e){if(currentOperation(operation))setNotice(e instanceof Error?e.message:'Error');}finally{if(currentOperation(operation))setBusy(false);}
 }
 async function remove(){
  const operation=++lifecycle.current.operation;invalidateRead();setBusy(true);
  try{const res=await fetch('/api/quick-feedback',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId:id})});if(!res.ok)throw new Error('delete');if(!currentOperation(operation))return;
   removePause(id);setNoise(null);setDay('');setTime('');setSaved(false);setSummary(null);setNotice(text('이 브라우저에서 남긴 간단 후기를 삭제했어요.','Your quick response from this browser was deleted.'));void load(false).catch(()=>{});
  }catch{if(currentOperation(operation))setNotice(text('삭제하지 못했어요. 다시 시도해 주세요.','Unable to delete. Try again.'));}finally{if(currentOperation(operation))setBusy(false);}
 }
 return <section className="quick-feedback" aria-labelledby={'quick-title-'+id}>
 {planned&&<p className="quick-nudge">{text('지도에서 살펴본 곳이에요. 실제로 다녀오셨나요?','You opened this place in maps. Did you visit?')}</p>}
 <h3 id={'quick-title-'+id}>{text('다녀오셨다면, 조용했나요?','Visited? How was the noise?')}</h3><p>{text('로그인·글쓰기 없이 한 번 눌러 기록해요.','One tap. No sign-in or writing required.')}</p>
 <div className="quick-choices">{(['조용함','보통','시끄러움'] as const).map((value,index)=><button key={value} type="button" disabled={busy} aria-pressed={saved&&noise===value} onClick={()=>void submit(value)}>{['🌿','☕','🔊'][index]} {ko?value:['Quiet','Moderate','Loud'][index]}</button>)}</div>
 {saved&&<details><summary>{text('요일·시간도 알려주기 · 선택','Add day and time · optional')}</summary><div className="quick-extra"><label>{text('방문 요일','Visit day')}<select value={day} onChange={e=>setDay(e.target.value)}><option value="">{text('기억 안 남 / 선택 안 함','Unknown / skip')}</option><option value="평일">{text('평일','Weekday')}</option><option value="주말·공휴일">{text('주말·공휴일','Weekend / holiday')}</option></select></label><label>{text('방문 시간','Visit time')}<select value={time} onChange={e=>setTime(e.target.value)}><option value="">{text('기억 안 남 / 선택 안 함','Unknown / skip')}</option>{['오전','오후','저녁'].map((v,i)=><option key={v} value={v}>{ko?v:['Morning','Afternoon','Evening'][i]}</option>)}</select></label><button type="button" className="place-secondary" disabled={busy} onClick={()=>noise&&void submit(noise,true)}>{text('선택 내용 저장','Save these details')}</button></div></details>}
 <p role="status" aria-live="polite">{busy?text('저장 중…','Saving…'):notice}</p>
 {summary&&summary.count>0&&<p className="quick-sample">{text(`간단 응답 ${summary.count}건 · 조용함 ${summary.quiet||0} / 보통 ${summary.moderate||0} / 시끄러움 ${summary.loud||0}`,`${summary.count} quick responses · quiet ${summary.quiet||0} / moderate ${summary.moderate||0} / loud ${summary.loud||0}`)}{summary.count<3&&text(' · 표본이 적어요',' · Small sample')}<br/>{text('최근 90일의 익명 응답입니다. 상세 후기·추천 점수와 별도로 표시해요.','Anonymous responses from the last 90 days, displayed separately from detailed reviews and recommendations.')}</p>}
 <div className="quick-footer"><a href={'/journal?lang='+language}>{text('내 쉼 기록 보기','Open my rest journal')}</a>{saved&&<button type="button" disabled={busy} onClick={()=>void remove()}>{text('내 간단 후기 삭제','Delete my quick response')}</button>}</div><small>{text('한 브라우저의 최신 응답만 반영해요. 방문했을 때만 눌러주세요.','Only the latest response from each browser counts. Respond only after a visit.')}</small>
 </section>;
}
