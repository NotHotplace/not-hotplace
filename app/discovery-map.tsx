'use client';
import {useLocale} from './locale';

import {useEffect,useRef,useState,type CSSProperties,type MouseEvent} from 'react';
import {Plus,Minus,Scan,ArrowUpRight,Maximize2,MapPin,X,Coffee,Utensils,Car,Sparkles} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import geometry from '@/lib/korea-map.json';
import {useAtlasCamera} from '@/hooks/use-atlas-camera';
import {cameraTransform,regionCamera,fullMapCamera,MIN_MAP_ZOOM,MAX_MAP_ZOOM} from '@/lib/atlas-camera';
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
const categoryIcon=(type:string)=>type==='cafe'?<Coffee size={19}/>:type==='food'?<Utensils size={19}/>:type==='spa'?<Sparkles size={19}/>:<Car size={19}/>;

type Props={
 places:MapPlace[];city:string;compact:boolean;
 onEnter:(city:string)=>void;onOpen:(place:MapPlace)=>void;onResults:()=>void;
};

export default function DiscoveryMap({places,city,compact,onEnter,onOpen,onResults}:Props){
 const {ui,text,lang}=useLocale();
 const [open,setOpen]=useState(false),[hover,setHover]=useState(''),[revealed,setRevealed]=useState(false);
 const [motion,setMotion]=useState<CSSProperties>({});
 const trigger=useRef<HTMLButtonElement>(null),closeAction=useRef<'preview'|'results'|'place'>('preview');
 const active=geometry.regions.find(r=>r.name===regionOf(city));
 const counts=Object.fromEntries(regionKeys.map(r=>[r,places.filter(p=>inRegion(p,r)).length]));
 const matches=places.filter(p=>inRegion(p,city));
 const ranking=ranked(matches),order=new Map(ranking.map((p,i)=>[p.id,i]));
 const previews=[...matches].sort((a,b)=>(order.get(a.id)??1e6)-(order.get(b.id)??1e6)||Number(!!a.resting)-Number(!!b.resting)||Number(!!b.image)-Number(!!a.image)).slice(0,2);
 const navigation=useAtlasCamera(active,open,revealed);
 const previewTransform=cameraTransform(regionCamera(active));

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
 function choose(name:string){setHover('');navigation.focus(geometry.regions.find(r=>r.name===regionOf(name)));onEnter(name);}
 function showResults(){onEnter(city);closeAction.current='results';setOpen(false);}
 function showPlace(place:MapPlace){closeAction.current='place';setOpen(false);onOpen(place);}

 function map(interactive:boolean){
  const enlarged=interactive&&revealed;
  const showLabels=interactive?navigation.camera.scale<=1.65:!active;
  return <svg viewBox="20 0 680 710" className="atlas-svg" role={interactive?'group':undefined} aria-label={interactive?'대한민국 지역 선택 지도':undefined} aria-hidden={!interactive}
    {...(interactive?{ref:navigation.svgRef,tabIndex:0,'data-animated':navigation.animated,'data-dragging':navigation.dragging,
      onPointerDown:navigation.pointerDown,onPointerMove:navigation.pointerMove,
      onPointerUp:(event:React.PointerEvent<SVGSVGElement>)=>{const name=navigation.pointerEnd(event);if(name)choose(name);},
      onPointerCancel:(event:React.PointerEvent<SVGSVGElement>)=>navigation.pointerEnd(event,true),onKeyDown:navigation.keyDown}:{})}>
   {interactive&&<><title>대한민국 지역 선택 지도</title><desc>{text('Drag to move. Scroll or pinch to zoom. Use arrow keys, plus, minus, or Home for the full map.','드래그로 이동하고 휠 또는 두 손가락으로 확대·축소하세요. 방향키, +, -, Home 키로도 조작할 수 있어요.')}</desc></>}
   <g className="atlas-geography" transform={interactive?cameraTransform(enlarged?navigation.camera:fullMapCamera()):previewTransform}>
    {geometry.regions.map(r=><path key={r.code} data-region={r.name} d={r.path}
      className={'atlas-province '+(active?.name===r.name?'is-selected ':'')+(hover===r.name?'is-hovered':'')}
      {...(interactive?{tabIndex:showLabels||active?.name===r.name?0:-1,role:'button','aria-pressed':active?.name===r.name,'aria-label':`${r.name}, ${counts[r.name]||0}곳`,onMouseEnter:()=>setHover(r.name),onMouseLeave:()=>setHover(''),onFocus:()=>setHover(r.name),onBlur:()=>setHover(''),onClick:(e:React.MouseEvent)=>{if(e.detail===0)choose(r.name);},onKeyDown:(e:React.KeyboardEvent<SVGPathElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(r.name);}}}:{})}
    />)}
    {geometry.regions.map(r=>{const anchor=callouts[r.name]||r.center;return <g key={r.name} className={'atlas-label '+(majorLabels.has(r.name)?'major':'')} aria-hidden="true" style={!showLabels?{opacity:0,pointerEvents:'none'}:undefined}>
      {callouts[r.name]&&<path d={`M${r.center[0]},${r.center[1]} L${anchor[0]},${anchor[1]}`} className="atlas-leader"/>}
      <text data-region={r.name} x={anchor[0]} y={anchor[1]} textAnchor="middle" dominantBaseline="central" onClick={interactive?(e)=>{if(e.detail===0)choose(r.name);}:undefined}>{r.name}</text>
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
   <header className="atlas-header"><div className="atlas-heading"><a className="atlas-wordmark" href={'/?lang='+lang} aria-label={text('NotHotplace home','NotHotplace 첫 화면')}>Not<span>_</span>Hotplace</a><DialogTitle>어디에서 쉴까요?</DialogTitle><DialogDescription className="sr-only">지역을 선택해 음식점, 카페, 드라이브 장소를 둘러보세요.</DialogDescription></div>
    <div className="atlas-header-actions"><Select value={city} onValueChange={choose}><SelectTrigger className="atlas-region-picker" aria-label="큰 지도 지역 선택"><SelectValue/></SelectTrigger><SelectContent position="popper">{['전국','청주',...regionKeys].map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><DialogClose asChild><button className="atlas-close" aria-label="큰 지도 닫기"><X size={21}/></button></DialogClose></div>
   </header>
   <div className={'atlas-stage '+(active?'has-region':'')}>
    <div className="atlas-navigation" role="group" aria-label={text('Map controls','지도 조작')}>
     <button className="atlas-overview" onClick={()=>choose('전국')}><Scan size={18}/>{text('All Korea','전국 보기')}</button>
     <div className="atlas-zoom-controls"><button onClick={()=>navigation.zoom(1/1.35)} disabled={navigation.camera.scale<=MIN_MAP_ZOOM} aria-label={text('Zoom out map','지도 축소')}><Minus size={20}/></button><button onClick={()=>navigation.zoom(1.35)} disabled={navigation.camera.scale>=MAX_MAP_ZOOM} aria-label={text('Zoom in map','지도 확대')}><Plus size={20}/></button></div>
    </div>
    {map(true)}
    <div className="atlas-caption"><span aria-live="polite">{hover?`${hover} · ${counts[hover]||0}곳`:text('Drag to move · Scroll / pinch to zoom','드래그로 이동 · 휠 / 두 손가락으로 확대·축소')}</span><a href={mapSource} target="_blank" rel="noopener noreferrer">지도 출처</a></div>
   </div>
   <div className={'atlas-dock '+(active?'with-places':'')}>
    <div className="atlas-dock-heading"><div><strong>{city==='전국'?'전국의 쉼터':city+'의 쉼터'}</strong><span>{matches.length}곳{matches.length===0?' · 검색 조건을 확인해 주세요':''}</span></div><button className="atlas-results-link" onClick={showResults}>{active?'장소 모두 보기':'목록으로 보기'}<ArrowUpRight size={17}/></button></div>
    {active&&previews.length>0&&<div className="atlas-peeks">{previews.map(p=><button className="atlas-peek" key={p.id} onClick={()=>showPlace(p)} aria-label={`${p.name} 상세 정보 보기`}><span className="atlas-peek-image">{p.image?<img src={p.image} alt=""/>:categoryIcon(p.category)}</span><span className="atlas-peek-copy"><span>{labels[p.category]}{p.resting?' · 최근 혼잡':''}</span><strong>{p.name}</strong><span>{p.count?`${Math.round(p.positive/p.count*100)}% 만족 · ${p.count}명`:'아직 후기가 없어요'}</span></span><ArrowUpRight size={16}/></button>)}</div>}
   </div>
  </DialogContent>
 </Dialog>);
}
