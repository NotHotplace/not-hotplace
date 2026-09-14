'use client';
import {useEffect,useRef} from 'react';

export default function AppRuntime(){
  const counted=useRef(false);
  useEffect(()=>{
    if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    if(counted.current || location.hostname!=='nothotplace.com') return;
    counted.current=true;
    if(navigator.doNotTrack==='1' || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl) return;
    // Only a total page-open count is sent. No URL, cookie or user identifier.
    fetch('/api/visit',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:'{}',keepalive:true}).catch(()=>{});
  },[]);
  return null;
}
