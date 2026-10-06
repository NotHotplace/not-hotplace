import {memo} from 'react';

/** Small SVG-native details, outside the geographic sphere. No raster or filters. */
export const GlobeDecoration = memo(function GlobeDecoration() {
  return <g aria-hidden="true" pointerEvents="none">
    <ellipse cx="300" cy="579" rx="116" ry="8.5" fill="#dfd9c8" opacity=".55"/>
    <g fill="#cba461" stroke="#9f834d" strokeWidth=".65" strokeLinejoin="round">
      <path d="m475 73 3 6 7 1-6 3-1 7-3-6-7-1 6-3z"/>
      <path d="m63 422 1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5z"/>
      <path d="m195 568 1.3 3.7 3.7 1.3-3.7 1.3-1.3 3.7-1.3-3.7-3.7-1.3 3.7-1.3z"/>
    </g>
    <g fill="#bba675"><circle cx="512" cy="95" r="2"/><circle cx="48" cy="382" r="2"/><circle cx="431" cy="557" r="1.9"/></g>
    {[{x:69,y:99,s:.69},{x:557,y:449,s:-.7}].map(({x,y,s})=><g key={x} transform={`translate(${x} ${y}) scale(${s} ${Math.abs(s)})`}>
      <path d="M-37 11C-51 9-51-11-37-13C-33-32-7-34 2-18C17-27 36-15 35-1C49 4 44 20 28 21L-29 21C-36 21-39 17-37 11Z" fill="#fff6e6" stroke="#9b8c73" strokeWidth="1.2"/>
      <path d="M-39 12C-21 19 11 17 29 15" fill="none" stroke="#e7d5b4" strokeWidth="3.1" strokeLinecap="round"/>
      <path d="M-33-9C-31-19-18-23-9-20" fill="none" stroke="#fffcf3" strokeWidth="3.4" strokeLinecap="round"/>
    </g>)}
  </g>;
});

export const GlobeSurface = memo(function GlobeSurface() {
  return <g aria-hidden="true" pointerEvents="none">
    <defs>
      <radialGradient id="ocean" cx="32%" cy="23%" r="94%"><stop stopColor="#c5dfe2"/><stop offset=".58" stopColor="#a6cdd4"/><stop offset="1" stopColor="#83b2c5"/></radialGradient>
      <radialGradient id="shade" cx="30%" cy="24%" r="86%"><stop offset=".56" stopColor="#647858" stopOpacity="0"/><stop offset="1" stopColor="#647858" stopOpacity=".13"/></radialGradient>
      <pattern id="globe-grain" width="70" height="70" patternUnits="userSpaceOnUse">
        <g fill="#5b6050" opacity=".075"><circle cx="8" cy="17" r=".5"/><circle cx="38" cy="12" r=".4"/><circle cx="64" cy="24" r=".55"/><circle cx="23" cy="43" r=".45"/><circle cx="54" cy="55" r=".5"/><circle cx="10" cy="65" r=".4"/></g>
      </pattern>
    </defs>
    <circle cx="300" cy="300" r="257.5" fill="#efe1c6" stroke="#8e8868" strokeWidth="1.15"/>
    <circle cx="300" cy="298.8" r="253.5" fill="#fff5de" stroke="#d9c9aa" strokeWidth=".7"/>
    <circle cx="300" cy="300" r="246" fill="url(#ocean)" stroke="#738978" strokeWidth=".8"/>
  </g>;
});
