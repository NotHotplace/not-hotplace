import type {Place} from '@/lib/catalog';
export default function VisitReadiness({place,language}:{place:Place;language:'ko'|'en'}){
 const ko=language==='ko',label=(kr:string,en:string)=>ko?kr:en;
 const checks=[{ko:'운영 시간',en:'Hours',match:/hours|opening/i},{ko:'휴무·브레이크',en:'Closures / breaks',match:/closed|closure|break/i},{ko:'주차',en:'Parking',match:/parking/i},{ko:'입구·접근',en:'Entrance / access',match:/entrance|access|directions/i}];
 return <section className="visit-readiness"><h3>{label('출발 전, 이 네 가지만','Four checks before leaving')}</h3><dl>{checks.map(c=>{const detail=place.visitDetails?.find(d=>c.match.test(d.labelEn));return <div key={c.en}><dt>{ko?c.ko:c.en}</dt><dd>{detail?(ko?detail.textKo:detail.textEn):label('아직 확인되지 않았어요 · 출처에서 확인','Not confirmed · check the source')}</dd></div>;})}</dl>
 {place.locationInfo&&<p>{label('지도 기준점 확인: ','Map reference checked: ')}{place.locationInfo.checked} · <a href={place.locationInfo.source} target="_blank" rel="noopener noreferrer">{label('위치 출처','Location source')}</a><br/>{place.locationInfo.kind==='reference'?label('장소 주변 기준점입니다. 입구·주차장 위치는 출처에서 확인하세요.','This is a reference point near the place. Check the source for entrances and parking.'):label('출처에 안내된 입구 기준입니다.','Based on the entrance identified in the source.')}</p>}
 <a href={place.source} target="_blank" rel="noopener noreferrer">{label('최신 운영·이용 안내 확인','Check the latest visitor information')} ↗</a>
 </section>;
}
