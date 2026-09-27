'use client';
import {useLocale} from './locale';

import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {Plus,Minus,Scan,ArrowUpRight,Maximize2,MapPin,X} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import geometry from '@/lib/korea-map.json';
import {useAtlasCamera} from '@/hooks/use-atlas-camera';
import {cameraTransform,fullMapCamera,MIN_MAP_ZOOM,MAX_MAP_ZOOM} from '@/lib/atlas-camera';
import {regionKeys,inRegion,regionOf} from '@/lib/regions';
import {type Place} from '@/lib/catalog';

export type MapPlace=Place&{count:number;positive:number;quiet:number;latest:number|null;resting?:boolean};
const callouts:Record<string,[number,number]>={
 '서울':[173,118],'인천':[120,179],'세종':[185,250],'대전':[205,340],
 '광주':[164,455],'울산':[583,415],'부산':[557,492],'대구':[586,330],
};
const majorLabels=new Set(['서울','강원','충남','전북','전남','경북','경남','제주']);
const mapSource='https://github.com/southkorea/southkorea-maps';

type Props={
 places:MapPlace[];city:string;compact:boolean;
 onEnter:(city:string)=>void;onResults:()=>void;
};

export default function DiscoveryMap({places,city,compact,onEnter,onResults}:Props){
 const {ui,text,lang}=useLocale();
 const [open,setOpen]=useState(false),[hover,setHover]=useState(''),[revealed,setRevealed]=useState(false);
 const [motion,setMotion]=useState<CSSProperties>({});
 const preview=useRef<HTMLDivElement>(null),closeAction=useRef<'preview'|'results'>('preview');
 const [closingToResults,setClosingToResults]=useState(false);
 const active=geometry.regions.find(r=>r.name===regionOf(city));
 const counts=Object.fromEntries(regionKeys.map(r=>[r,places.filter(p=>inRegion(p,r)).length]));
 const matches=places.filter(p=>inRegion(p,city));
 // Reopening is a new region choice: show the whole country with the current region highlighted.
 const navigation=useAtlasCamera(undefined,open,revealed);

 useEffect(()=>{
  if(!open){setRevealed(false);return;}
  let next=0;
  const first=requestAnimationFrame(()=>{next=requestAnimationFrame(()=>setRevealed(true));});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(next);};
 },[open]);

 function measurePreview(){
  const box=preview.current?.getBoundingClientRect();
  if(!box)return;
  const inset=window.matchMedia('(max-width:640px)').matches?12:24;
  setMotion({
   '--atlas-x':`${box.left+box.width/2-window.innerWidth/2}px`,
   '--atlas-y':`${box.top+box.height/2-window.innerHeight/2}px`,
   '--atlas-scale-x':String(box.width/(window.innerWidth-inset)),
   '--atlas-scale-y':String(box.height/(window.innerHeight-inset)),
  } as CSSProperties);
 }
 // Measure after the selected-region layout has committed, so the fold lands on its small map.
 useLayoutEffect(()=>{if(closingToResults){measurePreview();setOpen(false);setClosingToResults(false);}},[closingToResults]);
 function choose(name:string,expanded=true){
  setHover('');onEnter(name);
  if(name==='전국'){navigation.focus();return;}
  if(!expanded)return;
  closeAction.current='results';setClosingToResults(true);
 }
 function showResults(){closeAction.current='results';setClosingToResults(true);}

 function map(expanded:boolean){
  const enlarged=expanded&&revealed;
  return <svg viewBox="20 0 680 710" className="atlas-svg" role="group" aria-label={expanded?'대한민국 지역 선택 지도':'작은 지도에서 지역 선택'}
    {...(expanded?{ref:navigation.svgRef,tabIndex:0,'data-animated':navigation.animated,'data-dragging':navigation.dragging,
      onPointerDown:navigation.pointerDown,onPointerMove:navigation.pointerMove,
      onPointerUp:(event:React.PointerEvent<SVGSVGElement>)=>{const name=navigation.pointerEnd(event);if(name)choose(name);},
      onPointerCancel:(event:React.PointerEvent<SVGSVGElement>)=>navigation.pointerEnd(event,true),onKeyDown:navigation.keyDown}:{})}>
   <title>대한민국 지역 선택 지도</title><desc>{expanded?text('Choose a region to see its places. Drag or zoom to explore.','지역을 선택하면 장소 목록이 펼쳐져요. 드래그와 확대·축소도 가능해요.'):text('Select a region directly, or use the region menu.','지역을 바로 누르거나 지역 변경 메뉴에서 선택하세요.')}</desc>
   <g className="atlas-geography" transform={cameraTransform(enlarged?navigation.camera:fullMapCamera())}>
    {geometry.regions.map(r=><path key={r.code} data-region={r.name} d={r.path}
      className={'atlas-province '+(active?.name===r.name?'is-selected ':'')+(hover===r.name?'is-hovered':'')}
      tabIndex={0} role="button" aria-pressed={active?.name===r.name} aria-label={`${r.name}, ${counts[r.name]||0}곳`}
      onMouseEnter={()=>setHover(r.name)} onMouseLeave={()=>setHover('')} onFocus={()=>setHover(r.name)} onBlur={()=>setHover('')}
      onClick={e=>{if(!expanded||e.detail===0)choose(r.name,expanded);}}
      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(r.name,expanded);}}}
    />)}
    {geometry.regions.map(r=>{const anchor=callouts[r.name]||r.center;return <g key={r.name} className={'atlas-label '+(majorLabels.has(r.name)?'major ':'')+(active?.name===r.name?'is-selected':'')} aria-hidden="true">
      {callouts[r.name]&&<path d={`M${r.center[0]},${r.center[1]} L${anchor[0]},${anchor[1]}`} className="atlas-leader"/>}
      <text data-region={r.name} x={anchor[0]} y={anchor[1]} textAnchor="middle" dominantBaseline="central" onClick={e=>{if(!expanded||e.detail===0)choose(r.name,expanded);}}>{r.name}</text>
     </g>;})}
   </g>
  </svg>;
 }

 return ui(<Dialog open={open} onOpenChange={v=>{measurePreview();if(v)closeAction.current='preview';setOpen(v);}}>
  <section className={'atlas-preview-wrap '+(compact?'is-compact ':'')+(active?'has-region':'')} data-expanded={open} aria-label="확대 가능한 전국 지도">
   <div ref={preview} className="atlas-preview">
    <div className="atlas-preview-head"><div className="atlas-region-control"><MapPin size={16}/><Select value={city} onValueChange={name=>choose(name,false)}><SelectTrigger className="atlas-inline-picker" aria-label={text('Change region','작은 지도 지역 변경')}><SelectValue/></SelectTrigger><SelectContent position="popper">{['전국','청주',...regionKeys].map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div><DialogTrigger asChild><button className="atlas-expand-icon" aria-label={`${city} 지도를 화면 가득 크게 보기`}><Maximize2 size={18}/></button></DialogTrigger></div>
    <div className="atlas-preview-canvas">{map(false)}</div>
    <div className="atlas-preview-foot"><span>{text('Select a region on the map','지도에서 지역을 바로 선택하세요')}</span></div>
   </div>
  </section>
  <DialogContent className="atlas-dialog" showCloseButton={false} style={motion}
   onCloseAutoFocus={e=>{if(closeAction.current==='results'){e.preventDefault();onResults();}}}>
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
   <div className="atlas-dock">
    <div className="atlas-dock-heading"><div><strong>{city==='전국'?'전국의 쉼터':city+'의 쉼터'}</strong><span>{matches.length}곳{matches.length===0?' · 검색 조건을 확인해 주세요':''}</span></div><button className="atlas-results-link" onClick={showResults}>{active?'장소 모두 보기':'목록으로 보기'}<ArrowUpRight size={17}/></button></div>
   </div>
  </DialogContent>
 </Dialog>);
}
