import type {Place} from '@/lib/catalog';
import {placeIdentity,essentialDetails,conciseText} from '@/lib/place-presentation';
export default function PlaceSummary({place,language}:{place:Place;language:'ko'|'en'}){
 const ko=language==='ko',facts=essentialDetails(place).slice(0,1);
 return <span className="place-preview" data-original-language><span className="quiet-place-description">{placeIdentity(place,language)}</span><span className="place-fact-chips">{facts.map(fact=><span key={fact.labelEn}>{ko?fact.labelKo:fact.labelEn} · {conciseText(ko?fact.textKo:fact.textEn,ko?65:110)}</span>)}</span></span>;
}
