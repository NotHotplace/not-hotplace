import type {Place} from '@/lib/catalog';
import {candidateReasons,conciseText} from '@/lib/place-presentation';
export default function PlaceReasons({place,language,compact=false}:{place:Place;language:'ko'|'en';compact?:boolean}){
 const ko=language==='ko',reasons=candidateReasons(place).slice(0,compact?1:2);
 if(!reasons.length)return <p className="candidate-incomplete">{ko?'기본 소개 · 방문 조건 확인 중':'Basic listing · visitor details pending'}</p>;
 return <section className={'place-reasons '+(compact?'compact':'')}><h3>{ko?'이 후보를 고른 이유':'Why this candidate'}</h3><ul>{reasons.map((reason,i)=><li key={i}><span>{compact?conciseText(ko?reason.textKo:reason.textEn,ko?70:130):(ko?reason.textKo:reason.textEn)}</span><details><summary>{ko?'근거 보기':'View evidence'}</summary><p>{ko?reason.textKo:reason.textEn}</p><a href={reason.source} target="_blank" rel="noopener noreferrer">{reason.sourceKind==='visitor-impression'?(ko?'방문자 의견 출처':'Visitor report source'):reason.sourceKind==='official'?(ko?'운영기관 출처':'Operator source'):(ko?'공개 자료 출처':'Published source')} ↗</a><small>{ko?'자료 확인 ':'Checked '}{reason.checked}</small></details></li>)}</ul></section>;
}
