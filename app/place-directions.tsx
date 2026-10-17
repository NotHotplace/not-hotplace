'use client';
import {useId, useRef, useState} from 'react';
import {directionLinks, hasSourcedCoordinates, travelModes, type DirectionPlace, type TravelMode} from '@/lib/place-directions';
import {trackEngagement} from '@/lib/engagement-client';
import {recordPause} from '@/lib/rest-journal';

export default function PlaceDirections({place, language, id}: {place: DirectionPlace; language: 'ko' | 'en'; id?: string}) {
  const [mode, setMode] = useState<TravelMode>('driving');
  const group = useId();
  const panel = useRef<HTMLDetailsElement>(null);
  const ko = language === 'ko';
  const text = (kr: string, en: string) => ko ? kr : en;
  const names = {driving: text('차량', 'Drive'), walking: text('도보', 'Walk'), transit: text('대중교통', 'Transit')};
  const providers = {naver: text('네이버지도', 'Naver Map'), kakao: text('카카오맵', 'Kakao Map'), google: text('Google 지도', 'Google Maps')};
  const links = directionLinks(place, mode);
  const routed = links.filter(link => link.kind === 'route');
  const fallback = links.filter(link => link.kind !== 'route');
  const sourced = hasSourcedCoordinates(place);
  const opened = () => {trackEngagement('map_open', place.country || 'KR'); recordPause({placeId: place.id, state: 'planned', at: Date.now()});};
  return <details className="place-directions" id={id} ref={panel}>
    <summary>{text('길 찾기 · 이동수단 선택', 'Directions · choose travel mode')}</summary>
    <div className="directions-body">
      <fieldset><legend>{text('어떻게 가실까요?', 'How will you travel?')}</legend><div className="directions-modes">{travelModes.map(value => <label key={value}><input type="radio" name={group} value={value} checked={mode === value} onChange={() => setMode(value)}/><span>{names[value]}</span></label>)}</div></fieldset>
      <p>{text('지도 앱에서 출발지와 경로·소요시간을 확인하세요. 이 길찾기 링크는 현재 위치를 요청하거나 전달하지 않아요.', 'Choose your origin and check routes and travel times in the map app. These directions links do not request or send your current location.')}</p>
      <p className="directions-location-note">{sourced ? place.locationInfo?.kind === 'entrance'
        ? text('출처에 안내된 입구 좌표예요. 현재 출입 가능 여부를 확인하세요.', 'Coordinates identify a sourced entrance. Check current access.')
        : text('장소 기준점이며 입구 좌표가 아니에요. 지도에서 실제 입구를 확인하세요.', 'This is a place reference point, not an entrance. Check the actual entrance in maps.')
        : text('정확한 입구 좌표를 확인하지 못해 장소명·주소로 찾아요. 지도에서 목적지를 확인하세요.', 'An exact entrance has not been verified. Look up the name and address, then confirm the destination in maps.')}</p>
      {sourced && place.locationInfo && <p><a href={place.locationInfo.source} target="_blank" rel="noopener noreferrer">{text('좌표 출처', 'Coordinate source')} ↗</a> · {text('확인일 ', 'Checked ')}<time dateTime={place.locationInfo.checked}>{place.locationInfo.checked}</time></p>}
      <div className="directions-links">{routed.map(link => <a key={link.provider} href={link.href} target={link.appOnly ? undefined : '_blank'} rel="noopener noreferrer" onClick={opened}>{providers[link.provider]} · {names[mode]}{link.appOnly ? text(' (앱)', ' (app)') : ' ↗'}</a>)}</div>
      {!!fallback.length && <details className="directions-fallback" open={!sourced}><summary>{text('웹에서 열기 / 앱이 없나요?', 'Open on the web / no app?')}</summary><p>{text('아래 링크에서는 지도에서 이동수단을 다시 선택하세요.', 'Choose your travel mode again in maps using these links.')}</p><div className="directions-links">{fallback.map(link => <a key={link.provider} href={link.href} target="_blank" rel="noopener noreferrer" onClick={opened}>{providers[link.provider]} · {link.kind === 'search' ? text('장소 검색', 'Find place') : text('목적지 열기', 'Open destination')} ↗</a>)}</div></details>}
      <p className="directions-footnote">{text('지원 경로는 지역·지도 서비스에 따라 달라요. 앱은 자체 위치 권한을 사용할 수 있어요.', 'Route availability varies by region and provider. Map apps may use their own location permissions.')}</p>
      <button type="button" className="directions-close" onClick={() => {if(panel.current){panel.current.open = false; panel.current.querySelector('summary')?.focus();}}}>{text('닫기', 'Close')}</button>
    </div>
  </details>;
}
