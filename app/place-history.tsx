import {historyForPlace} from '@/lib/place-history';
export default function PlaceHistory({id,language}:{id:string;language:'ko'|'en'}){
 const history=historyForPlace(id);if(!history)return null;
 const ko=language==='ko';
 return <section className="place-history" aria-label={ko?'이 장소의 역사':'This place’s history'}>
  <p className="place-history-hook">{ko?history.hookKo:history.hookEn}</p>
  <details className="guide-card-notes"><summary>{ko?'이 장소의 역사':'This place’s history'}</summary>
   <ul>{history.facts.map((fact,index)=><li key={index}>{ko?fact.ko:fact.en}</li>)}</ul>
   <p className="guide-source"><a href={history.source} target="_blank" rel="noopener noreferrer">{ko?history.sourceKo:history.sourceEn} ↗</a> · {ko?'자료 확인':'Source checked'} <time dateTime={history.checked}>{history.checked}</time></p>
  </details>
 </section>;
}
