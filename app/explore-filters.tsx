'use client';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Checkbox} from '@/components/ui/checkbox';
import {type ExploreFilters,emptyFilters} from '@/lib/explore-filters';
import {useLocale} from './locale';
import {conditionKeys,conditionLabels} from '@/lib/rest-conditions';

export default function Filters({open,onOpenChange,value,onChange,total,plus,eligible,onPlus}:{
 open:boolean;onOpenChange:(open:boolean)=>void;value:ExploreFilters;
 onChange:(value:ExploreFilters)=>void;total:number;plus:boolean;eligible:number;onPlus:()=>void;
}){
 const {text}=useLocale();
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="nhp-modal browse-filters">
  <DialogTitle className="modal-title">{text('Find your kind of place','나에게 맞는 장소 찾기')}</DialogTitle>
  <DialogDescription>{text('Narrow the current results. Basic filters are free.','현재 검색 결과를 좁혀보세요. 기본 필터는 무료예요.')}</DialogDescription>
  <fieldset className="filter-options"><legend>{text('Free filters','무료 필터')}</legend>
   <label><Checkbox checked={value.photos} onCheckedChange={v=>onChange({...value,photos:v===true})}/><span><strong>{text('With photos','사진 있는 장소')}</strong><small>{text('See the setting before you go.','방문 전 실제 공간을 살펴보세요.')}</small></span></label>
   <label><Checkbox checked={value.reviewed} onCheckedChange={v=>onChange({...value,reviewed:v===true})}/><span><strong>{text('With visitor reviews','방문 후기 있는 장소')}</strong><small>{text('At least one account review in the last 90 days.','최근 90일 계정 방문 후기가 1건 이상인 곳이에요.')}</small></span></label>
   <label><Checkbox checked={value.quiet} onCheckedChange={v=>onChange({...value,quiet:v===true})}/><span><strong>{text('80% rated quiet · free','조용함 응답 80% 이상 · 무료')}</strong><small>{text('At least 3 recent account reviewers.','최근 90일 계정 평가 3명 이상 · 후기 수를 함께 표시해요.')}</small></span></label>
  </fieldset>
  {eligible===0&&<p className="filter-data-note">{text('No places meet the quietness threshold in this selection yet.','현재 선택에서 조용함 기준을 충족한 장소는 아직 없어요. 조건을 넓혀볼 수 있어요.')}</p>}
  <fieldset className="filter-options"><legend>{text('Conditions for your pause · free','내 쉼의 조건 · 무료')}</legend>{conditionKeys.map(key=><label key={key}><Checkbox checked={value[key]} onCheckedChange={v=>onChange({...value,[key]:v===true})}/><span><strong>{text(conditionLabels[key][1],conditionLabels[key][0])}</strong></span></label>)}</fieldset>
  <p className="filter-data-note">{text('Matches need published evidence or at least 3 recent account reports. Unknown conditions are excluded.','자료에 안내된 조건 또는 최근 90일 계정 후기 3건 이상을 참고해요. 미확인 조건은 검색에 포함하지 않습니다.')}</p>
  <div className="filter-actions"><button className="text-button" onClick={()=>onChange({...emptyFilters})}>{text('Reset filters','필터 초기화')}</button><button className="primary" onClick={()=>onOpenChange(false)}>{text(`Show ${total} ${total===1?'place':'places'}`,`${total}곳 보기`)}</button></div>
 </DialogContent></Dialog>;
}
