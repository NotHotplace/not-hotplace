'use client';
import type {CountryCode} from '@/lib/countries';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Bookmark, Check, MapPin, MessageCircle, ArrowUpRight} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import type {PlaceExperience} from '@/lib/place-experience';
import type {PlaceLanguage} from '@/lib/place-pages';
import {trackEngagement} from '@/lib/engagement-client';
import QuickFeedback from '../quick-feedback';
import RestEvidence from '../rest-evidence';
import {findCatalogPlace} from '@/lib/place-pages';
import {recordPause} from '@/lib/rest-journal';
import SharePlace from './share-place';
import {visitingTimeLabel} from '@/lib/rest-finder';

const emptyReview = {day: '', time: '', noise: '', crowd: '', comfort: '', satisfaction: '', tags: [] as string[]};
const questions = [
  {key: 'day', ko: '방문 요일', en: 'When did you visit?', options: [['평일','Weekday'],['주말·공휴일','Weekend / holiday']]},
  {key: 'time', ko: '방문 시간', en: 'Time of day', options: [['오전','Morning'],['오후','Afternoon'],['저녁','Evening']]},
  {key: 'noise', ko: '주변은 조용했나요?', en: 'How was the noise?', options: [['조용함','Quiet'],['보통','Moderate'],['시끄러움','Loud']]},
  {key: 'crowd', ko: '얼마나 붐볐나요?', en: 'How crowded was it?', options: [['여유로움','Uncrowded'],['보통','Moderate'],['붐빔','Crowded']]},
  {key: 'comfort', ko: '혼자 쉬기 편했나요?', en: 'Comfortable on your own?', options: [['편함','Comfortable'],['보통','Neutral'],['불편함','Uncomfortable'],['해당 없음','Not applicable']]},
  {key: 'satisfaction', ko: '전체적으로 만족했나요?', en: 'Satisfied with your visit?', options: [['만족','Satisfied'],['아쉬움','Disappointed']]},
] as const;

