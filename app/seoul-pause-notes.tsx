import {seoulPauseFor} from '@/lib/seoul-pause';
export default function SeoulPauseNotes({id,language}:{id:string;language:'ko'|'en'}){
 const entry=seoulPauseFor(id);if(!entry)return null;
 const ko=language==='ko',label=(kr:string,en:string)=>ko?kr:en;
 return <div className="seoul-pause-notes">
  <p className="seoul-pause-hook">{label(entry.hookKo,entry.hookEn)}</p>
  <p className="seoul-pause-fit">{label(entry.fitKo,entry.fitEn)}</p>
  <p className="seoul-pause-caution">{label(entry.cautionKo,entry.cautionEn)}</p>
  <details className="guide-card-notes"><summary>{label('확인한 내용과 아직 모르는 것','What we checked, what is unknown')}</summary>
   <p className="guide-source">{label('공개 자료 확인','Published sources checked')} · <time dateTime={entry.checked}>{entry.checked}</time></p>
   <dl className="seoul-evidence-list">{entry.sources.map(source=><div key={source.url}><dt>{source.kind==='operator'?label('운영기관 안내','Operator information'):label('공식 관광 안내','Official tourism information')}</dt><dd>{label(source.factsKo,source.factsEn)} <a href={source.url} target="_blank" rel="noopener noreferrer">{label(source.labelKo,source.labelEn)} ↗</a></dd></div>)}</dl>
   <p><strong>{label('미확인','Unknown')}</strong> · {label(entry.unknownKo,entry.unknownEn)}</p>
   <p className="guide-source">{label('이 선정은 공개 자료를 바탕으로 한 편집 제안입니다. 직접 방문 검증·소음 측정은 하지 않았습니다. 익명 후기는 별도의 방문자 의견이며 현장 검증으로 취급하지 않습니다.','These editorial suggestions use published sources. We have not made a verification visit or measured sound. Anonymous feedback is a separate visitor report, not field verification.')}</p>
  </details>
 </div>;
}
