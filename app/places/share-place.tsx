'use client';
import type {CountryCode} from '@/lib/countries';
import {useState} from 'react';
import {trackEngagement} from '@/lib/engagement-client';
import {Share2, Check} from 'lucide-react';
import type {PlaceLanguage} from '@/lib/place-links';

export default function SharePlace({name, path, language, country}: {name: string; path: string; language: PlaceLanguage; country?: CountryCode}) {
  const [state, setState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const [url, setUrl] = useState('');
  const ko = language === 'ko';
  async function share() {
    const absolute = new URL(path, window.location.origin).href;
    setUrl(absolute);
    try {
      if (navigator.share) {await navigator.share({title: `${name} · NotHotplace`, url: absolute}); if(country)trackEngagement('share',country); return;}
      if (navigator.clipboard) {await navigator.clipboard.writeText(absolute); setState('copied'); if(country)trackEngagement('share',country); return;}
    } catch (error) {if (error instanceof Error && error.name === 'AbortError') return;}
    setState('fallback');
  }
  return <div className="place-share"><button className="place-secondary" type="button" onClick={share}>
    {state === 'copied' ? <Check size={18}/> : <Share2 size={18}/>}{state === 'copied' ? (ko ? '링크를 복사했어요' : 'Link copied') : (ko ? '친구에게 공유' : 'Share this place')}
  </button><span className="sr-only" aria-live="polite">{state === 'copied' ? (ko ? '링크를 복사했어요' : 'Link copied') : ''}</span>
    {state === 'fallback' && <label>{ko ? '링크를 복사해 공유해 주세요.' : 'Copy this link to share.'}<input aria-label={ko ? '공유 링크' : 'Share link'} value={url} readOnly onFocus={event => event.target.select()}/></label>}
  </div>;
}
