'use client';
import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, ChevronLeft, ChevronRight, Globe2, Pause, Play} from 'lucide-react';
import {loadGeo} from '@/lib/geo-client';
import {useGlobeMotion} from '@/hooks/use-globe-motion';
import {LanguageToggle, useLocale} from './locale';
import HomeThemes from './home-themes';

export default function GlobeHome() {
  const {lang, text} = useLocale();
  const [geo, setGeo] = useState<any>(null), [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false), [visible, setVisible] = useState(true);
  const [country, setCountry] = useState<'KR' | 'US'>('KR');
  const panel = useRef<HTMLElement>(null);
  const drag = useRef<{x: number; rotation: number; moved: boolean} | null>(null);
  const motion = useGlobeMotion(!!geo && !!data, visible);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.has('place') || query.has('category') || query.has('q') || location.hash.startsWith('#setup=')) {
      location.replace('/kr' + location.search + location.hash); return;
    }
    let live = true;
    Promise.all([loadGeo(), fetch('/maps/world.json').then(response => {
      if (!response.ok) throw Error('Globe unavailable'); return response.json();
    })]).then(([library, world]) => {
      if (live) {setGeo(() => library); setData(world);}
    }).catch(() => {if (live) setFailed(true);});
    return () => {live = false;};
  }, []);

  useEffect(() => {
    if (!panel.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, []);

  function chooseCountry(value: 'KR' | 'US') {
    setCountry(value);
    motion.turnTo(value === 'KR' ? -127 : 100);
  }
  const projection = geo?.geoOrthographic().scale(246).translate([300, 300]).rotate([motion.rotation, -22]);
  const path = geo?.geoPath(projection);
  const countries = [
    {code:'KOR', slug:'kr', country:'KR' as const, name:text('South Korea', '대한민국'), center:[127.7, 36.2]},
    {code:'USA', slug:'us', country:'US' as const, name:text('United States', '미국'), center:[-98, 38]},
  ];

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
          <p>{text('A slower day starts somewhere.', '여유로운 하루, 그 시작이 될 곳.')}<br/>{text('Choose a country to find your kind of space.', '나만의 속도로 쉬어갈 공간을 찾아보세요.')}</p>
        </section>
        <section className="globe-panel" ref={panel} aria-label={text('Choose a country on the globe', '지구본에서 국가 선택')}>
          <div className="globe-display">
            <div className="globe-halo" aria-hidden="true"/><div className="globe-orbit" aria-hidden="true"/><div className="globe-orbit globe-orbit-second" aria-hidden="true"/>
            <div className="globe-stars" aria-hidden="true">{Array.from({length:7}, (_, index) => <i key={index}/>)}</div>
            <svg viewBox="0 0 600 600" role="group" aria-label={text('World globe. Drag to rotate.', '세계 지구본. 드래그하여 회전하세요.')}
              onPointerDown={event => {drag.current = {x:event.clientX, rotation:motion.rotation, moved:false}; motion.dragging.current = true;}}
              onPointerMove={event => {if (drag.current) {const dx = event.clientX - drag.current.x; if (Math.abs(dx) > 4) {drag.current.moved = true; event.currentTarget.setPointerCapture(event.pointerId);} if (drag.current.moved) motion.turnTo(drag.current.rotation + dx * .45, true);}}}
              onPointerUp={event => {if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); motion.dragging.current = false; setTimeout(() => {drag.current = null;}, 0);}}
              onPointerLeave={() => {if (drag.current && !drag.current.moved) {drag.current = null; motion.dragging.current = false;}}}
              onPointerCancel={() => {drag.current = null; motion.dragging.current = false;}}>
              <defs><radialGradient id="ocean" cx="30%" cy="23%" r="85%"><stop stopColor="#264542"/><stop offset=".6" stopColor="#142c2c"/><stop offset="1" stopColor="#080f13"/></radialGradient>
                <radialGradient id="shade" cx="26%" cy="24%" r="79%"><stop offset=".5" stopColor="#001008" stopOpacity="0"/><stop offset="1" stopColor="#020907" stopOpacity=".8"/></radialGradient></defs>
              <circle cx="300" cy="300" r="257" fill="none" stroke="#789b73" strokeOpacity=".4"/><circle cx="300" cy="300" r="246" fill="url(#ocean)"/>
              {geo && data && <>
                <path d={path(geo.geoGraticule10()) || ''} fill="none" stroke="#8cafa3" strokeWidth=".6" opacity=".25"/>
                {data.features.map((feature:any) => {
                  const supported = countries.find(value => value.code === feature.properties.code);
                  return <path key={feature.properties.code} d={path(feature) || ''} fill={supported?.country === country ? '#d1ff73' : supported ? '#79945b' : '#355953'}
                    stroke={supported ? '#eaffb4' : '#8caa91'} strokeOpacity={supported ? 1 : .45} strokeWidth={supported ? 1.2 : .6}
                    onClick={() => {if (supported && !drag.current?.moved) location.href = '/' + supported.slug + '?lang=' + lang;}} className={supported ? 'globe-country' : ''}>
                    <title>{supported?.name || feature.properties.name}</title>
                  </path>;
                })}
                <circle cx="300" cy="300" r="246" fill="url(#shade)" pointerEvents="none"/>
                {countries.map(value => {
                  if (geo.geoDistance(value.center, projection.invert([300,300])) > Math.PI / 2) return null;
                  const [x, y] = projection(value.center);
                  return <g key={value.code} className="globe-pin" role="link" tabIndex={0} aria-label={value.name}
                    onClick={() => {if (!drag.current?.moved) location.href = '/' + value.slug + '?lang=' + lang;}}
                    onKeyDown={event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); location.href = '/' + value.slug + '?lang=' + lang;}}}>
                    <circle cx={x} cy={y} r="22" fill="transparent"/><circle className="globe-pin-pulse" cx={x} cy={y} r="16" fill="#d1ff73" opacity=".25"/>
                    <circle cx={x} cy={y} r="4" fill="#f1ffd5"/><text x={x} y={y-23} fill="#f3ffde" fontSize="16" textAnchor="middle" paintOrder="stroke" stroke="#10201b" strokeWidth="5">{value.name}</text>
                  </g>;
                })}
              </>}
            </svg>
            {!data && <span className="globe-load">{failed ? text('Choose a country below.', '아래에서 나라를 선택하세요.') : text('Loading the globe…', '지구본을 불러오는 중…')}</span>}
          </div>
          <div className="globe-rotation"><button type="button" onClick={() => motion.turnTo(motion.rotation + 60)} aria-label={text('Rotate west', '서쪽으로 회전')}><ChevronLeft size={20}/></button>
            <span>{text('Drag to explore', '드래그해서 둘러보기')}</span><button type="button" onClick={() => motion.turnTo(motion.rotation - 60)} aria-label={text('Rotate east', '동쪽으로 회전')}><ChevronRight size={20}/></button></div>
        </section>
        <nav className="country-choices" aria-label={text('Available countries', '선택 가능한 국가')}>{countries.map(value =>
          <a key={value.code} href={'/' + value.slug + '?lang=' + lang} onMouseEnter={() => chooseCountry(value.country)} onFocus={() => chooseCountry(value.country)}>
            <span className="country-code">{value.country}</span><span><strong>{value.name}</strong><small>{text('Open country map', '국가 지도 열기')}</small></span><ArrowUpRight/>
          </a>)}</nav>
      </div>
      <HomeThemes country={country} onCountryChange={chooseCountry}/>
    </main>
    <footer className="world-footer"><span><Globe2 size={15}/>{text('Korea + the U.S. · More places, at your pace.', '한국과 미국 · 나만의 속도로 찾는 쉼.')}</span><a href={'/privacy?lang=' + lang}>{text('Privacy', '개인정보처리방침')}</a></footer>
  </div>;
}
