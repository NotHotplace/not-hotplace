'use client';
import {useLocale} from './locale';

import {useEffect,useRef,useState,type CSSProperties,type MouseEvent} from 'react';
import {ArrowLeft,ArrowUpRight,Maximize2,MapPin,X,Coffee,Utensils,Car} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import geometry from '@/lib/korea-map.json';
import {regionKeys,inRegion,regionOf} from '@/lib/regions';
import {ranked} from '@/lib/ranking';
import {labels,type Place} from '@/lib/catalog';

export type MapPlace=Place&{count:number;positive:number;quiet:number;latest:number|null;resting?:boolean};
const callouts:Record<string,[number,number]>={
 '서울':[173,118],'인천':[120,179],'세종':[185,250],'대전':[205,340],
 '광주':[164,455],'울산':[583,415],'부산':[557,492],'대구':[586,330],
};
const majorLabels=new Set(['서울','강원','충남','전북','전남','경북','경남','제주']);
const mapSource='https://github.com/southkorea/southkorea-maps';
const categoryIcon=(type:string)=>type==='cafe'?<Coffee size={19}/>:type==='food'?<Utensils size={19}/>:<Car size={19}/>;

type Props={
 places:MapPlace[];city:string;compact:boolean;
 onEnter:(city:string)=>void;onOpen:(place:MapPlace)=>void;onResults:()=>void;
};

