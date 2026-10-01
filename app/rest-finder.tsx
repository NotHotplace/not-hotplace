'use client';
import {useState} from 'react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {restMatches,defaultRestPreferences,visitingTimeLabel,type FinderPlace,type RestPreferences} from '@/lib/rest-finder';
import {placePath,findCatalogPlace,explorerPath} from '@/lib/place-pages';
import {placeDescription} from '@/lib/place-copy';
import {trackEngagement} from '@/lib/engagement-client';

export default function RestFinder({places,language,position,radiusKm=10,onVisit}: {places:FinderPlace[];language:'ko'|'en';position?:{lat:number;lon:number}|null;radiusKm?:number;onVisit?:()=>void}) {
  const [preferences,setPreferences]=useState<RestPreferences>({...defaultRestPreferences});
  const [expanded,setExpanded]=useState(false);
  const ko=language==='ko',label=(kr:string,en:string)=>ko?kr:en;
  const results=restMatches(places,{...preferences,position,radiusKm});
  const visit=(place:FinderPlace)=>{trackEngagement('recommendation_open',place.country||'KR');onVisit?.();};
  const href=(place:FinderPlace)=>findCatalogPlace(place.id)?placePath(place.id,language):explorerPath(place,language);
  function choice<K extends keyof RestPreferences>(key:K,title:string,options:[string,string][]) {
    return <label className="finder-field">{title}<Select value={String(preferences[key]??'any')} onValueChange={value=>setPreferences(current=>({...current,[key]:key==='budget'?(value==='any'?null:Number(value)):value}))}><SelectTrigger aria-label={title}><SelectValue/></SelectTrigger><SelectContent>{options.map(([value,text])=><SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></label>;
  }
  return <section className="rest-finder" aria-labelledby="rest-finder-heading">
    <div className="finder-heading"><div><span className="world-kicker">YOUR KIND OF PAUSE</span><h2 id="rest-finder-heading">{label('오늘의 쉼, 3곳부터.','Your next pause. Start with three.')}</h2></div><button type="button" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{label(expanded?'조건 접기':'내 조건으로 고르기',expanded?'Hide choices':'Choose your conditions')}</button></div>
    {expanded&&<div className="finder-fields">
      {choice('purpose',label('어떤 쉼인가요?','What kind of pause?'),[['all',label('모든 공간','All spaces')],['cafe',label('차·커피 한 잔','Tea or coffee')],['food',label('식사','A meal')],['drive',label('풍경·산책','Scenery and a walk')],['private-room',label('독립된 룸','A private room')],['premium-spa',label('스파','A spa')]])}
      {choice('party',label('누구와 가나요?','Who is going?'),[['any',label('상관없어요','Any')],['solo',label('혼자','On my own')],['together',label('일행과','With company')]])}
      {choice('day',label('방문 요일','Visiting day'),[['any',label('아직 미정','Not decided')],['평일',label('평일','Weekday')],['주말·공휴일',label('주말·공휴일','Weekend / holiday')]])}
      {choice('time',label('방문 시간','Time of day'),[['any',label('아직 미정','Not decided')],['오전',label('오전','Morning')],['오후',label('오후','Afternoon')],['저녁',label('저녁','Evening')]])}
      {choice('budget',label('입장료 예산','Admission budget'),[['any',label('전체 · 요금 미확인 포함','All · includes unknown fees')],['0',label('무료 입장 확인된 곳','Published free admission')]])}
    </div>}
    {!expanded&&<div className="finder-shortlist" aria-live="polite">{results.map(({place},index)=><a key={place.id} href={href(place)} onClick={()=>visit(place)}><span>0{index+1}</span>{place.name}</a>)}</div>}
    {expanded&&<div className="finder-results" aria-live="polite">{results.map(({place,reviewed,time,distance},index)=><article key={place.id} className="finder-result">
      <span className="finder-number">0{index+1}</span>{place.image&&<img src={place.image} alt="" loading="lazy"/>}<div><span className="finder-area">{place.area}{distance!==null&&` · ${distance.toFixed(1)}km`}</span><h3><a href={href(place)} onClick={()=>visit(place)}>{place.name}</a></h3><p>{placeDescription(place,language)}</p>
      <span className="finder-reason">{time?label(`${visitingTimeLabel(time,language)} · ${time.n}명 후기 참고`,`${visitingTimeLabel(time,language)} · ${time.n} responses`):reviewed?label(`최근 후기 ${place.count}명 참고`,`Recent feedback from ${place.count} visitors`):label('공개 정보로 고른 탐색 후보 · 조용함 후기 대기','A match from published information · quietness unrated')}</span>
      {(preferences.day!=='any'||preferences.time!=='any')&&!time&&<span className="finder-note">{label('선택한 시간대의 충분한 후기가 아직 없어요.','Not enough feedback for your selected visiting time yet.')}</span>}
      {preferences.party==='solo'&&<span className="finder-note">{label('1인 이용·좌석 조건은 상세 정보에서 확인하세요.','Check solo-visit and seating conditions in the details.')}</span>}
      </div></article>)}{!results.length&&<p className="finder-empty">{label('조건에 맞는 정보가 아직 없어요. 입장료·공간 조건을 넓히거나 다른 지역을 선택해 주세요.','No matches with confirmed information yet. Broaden your choices or choose another region.')}</p>}</div>}
    <p className="finder-note">{label('조용함은 방문 후기로 확인해요. 입장료에는 식음료·주차·이동 비용이 포함되지 않으며, 주변 검색은 직선거리 기준이에요.','Quietness is based on visitor feedback. Admission excludes food, parking and travel costs. Nearby distances are straight-line distances.')}</p>
  </section>;
}
