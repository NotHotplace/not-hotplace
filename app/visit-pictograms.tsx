import {Car,CircleHelp,Coins,Armchair} from 'lucide-react';
import type {Place} from '@/lib/catalog';
import {visitFacts} from '@/lib/visit-facts';

export default function VisitPictograms({place,language,compact=false}:{place:Place;language:'ko'|'en';compact?:boolean}){
 const f=visitFacts(place),ko=language==='ko',label=(kr:string,en:string)=>ko?kr:en;
 if(compact&&!f.price&&!f.parking&&!f.seating)return null;
 const title=(x:{source:string;checked:string;textKo:string;textEn:string})=>(ko?x.textKo:x.textEn)+' · '+x.checked;
 return <span className={'visit-pictograms '+(compact?'is-compact':'')} role="group" aria-label={label('가격·주차·좌석 안내','Price, parking and seating')}>
  {(f.price||!compact)&&<span className="visit-picto" title={f.price?title(f.price):label('공개 가격을 확인하지 못했어요','No verified public price')}><Coins aria-hidden="true" size={18}/><span>{f.price?(ko?f.price.textKo:f.price.textEn):label('가격 확인 중','Price unknown')}</span></span>}
  {(f.parking||!compact)&&<span className={'visit-picto parking-'+(f.parking?.status||'unknown')} title={f.parking?title(f.parking):label('주차 정보가 없어요. 주차 불가를 뜻하지 않습니다.','Parking is unknown, rather than unavailable.')}><span className="parking-symbol"><Car aria-hidden="true" size={20}/>{f.parking?.status==='unavailable'&&<span className="parking-cross" aria-hidden="true">×</span>}{!f.parking&&<CircleHelp aria-hidden="true" size={11}/>}</span><span>{f.parking?label({available:'주차 가능',unavailable:'주차 불가',nearby:'인근 주차'}[f.parking.status],{available:'Parking available',unavailable:'No parking',nearby:'Nearby parking'}[f.parking.status]):label('주차 확인 중','Parking unknown')}</span></span>}
  {(f.seating||!compact)&&<span className="visit-picto seating-picto" title={f.seating?title(f.seating):label('좌석 구성을 확인하지 못했어요','Seating arrangement unknown')}><span className="seating-symbol" aria-hidden="true">{f.seating?<>{f.seating.solo&&<Armchair size={17}/>} {f.seating.solo&&f.seating.group&&<b>·</b>}{f.seating.group&&Array.from({length:Math.min(f.seating.groupSizes[0]||4,6)},(_,i)=><Armchair size={17} key={i}/>)}{(f.seating.groupSizes[0]||0)>6&&<b>+</b>}</>:<><Armchair size={17}/><CircleHelp size={11}/></>}</span><span>{f.seating?[f.seating.solo?label('1인석','Individual seats'):'',f.seating.group?(f.seating.groupSizes.length?f.seating.groupSizes.join('/')+label('인석','-seat tables'):label('다인석','Shared seating')):''].filter(Boolean).join(' · '):label('좌석 확인 중','Seating unknown')}</span></span>}
 </span>;
}
