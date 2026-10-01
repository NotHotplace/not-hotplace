import type {Place} from './catalog';
import type {RestRecord} from './rest-journal';
export function storySelection(records:RestRecord[],selected:string[],places:Place[]){
 return [...new Set(selected)].slice(0,3).flatMap(id=>{const record=records.find(r=>r.placeId===id),place=places.find(p=>p.id===id);return record&&place?[{record,place}]:[];});
}
export function storyCaption(record:RestRecord,language:'ko'|'en',includeNoise:boolean){
 const ko=language==='ko';let label=record.state==='visited'?(ko?'내가 남긴 쉼 기록':'A pause I recorded'):(ko?'다음에 가보고 싶은 곳':'A place to explore next');
 if(includeNoise&&record.state==='visited'&&record.noise)label+=' · '+(ko?record.noise:({조용함:'Quiet',보통:'Moderate',시끄러움:'Loud'})[record.noise]);
 return label;
}
