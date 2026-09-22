'use client';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Checkbox} from '@/components/ui/checkbox';
import {type ExploreFilters,emptyFilters} from '@/lib/explore-filters';
import {useLocale} from './locale';

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
   <label><Checkbox checked={value.reviewed} onCheckedChange={v=>onChange({...value,reviewed:v===true})}/><span><strong>{text('With visitor reviews','방문 후기 있는 장소')}</strong><small>{text('At least one review in the last 90 days.','최근 90일 방문 후기가 1건 이상인 곳이에요.')}</small></span></label>
  </fieldset>
  <section className="filter-plus"><span className="filter-plus-label">PLUS</span><h3>{text('80% rated quiet','조용함 응답 80% 이상')}</h3>
   <p>{text('At least 3 recent reviewers. Review counts always stay visible.','최근 평가 3명 이상인 장소를 골라요. 후기 수도 함께 표시합니다.')}</p>
   {eligible===0?<p className="filter-data-note">{text('This region needs more reviews before this filter is useful. Explore the free collection first.','이 지역은 후기가 더 모여야 이 필터를 사용할 수 있어요. 먼저 무료로 장소를 둘러보세요.')}</p>:plus?<label className="ack"><Checkbox checked={value.quiet} onCheckedChange={v=>onChange({...value,quiet:v===true})}/>{text('Show places rated quiet','조용함 기준을 충족한 곳만 보기')}</label>:<button className="secondary" onClick={onPlus}>{text('See Plus features','Plus 기능 보기')}</button>}
  </section>
  <div className="filter-actions"><button className="text-button" onClick={()=>onChange({...emptyFilters})}>{text('Reset filters','필터 초기화')}</button><button className="primary" onClick={()=>onOpenChange(false)}>{text(`Show ${total} ${total===1?'place':'places'}`,`${total}곳 보기`)}</button></div>
 </DialogContent></Dialog>;
}