export default function PlaceInteractions({id, name, language, country, path, mapUrl}: {
  id: string; name: string; language: PlaceLanguage; country: CountryCode; path: string; mapUrl: string;
}) {
  const ko = language === 'ko', label = (en: string, kr: string) => ko ? kr : en;
  const [data, setData] = useState<PlaceExperience | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false), [open, setOpen] = useState(false), [formError, setFormError] = useState('');
  const [review, setReview] = useState({...emptyReview});
  const counted = useRef(false);
  const login = `/login?lang=${language}&next=${encodeURIComponent(path + '#reviews')}`;
  const load = useCallback(async () => {
    const response = await fetch(`/api/places/${encodeURIComponent(id)}`, {cache: 'no-store'});
    if (!response.ok) throw new Error('load');
    const next = await response.json() as PlaceExperience;
    setData(next); setError(''); return next;
  }, [id]);
  useEffect(() => {
    let live = true;
    load().catch(() => {if (live) setError(ko ? '후기를 불러오지 못했어요.' : 'Unable to load visitor reviews.');}).finally(() => {if (live) setLoading(false);});
    if (!counted.current) {counted.current = true; trackEngagement('place_view', country);}
    return () => {live = false;};
  }, [load, ko, country]);
  function editReview() {
    const mine = data?.review;
    let tags: string[] = []; try {tags = mine ? JSON.parse(mine.tags) : [];} catch {}
    setReview(mine ? {day: mine.day, time: mine.time, noise: mine.noise, crowd: mine.crowd, comfort: mine.comfort, satisfaction: mine.satisfied ? '만족' : '아쉬움', tags} : {...emptyReview, tags: []});
    setFormError(''); setOpen(true); trackEngagement('review_start',country);
  }
  async function mutate(action: 'save'|'review'|'deleteReview', payload: Record<string, unknown>) {
    setBusy(true); setNotice(''); setFormError('');
    try {
      const response = await fetch('/api/action', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action, payload: {placeId: id, ...payload}})});
      if (!response.ok) {
        if (response.status === 401) {setData(current => current ? {...current, signedIn: false} : current); throw new Error(label('Please sign in again. Your choices are still here.', '로그인이 만료됐어요. 선택 내용은 유지됩니다. 다시 로그인해 주세요.'));}
        throw new Error(label('Unable to save. Please try again.', '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'));
      }
      if (action === 'save' && payload.saved) trackEngagement('save', country);
      if (action === 'review') {trackEngagement('review', country);recordPause({placeId:id,state:'visited',at:Date.now(),noise:review.noise as '조용함'|'보통'|'시끄러움',day:review.day,time:review.time});}
      if (action === 'save') setData(current => current ? {...current, saved: !!payload.saved} : current);
      if (action !== 'save') setOpen(false);
      setNotice(action === 'deleteReview' ? label('Your review was deleted.', '내 후기를 삭제했어요.') : action === 'save' && !payload.saved ? label('Removed from saved places.', '저장을 취소했어요.') : label('Saved.', '저장했어요.'));
      try {await load();} catch {setError(label('Saved, but the latest summary could not load. Try reloading.', '저장은 완료됐지만 최신 요약을 불러오지 못했어요. 다시 불러와 주세요.'));}
    } catch (e) {const message = e instanceof Error ? e.message : label('Please try again.', '다시 시도해 주세요.'); setFormError(message); setNotice(message);}
    finally {setBusy(false);}
  }
  const summary = data?.summary;
  return <aside className="place-action-card place-interactions" id="reviews">
    <span className="place-eyebrow">{label('VISITOR EXPERIENCES', '방문자들이 기록한 쉼')}</span>
    <h2>{label('How did it feel?', '잘 쉬어갈 수 있을까요?')}</h2>
    <QuickFeedback id={id} country={country} language={language}/>
    {loading && <p role="status">{label('Loading recent reviews…', '최근 후기를 불러오는 중…')}</p>}
    {error && <div className="place-feedback" role="alert"><p>{error}</p><button className="place-secondary" disabled={busy} onClick={() => {setLoading(true);load().catch(() => {}).finally(() => setLoading(false));}}>{label('Reload reviews', '후기 다시 불러오기')}</button></div>}
    {!error && summary && <>
      {summary.count ? <div className="place-review-metrics">{[
        [label('Quiet', '조용했다'), summary.quiet], [label('Uncrowded', '여유로웠다'), summary.relaxed], [label('Satisfied', '만족했다'), summary.positive],
      ].map(([title, value]) => <div key={title}><strong>{Math.round(Number(value) / summary.count * 100)}<small>%</small></strong><span>{title}</span></div>)}</div> : <p className="place-review-empty">{label('Be the first to share how it felt. Quietness has not been rated yet.', '아직 조용함을 평가한 후기가 없어요. 방문 경험을 첫 번째로 남겨주세요.')}</p>}
      <p className="place-review-context">{label(`Last 90 days · ${summary.count} reviewers`, `최근 90일 · ${summary.count}명 평가`)}{summary.count > 0 && summary.count < 3 && <strong>{label('Small sample', '표본이 적어요')}</strong>}
        {summary.latest && <span>{label('Latest response: ', '최근 평가: ')}{new Date(summary.latest).toLocaleDateString(ko ? 'ko-KR':'en-US',{timeZone:'Asia/Seoul'})}</span>}
      </p>
      {data?.resting && <p className="place-feedback">{label('Recent crowding or noise reports have paused this place in recommendations.', '최근 혼잡·소음 등으로 추천을 잠시 쉬고 있어요.')}</p>}
    </>}
    {Object.values(data?.restFeedback||{}).some(n=>n>=3)&&findCatalogPlace(id)&&<RestEvidence place={{...findCatalogPlace(id)!,restFeedback:data?.restFeedback,resting:data?.resting}} language={language}/>}
    {data?.bestTime&&<p className="place-best-time">{label('A time to consider: ','참고할 방문 시간: ')}<strong>{visitingTimeLabel(data.bestTime,language)}</strong><br/>{label(`${data.bestTime.n} responses · ${Math.round(data.bestTime.quiet/data.bestTime.n*100)}% quiet · last 90 days`,`${data.bestTime.n}명 후기 · 조용했다 ${Math.round(data.bestTime.quiet/data.bestTime.n*100)}% · 최근 90일`)}</p>}
    {data?.signedIn ? <><button className="place-primary" disabled={busy || !!error} aria-pressed={data.saved} onClick={() => void mutate('save',{saved: !data.saved})}>{data.saved ? <Check size={18}/> : <Bookmark size={18}/>} {data.saved ? label('Saved · tap to remove', '저장됨 · 누르면 취소') : label('Save this place', '이 장소 저장')}</button>
      <button className="place-secondary" disabled={busy || !!error} onClick={editReview}><MessageCircle size={18}/>{data.review ? label('Edit my review', '내 후기 수정') : label('Leave a quick review', '체크로 후기 남기기')}</button></> : !loading && <a className="place-primary" href={login} onClick={()=>trackEngagement('review_login',country)}><Bookmark size={18}/>{label('Sign in to save or review', '로그인하고 저장·후기 남기기')}</a>}
    <a className="place-secondary" href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={() => {trackEngagement('map_open',country);recordPause({placeId:id,state:'planned',at:Date.now()});}}><MapPin size={18}/>{label('Open in maps', '지도에서 위치 확인')}<ArrowUpRight size={16}/></a>
    <SharePlace name={name} path={path} language={language} country={country}/>
    <p className="place-feedback" role="status" aria-live="polite">{notice}</p>
    <p className="place-review-context">{label('Visitor reports are not live crowd measurements. Each person’s latest review counts once.', '실시간 혼잡도가 아닌 방문 후기입니다. 한 사람의 최신 후기 1건만 집계해요.')}</p>
    {data?.plus && data.insights.length > 0 && <details className="place-time-details"><summary>{label('Quietness by visiting time', '시간대별 조용함')}</summary>{data.insights.map(bucket => <p key={bucket.day + bucket.time}><strong>{ko ? bucket.day + ' ' + bucket.time : (bucket.day==='평일'?'Weekday':'Weekend / holiday') + ' · ' + ({오전:'Morning',오후:'Afternoon',저녁:'Evening'} as Record<string,string>)[bucket.time]}</strong><span>{bucket.n >= 3 ? label(`${Math.round(bucket.quiet / bucket.n * 100)}% quiet · ${bucket.n} responses`, `${Math.round(bucket.quiet / bucket.n * 100)}% 조용함 · ${bucket.n}명`) : label(`More reviews needed · ${bucket.n} responses`, `후기 부족 · ${bucket.n}명`)}</span></p>)}</details>}
    <Dialog open={open} onOpenChange={value => {if (!busy) setOpen(value);}}><DialogContent className="nhp-modal place-review-dialog">
      <DialogTitle>{label('How was your pause?', '그곳에서, 잘 쉬었나요?')}</DialogTitle>
      <DialogDescription>{name} · {label('Check your answers. Updating replaces your previous review.', '글 없이 체크만. 다시 평가하면 이전 후기를 갱신해요.')}</DialogDescription>
      <form onSubmit={event => {event.preventDefault();void mutate('review',{...review,satisfied:review.satisfaction === '만족' ? 1:0});}}>
        {questions.map(question => <fieldset key={question.key}><legend>{ko ? question.ko : question.en}</legend><div className="place-review-options">{question.options.map(([value,en]) => <label key={value}><input type="radio" required name={question.key} value={value} checked={review[question.key] === value} onChange={() => setReview(current => ({...current,[question.key]:value}))}/><span>{ko ? value : en}</span></label>)}</div></fieldset>)}
        <fieldset><legend>{label('Helpful conditions · optional','좋았던 휴식 조건 · 선택')}</legend><div className="place-review-options">{[['작은 음악','Low music'],['1인석','Individual seats'],['칸막이 좌석','Partitioned seats'],['혼자 주문','Solo ordering'],['셀프 주문','Self ordering']].map(([tag,en])=><label key={tag}><input type="checkbox" checked={review.tags.includes(tag)} onChange={e=>setReview(current=>({...current,tags:e.target.checked?[...current.tags,tag]:current.tags.filter(t=>t!==tag)}))}/><span>{ko?tag:en}</span></label>)}</div></fieldset>
        {formError && <p className="place-feedback" role="alert">{formError}</p>}
        {data?.signedIn ? <div className="place-review-submit"><button className="place-primary" disabled={busy}>{busy ? label('Saving…','저장 중…') : label('Save my review','후기 저장하기')}</button>{data.review && <button className="place-secondary" type="button" disabled={busy} onClick={() => void mutate('deleteReview',{})}>{label('Delete my review','내 후기 삭제')}</button>}</div> : <a className="place-primary" href={login} onClick={()=>trackEngagement('review_login',country)}>{label('Sign in again','다시 로그인하기')}</a>}
      </form>
    </DialogContent></Dialog>
  </aside>;
}