export default function DiscoveryMap({places,city,compact,onEnter,onOpen,onResults}:Props){
 const {ui}=useLocale();
 const [open,setOpen]=useState(false),[hover,setHover]=useState(''),[revealed,setRevealed]=useState(false);
 const [motion,setMotion]=useState<CSSProperties>({});
 const trigger=useRef<HTMLButtonElement>(null),closeAction=useRef<'preview'|'results'|'place'>('preview');
 const active=geometry.regions.find(r=>r.name===regionOf(city));
 const counts=Object.fromEntries(regionKeys.map(r=>[r,places.filter(p=>inRegion(p,r)).length]));
 const matches=places.filter(p=>inRegion(p,city));
 const ranking=ranked(matches),order=new Map(ranking.map((p,i)=>[p.id,i]));
 const previews=[...matches].sort((a,b)=>(order.get(a.id)??1e6)-(order.get(b.id)??1e6)||Number(!!a.resting)-Number(!!b.resting)||Number(!!b.image)-Number(!!a.image)).slice(0,2);
 const scale=active?Math.min(4.5,Math.max(1.5,Math.min(520/(active.bounds[1][0]-active.bounds[0][0]),470/(active.bounds[1][1]-active.bounds[0][1])))):1;
 const zoom=active?`translate(360 350) scale(${scale}) translate(${-active.center[0]} ${-active.center[1]})`:'translate(0 0) scale(1)';

 useEffect(()=>{
  if(!open){setRevealed(false);return;}
  let next=0;
  const first=requestAnimationFrame(()=>{next=requestAnimationFrame(()=>setRevealed(true));});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(next);};
 },[open]);

 function prepare(event:MouseEvent<HTMLButtonElement>){
  const box=event.currentTarget.getBoundingClientRect();
  setMotion({
   '--atlas-x':`${box.left+box.width/2-window.innerWidth/2}px`,
   '--atlas-y':`${box.top+box.height/2-window.innerHeight/2}px`,
   '--atlas-scale':String(Math.max(.25,Math.min(.85,box.width/(window.innerWidth-24)))),
  } as CSSProperties);
  closeAction.current='preview';
  const region=(event.target as Element).closest('[data-region]')?.getAttribute('data-region');
  if(region&&regionKeys.some(r=>r===region))onEnter(region);
 }
 function choose(name:string){setHover('');onEnter(name);}
 function showResults(){onEnter(city);closeAction.current='results';setOpen(false);}
 function showPlace(place:MapPlace){closeAction.current='place';setOpen(false);onOpen(place);}

 function map(interactive:boolean){
  const enlarged=interactive&&revealed;
  return <svg viewBox="20 0 680 710" className="atlas-svg" role={interactive?'group':undefined} aria-label={interactive?'대한민국 지역 선택 지도':undefined} aria-hidden={!interactive}>
   {interactive&&<><title>대한민국 지역 선택 지도</title><desc>지역을 누르면 확대됩니다. 아래 장소를 바로 열거나 장소 목록으로 이동할 수 있습니다.</desc></>}
   <g className="atlas-geography" transform={interactive?(enlarged?zoom:'translate(0 0) scale(1)'):zoom}>
    {geometry.regions.map(r=><path key={r.code} data-region={r.name} d={r.path}
      className={'atlas-province '+(active?.name===r.name?'is-selected ':'')+(hover===r.name?'is-hovered':'')}
      {...(interactive?{tabIndex:active?(active.name===r.name?0:-1):0,role:'button','aria-pressed':active?.name===r.name,'aria-label':`${r.name}, ${counts[r.name]||0}곳`,onMouseEnter:()=>setHover(r.name),onMouseLeave:()=>setHover(''),onFocus:()=>setHover(r.name),onBlur:()=>setHover(''),onClick:()=>choose(r.name),onKeyDown:(e:React.KeyboardEvent<SVGPathElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(r.name);}}}:{})}
    />)}
    {geometry.regions.map(r=>{const anchor=callouts[r.name]||r.center;return <g key={r.name} className={'atlas-label '+(majorLabels.has(r.name)?'major':'')} aria-hidden="true" style={active?{opacity:0,pointerEvents:'none'}:undefined}>
      {callouts[r.name]&&<path d={`M${r.center[0]},${r.center[1]} L${anchor[0]},${anchor[1]}`} className="atlas-leader"/>}
      <text data-region={r.name} x={anchor[0]} y={anchor[1]} textAnchor="middle" dominantBaseline="central" onClick={interactive?()=>choose(r.name):undefined}>{r.name}</text>
     </g>;})}
   </g>
  </svg>;
 }

 return ui(<Dialog open={open} onOpenChange={v=>{if(v)closeAction.current='preview';setOpen(v);}}>
  <section className={'atlas-preview-wrap '+(compact?'is-compact ':'')+(active?'has-region':'')} aria-label="확대 가능한 전국 지도">
   <DialogTrigger asChild><button ref={trigger} className="atlas-preview" onClick={prepare} aria-label={`${city} 지도를 화면 가득 크게 보기`}>
    <span className="atlas-preview-head"><span><MapPin size={16}/>{city==='전국'?'전국에서 찾기':city}</span><span className="atlas-expand-icon"><Maximize2 size={17}/></span></span>
    <span className="atlas-preview-canvas">{map(false)}{active&&<span className="atlas-preview-name">{city}</span>}</span>
    <span className="atlas-preview-foot"><span>눌러서 크게 보기</span><ArrowUpRight size={18}/></span>
   </button></DialogTrigger>
  </section>
  <DialogContent className="atlas-dialog" showCloseButton={false} style={motion}
   onCloseAutoFocus={e=>{if(closeAction.current==='results'){e.preventDefault();onResults();}else if(closeAction.current==='place'){e.preventDefault();}}}>
   <header className="atlas-header"><div className="atlas-heading"><span className="atlas-wordmark">Not<span>_</span>Hotplace</span><DialogTitle>어디에서 쉴까요?</DialogTitle><DialogDescription className="sr-only">지역을 선택해 음식점, 카페, 드라이브 장소를 둘러보세요.</DialogDescription></div>
    <div className="atlas-header-actions"><Select value={city} onValueChange={choose}><SelectTrigger className="atlas-region-picker" aria-label="큰 지도 지역 선택"><SelectValue/></SelectTrigger><SelectContent position="popper">{['전국','청주',...regionKeys].map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><DialogClose asChild><button className="atlas-close" aria-label="큰 지도 닫기"><X size={21}/></button></DialogClose></div>
   </header>
   <div className={'atlas-stage '+(active?'has-region':'')}>
    {active&&<button className="atlas-back" onClick={()=>choose('전국')}><ArrowLeft size={16}/>전국</button>}
    {map(true)}
    {active&&<div className="atlas-focus" key={city}><span>지금, 이곳에서</span><strong>{city}</strong></div>}
    <div className="atlas-caption"><span aria-live="polite">{hover?`${hover} · ${counts[hover]||0}곳`:active?'선택한 지역의 장소를 살펴보세요':'마음이 가는 지역을 눌러보세요'}</span><a href={mapSource} target="_blank" rel="noopener noreferrer">지도 출처</a></div>
   </div>
   <div className={'atlas-dock '+(active?'with-places':'')}>
    <div className="atlas-dock-heading"><div><strong>{city==='전국'?'전국의 쉼터':city+'의 쉼터'}</strong><span>{matches.length}곳{matches.length===0?' · 검색 조건을 확인해 주세요':''}</span></div><button className="atlas-results-link" onClick={showResults}>{active?'장소 모두 보기':'목록으로 보기'}<ArrowUpRight size={17}/></button></div>
    {active&&previews.length>0&&<div className="atlas-peeks">{previews.map(p=><button className="atlas-peek" key={p.id} onClick={()=>showPlace(p)} aria-label={`${p.name} 상세 정보 보기`}><span className="atlas-peek-image">{p.image?<img src={p.image} alt=""/>:categoryIcon(p.category)}</span><span className="atlas-peek-copy"><span>{labels[p.category]}{p.resting?' · 최근 혼잡':''}</span><strong>{p.name}</strong><span>{p.count?`${Math.round(p.positive/p.count*100)}% 만족 · ${p.count}명`:'아직 후기가 없어요'}</span></span><ArrowUpRight size={16}/></button>)}</div>}
   </div>
  </DialogContent>
 </Dialog>);
}
