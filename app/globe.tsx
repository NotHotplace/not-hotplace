'use client';
import {countries as countryConfig,countryCodes,type CountryCode} from '@/lib/countries';
import {useEffect, useMemo, useRef, useState} from 'react';
import {layoutGlobeLabels, projectVisibleGlobePoints} from '@/lib/globe-labels';
import {GlobeDecoration, GlobeSurface} from './globe-decoration';
import {ChevronLeft, ChevronRight, Globe2, Pause, Play} from 'lucide-react';
import {loadGeo} from '@/lib/geo-client';
import {useGlobeMotion} from '@/hooks/use-globe-motion';
import {LanguageToggle, useLocale} from './locale';
import HomeThemes from './home-themes';
import HomeFinder from './home-finder';
import GuideLinks from './guide-links';

export default function GlobeHome() {
  const {lang, text} = useLocale();
  const [geo, setGeo] = useState<any>(null), [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false), [visible, setVisible] = useState(true), [globeOpen,setGlobeOpen]=useState(false), [globeRetry,setGlobeRetry]=useState(0);
  const [country, setCountry] = useState<CountryCode>('KR');
  const [lastCountry,setLastCountry]=useState<CountryCode|null>(null);
  const panel = useRef<HTMLElement>(null), globeSvg = useRef<SVGSVGElement>(null), globeDisclosure = useRef<HTMLDetailsElement>(null);
  const pendingCountryFocus = useRef<CountryCode|null>(null), pendingPauseFocus = useRef(false);
  const [browsedCountry,setBrowsedCountry] = useState<CountryCode|null>(null), [focusRequest,setFocusRequest]=useState(0);
  const [globeWidth, setGlobeWidth] = useState(600);
  const [focusedCountry, setFocusedCountry] = useState<CountryCode|null>(null);
  const drag = useRef<{x:number; y:number; rotation:number; moved:boolean; rotating:boolean} | null>(null);
  const suppressClick = useRef(false), focusedCode = useRef<CountryCode|null>(null), browsedCode = useRef<CountryCode>('KR');
  // Keep keyboard targets stationary until focus leaves the globe.
  const motion = useGlobeMotion(globeOpen && !!geo && !!data, visible && !focusedCountry);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.has('place') || query.has('category') || query.has('q') || location.hash.startsWith('#setup=')) {
      location.replace('/kr' + location.search + location.hash); return;
    }
    try {const last=localStorage.getItem('nhp-last-country');if(countryCodes.includes(last as CountryCode)){setLastCountry(last as CountryCode);setCountry(last as CountryCode);}}catch{}
  }, []);

  useEffect(() => {
    if(!globeOpen || (geo && data))return;
    setFailed(false);
    let live = true;
    Promise.all([loadGeo(), fetch('/maps/world.json').then(response => {
      if (!response.ok) throw Error('Globe unavailable'); return response.json();
    })]).then(([library, world]) => {
      if (live) {setGeo(() => library); setData(world);}
    }).catch(() => {if (live) setFailed(true);});
    return () => {live = false;};
  }, [globeOpen,globeRetry]);

  useEffect(() => {
    if (!panel.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!globeOpen || !globeSvg.current) return;
    const svg = globeSvg.current;
    const measure = () => {const width=svg.getBoundingClientRect().width;if(width>0)setGlobeWidth(width);};
    measure();
    if (typeof ResizeObserver === 'undefined') {window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);}
    const observer = new ResizeObserver(measure);observer.observe(svg);
    return () => observer.disconnect();
  }, [globeOpen]);

  function orientCountry(value: CountryCode) {
    // Focus pauses the animation loop, so keyboard/manual navigation must turn immediately.
    motion.turnTo(-countryConfig[value].center[0],true);
  }
  function chooseCountry(value: CountryCode) {
    setCountry(value);browsedCode.current=value;setBrowsedCountry(value);orientCountry(value);
    pendingPauseFocus.current=true;setGlobeOpen(false);
  }
  function browseCountry(value: CountryCode, focusPin = true) {
    // Pointer navigation stays on its button, avoiding scroll jumps under repeated taps.
    if(!focusPin){focusedCode.current=null;setFocusedCountry(null);}
    browsedCode.current=value;setBrowsedCountry(value);pendingCountryFocus.current=focusPin?value:null;setFocusRequest(request=>request+1);orientCountry(value);
  }
  function stepCountry(direction: number, focusPin = true) {
    const index=countryCodes.indexOf(browsedCode.current);
    browseCountry(countryCodes[(index+direction+countryCodes.length)%countryCodes.length],focusPin);
  }
  function toggleGlobe(open: boolean) {
    if(open&&!globeOpen){browsedCode.current=country;setBrowsedCountry(country);orientCountry(country);}
    setGlobeOpen(open);
  }
  const projection = useMemo(() => geo?.geoOrthographic().scale(246).translate([300, 300]).rotate([motion.rotation, -22]), [geo,motion.rotation]);
  const path = geo?.geoPath(projection);
  const countries = useMemo(() => countryCodes.map(code=>({code,iso3:countryConfig[code].iso3,slug:countryConfig[code].slug,name:lang==='ko'?countryConfig[code].nameKo:countryConfig[code].nameEn,center:countryConfig[code].center,selected:code===country})),[country,lang]);
  const labels = useMemo(() => projection ? layoutGlobeLabels(projectVisibleGlobePoints(countries,projection),globeWidth,{preferredCode:pendingCountryFocus.current??focusedCode.current??browsedCountry??undefined}) : [],[projection,countries,globeWidth,browsedCountry,focusRequest]);
  useEffect(() => {
    // Removing a focused SVG button (for example after a drag to the back) may
    // skip blur. Do not leave animation permanently paused on a stale target.
    if (focusedCountry && (!globeOpen || !labels.some(label => label.code === focusedCountry))) {
      focusedCode.current = null;setFocusedCountry(null);
    }
  }, [focusedCountry,globeOpen,labels]);
  useEffect(() => {
    if(globeOpen && pendingCountryFocus.current){
      const pin=globeSvg.current?.querySelector<SVGElement>('[data-country="'+pendingCountryFocus.current+'"]');
      if(pin){pendingCountryFocus.current=null;pin.focus({preventScroll:true});pin.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
    }
    if(!globeOpen && pendingPauseFocus.current){
      pendingPauseFocus.current=false;document.getElementById('home-pause-choice')?.focus();
    }
  },[globeOpen,labels,focusRequest]);
  function finishDrag() {if(drag.current)suppressClick.current=drag.current.moved;drag.current=null;motion.dragging.current=false;}


  return <div className="world-app" data-motion={motion.enabled ? 'on' : 'off'}>
    <header className="world-header"><a className="brand" href={'/?lang=' + lang}>Not<span>_</span>Hotplace</a>
      <div className="world-header-tools"><button className="world-motion-toggle" type="button" onClick={motion.toggle}
        disabled={motion.reduced} aria-pressed={motion.enabled}
        aria-label={motion.reduced ? text('Reduced motion enabled', '모션 감소 설정 적용 중') : motion.enabled ? text('Pause animation', '애니메이션 멈추기') : text('Play animation', '애니메이션 재생하기')}>
        {motion.enabled ? <Pause size={16}/> : <Play size={16}/>}<span>{motion.reduced ? text('Reduced motion', '모션 감소') : motion.enabled ? text('Pause motion', '모션 끄기') : text('Play motion', '모션 켜기')}</span>
      </button><LanguageToggle/></div>
    </header>
    <main>
      <div className="world-main">
        <section className="world-heading"><span className="world-kicker">WE WANT REST.</span>
          <h1>{text('Find your', '어디에서')}<br/><em>{text('room to breathe.', '쉬어갈까요?')}</em></h1>
          <figure className="world-guide">
            <span className="world-pause-illustration" aria-hidden="true"><img src="/assets/brand-tea-guide.webp" alt="" width="480" height="600" decoding="async"/></span>
            <figcaption>
              <p className="world-guide-introduction">{text('Yeonaon, your rest guide.', '쉬어갈 곳을 함께 찾는 여나온')}</p>
              <p>{text('Choose a country on the globe, then your kind of pause.', '지구본에서 나라를 고르고, 어떤 쉼이 필요한지 알려주세요.')}</p>
            </figcaption>
          </figure>
          <nav className="world-quick-actions" aria-label={text('Start exploring','바로 탐색하기')}><a href="#home-world">{text('Explore the world','세계 장소 찾아보기')}</a><a href="#home-finder">{text('Find my kind of pause','내 조건으로 찾기')}</a></nav>
          {lastCountry&&<a className="world-continue" href={'/'+lastCountry.toLowerCase()+'?lang='+lang+'&resume=1'}>{text('Continue exploring '+countryConfig[lastCountry].nameEn,countryConfig[lastCountry].nameKo+'에서 이어서 찾기')}</a>}
        </section>
      </div>
      <details className="home-globe-disclosure" id="home-world" ref={globeDisclosure} open={globeOpen} onToggle={event=>toggleGlobe(event.currentTarget.open)}><summary><Globe2 size={21} aria-hidden="true"/><span><strong>{text('Choose on the globe','세계에서 고르기')}</strong><small>{text(countryConfig[country].nameEn,countryConfig[country].nameKo)} · {globeOpen?text('Close globe','지구본 접기'):text('Change country','나라 바꾸기')}</small></span></summary>        <section className="globe-panel" ref={panel} aria-label={text('Choose a country on the globe', '지구본에서 국가 선택')}>
          <div className="globe-display">
            <svg ref={globeSvg} viewBox="0 0 600 600" role="group" aria-label={text('World globe. Drag to rotate. Use arrow keys to browse countries, then Enter to select.', '세계 지구본. 드래그하여 회전하세요. 방향키로 나라를 둘러보고 Enter로 선택하세요.')}
              onKeyDown={event=>{if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();if(event.key==='Home')browseCountry(countryCodes[0]);else if(event.key==='End')browseCountry(countryCodes[countryCodes.length-1]);else stepCountry(event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1);}else if(event.key==='Escape'){event.preventDefault();setGlobeOpen(false);globeDisclosure.current?.querySelector('summary')?.focus();}}}
              onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget as Node)) {focusedCode.current=null;setFocusedCountry(null);}}}
              onDragStart={event => event.preventDefault()}
              onClickCapture={event => {if (event.detail !== 0 && suppressClick.current) {event.preventDefault();event.stopPropagation();}}}
              onPointerDown={event => {if(event.button!==0||!event.isPrimary)return;suppressClick.current=false;drag.current={x:event.clientX,y:event.clientY,rotation:motion.rotation,moved:false,rotating:false};motion.dragging.current=true;}}
              onPointerMove={event => {
                if(!drag.current)return;
                const dx=event.clientX-drag.current.x,dy=event.clientY-drag.current.y;
                if(Math.hypot(dx,dy)>6)drag.current.moved=true;
                if(!drag.current.rotating&&Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){drag.current.rotating=true;event.currentTarget.setPointerCapture(event.pointerId);}
                if(drag.current.rotating)motion.turnTo(drag.current.rotation+dx*.45,true);
              }}
              onPointerUp={event => {finishDrag();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
              onPointerLeave={event => {if(drag.current&&!event.currentTarget.hasPointerCapture(event.pointerId))finishDrag();}}
              onPointerCancel={() => {finishDrag();suppressClick.current=true;}}
              onLostPointerCapture={finishDrag}>
              <GlobeDecoration/><GlobeSurface/>
              {geo && data && <>
                <path d={path(geo.geoGraticule10()) || ''} fill="none" stroke="#f7f1dd" strokeWidth=".65" opacity=".31" pointerEvents="none"/>
                {data.features.map((feature:any) => {
                  const supported = countries.find(value => value.iso3 === feature.properties.code);
                  return <path key={feature.properties.code} d={path(feature) || ''} fill={supported?.code === country ? '#c66136' : supported ? '#929b65' : '#c5cc9b'}
                    stroke={supported ? '#fff5e1' : '#6f7656'} strokeOpacity={supported ? .94 : .51} strokeWidth={supported ? 1.1 : .6} strokeLinejoin="round"
                    onClick={() => {if (supported && !suppressClick.current) chooseCountry(supported.code);}} className={supported ? 'globe-country' : ''}>
                    <title>{supported?.name || feature.properties.name}</title>
                  </path>;
                })}
                <g pointerEvents="none" aria-hidden="true">
                  <circle cx="300" cy="300" r="245.7" fill="url(#globe-grain)"/>
                  <circle cx="300" cy="300" r="246" fill="url(#shade)"/>
                  <path d="M114 133C149 89 205 63 247 57" fill="none" stroke="#fffbed" strokeWidth="2.5" opacity=".9" strokeLinecap="round"/>
                </g>
                {labels.map(value => {
                  const {x,y,labelRect,pinHitRect,leader}=value;
                  const color=value.selected?'#b84a24':'#727c53';
                  return <g key={value.code} className="globe-pin" role="button" tabIndex={0}
                    aria-label={text('Select '+value.name,value.name+' 선택')} aria-pressed={value.selected} data-country={value.code} data-selected={value.selected||undefined}
                    onClick={()=>chooseCountry(value.code)}
                    onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();chooseCountry(value.code);}}}
                    onFocus={()=>{focusedCode.current=value.code;browsedCode.current=value.code;setFocusedCountry(value.code);}}>

                    <g pointerEvents="none" aria-hidden="true">
                      <path d={`M${leader.x1} ${leader.y1}L${leader.x2} ${leader.y2}`} fill="none" stroke="#fff7e9" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d={`M${leader.x1} ${leader.y1}L${leader.x2} ${leader.y2}`} fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round"/>
                      <path d={`M${x} ${y}C${x-3} ${y-4} ${x-7} ${y-7} ${x-7} ${y-11}A7 7 0 1 1 ${x+7} ${y-11}C${x+7} ${y-7} ${x+3} ${y-4} ${x} ${y}Z`} fill={color} stroke="#fff9ed" strokeWidth="1.2"/>
                      <circle cx={x} cy={y-11} r="2.2" fill="#fff9ed"/>
                    </g>
                    <rect {...pinHitRect} fill="#fff" fillOpacity="0" className="globe-pin-hit"/>
                    <rect {...labelRect} rx={labelRect.height/2} fill={value.selected?'#b84a24':'#fff9ed'} stroke={color} strokeWidth=".8" className="globe-label-background"/>
                    <text x={value.textX} y={value.textStartY} fill={value.selected?'#fff9ed':'#55603c'} fontSize={value.fontSize} fontFamily="sans-serif" fontWeight={value.selected?650:500} textAnchor="middle" pointerEvents="none" aria-hidden="true">
                      {value.lines.map((line,index)=><tspan key={index} x={value.textX} dy={index?value.lineHeight:0}>{line}</tspan>)}
                    </text>
                    <rect {...labelRect} rx={labelRect.height/2} className="globe-focus-ring" fill="none"/>
                    <rect {...pinHitRect} rx="10" className="globe-focus-ring" fill="none"/>
                  </g>;
                })}
              </>}
            </svg>
            {!data && <span className="globe-load" role="status">{failed ? <>{text('The globe could not load.', '지구본을 불러오지 못했어요.')}<button type="button" onClick={()=>setGlobeRetry(value=>value+1)}>{text('Try again','다시 불러오기')}</button></> : text('Loading the globe…', '지구본을 불러오는 중…')}</span>}
          </div>
          <div className="globe-mobile-motion"><button type="button" className="world-motion-toggle" onClick={motion.toggle} disabled={motion.reduced} aria-pressed={motion.enabled} aria-label={motion.reduced ? text('Reduced motion enabled', '모션 감소 설정 적용 중') : motion.enabled ? text('Pause animation', '애니메이션 멈추기') : text('Play animation', '애니메이션 재생하기')}>{motion.enabled ? <Pause size={16}/> : <Play size={16}/>}<span>{motion.reduced ? text('Reduced motion', '모션 감소') : motion.enabled ? text('Pause motion', '모션 끄기') : text('Play motion', '모션 켜기')}</span></button></div>
          <div className="globe-rotation"><button type="button" onClick={() => motion.turnTo(motion.rotation + 60)} aria-label={text('Rotate west', '서쪽으로 회전')}><ChevronLeft size={20}/></button>
            <span>{text('Drag to explore', '드래그해서 둘러보기')}</span><button type="button" onClick={() => motion.turnTo(motion.rotation - 60)} aria-label={text('Rotate east', '동쪽으로 회전')}><ChevronRight size={20}/></button></div>
          <div className="globe-country-navigation" role="group" aria-label={text('Browse all countries','모든 나라 둘러보기')}>
            <button type="button" disabled={!geo||!data} onClick={event=>{if(event.detail>0)event.currentTarget.focus({preventScroll:true});stepCountry(-1,event.detail===0);}} aria-label={text('Previous country','이전 나라')}><ChevronLeft size={18}/><span>{text('Previous','이전 나라')}</span></button>
            <span aria-live="polite">{text(countryConfig[browsedCode.current].nameEn,countryConfig[browsedCode.current].nameKo)}<small>{countryCodes.indexOf(browsedCode.current)+1} / {countryCodes.length}</small></span>
            <button type="button" disabled={!geo||!data} onClick={event=>{if(event.detail>0)event.currentTarget.focus({preventScroll:true});stepCountry(1,event.detail===0);}} aria-label={text('Next country','다음 나라')}><span>{text('Next','다음 나라')}</span><ChevronRight size={18}/></button>
          </div>
          <p className="globe-label-hint">{text('Browse with the arrows, then select a pin. You can also drag the globe.','화살표로 둘러본 뒤 핀을 눌러 선택하세요. 지구본을 직접 돌려도 좋아요.')}</p>
        </section></details>
      <HomeFinder country={country}/>
      <details className="home-more-pauses"><summary>{text('More ways to pause','다른 쉼도 둘러보기')}</summary><HomeThemes country={country}/></details>
      <section className="home-themes"><h2>{text('Guides for your next pause.','쉼을 위한 가이드.')}</h2><GuideLinks language={lang} country={country}/></section>
    </main>
    <footer className="world-footer"><span><Globe2 size={15}/>{text(countryCodes.length+' countries · A pause, at your pace.',countryCodes.length+'개국 · 나만의 속도로 찾는 쉼.')}</span><a href={'/contributors?lang='+lang}>{text('Regional contributors','우리 동네 발견자')}</a><a href={'/privacy?lang=' + lang}>{text('Privacy', '개인정보처리방침')}</a></footer>
  </div>;
}
