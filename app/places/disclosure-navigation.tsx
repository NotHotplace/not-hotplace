'use client';
import {useEffect} from 'react';
import {hashTargetId,revealDisclosure} from '@/lib/disclosure-target';
export default function DisclosureNavigation(){
 useEffect(()=>{
  const openHash=()=>{const id=hashTargetId(location.hash),target=id?document.getElementById(id):null;if(target)revealDisclosure(target);};
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
   const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
   const url=new URL(anchor.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search||!url.hash)return;
   const id=hashTargetId(url.hash),target=id?document.getElementById(id):null;if(!target)return;
   event.preventDefault();if(location.hash!==url.hash)history.pushState(history.state,'',url.hash);revealDisclosure(target);
  };
  openHash();document.addEventListener('click',click);window.addEventListener('hashchange',openHash);window.addEventListener('popstate',openHash);
  return()=>{document.removeEventListener('click',click);window.removeEventListener('hashchange',openHash);window.removeEventListener('popstate',openHash);};
 },[]);
 return null;
}
