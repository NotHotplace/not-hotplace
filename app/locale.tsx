'use client';
import {createContext,useContext,useEffect,useState,isValidElement,cloneElement,type ReactNode} from 'react';
import en from '@/lib/en.json';
import koRegions from '@/lib/ko-regions.json';
export type Language='ko'|'en';
const dictionary=en as Record<string,string>;
const keys=Object.keys(dictionary).filter(k=>k.length>1).sort((a,b)=>b.length-a.length);
export function translate(value:string,lang:Language){
 if(lang==='ko'){let result=value;for(const [english,korean] of Object.entries(koRegions).sort((a,b)=>b[0].length-a[0].length))result=result.split(english).join(korean);return result;}
 const trimmed=value.trim();
 if(dictionary[trimmed])return value.replace(trimmed,dictionary[trimmed]);
 // Compose dynamic labels without changing stored values or place names.
 let result=value;
 for(const k of keys)if(result.includes(k))result=result.split(k).join(dictionary[k]);
 return result.replace(/(\d+)곳/g,'$1 places').replace(/(\d+)명/g,'$1 reviews');
}
function localize(node:ReactNode,lang:Language):ReactNode{
 if(typeof node==='string')return translate(node,lang);
 if(Array.isArray(node))return node.map((child,index)=>{const translated=localize(child,lang);return isValidElement(translated)&&translated.key===null?cloneElement(translated,{key:'localized-'+index}):translated;});
 if(!isValidElement(node))return node;
 const props=node.props as Record<string,any>;
 if(props['data-original-language'])return node;
 const next:Record<string,any>={};
 for(const attr of ['title','placeholder','aria-label','alt'])if(typeof props[attr]==='string')next[attr]=translate(props[attr],lang);
 if('children' in props)next.children=localize(props.children,lang);
 return cloneElement(node,next);
}
function LocalizedFragment({node,lang}:{node:ReactNode;lang:Language}){return <>{localize(node,lang)}</>;}
const Context=createContext({lang:'en' as Language,setLang:(_lang:Language)=>{}});
export function LanguageProvider({children}:{children:ReactNode}){
 const [lang,setLanguage]=useState<Language>('en');
 useEffect(()=>{let saved:string|null=null;try{saved=localStorage.getItem('nhp-language');}catch{}const query=new URLSearchParams(location.search).get('lang');const selected=query==='ko'||query==='en'?query:saved==='ko'||saved==='en'?saved:navigator.language.startsWith('ko')?'ko':'en';setLanguage(selected);try{localStorage.setItem('nhp-language',selected);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=lang;},[lang]);
 function setLang(value:Language){setLanguage(value);try{localStorage.setItem('nhp-language',value);}catch{}const u=new URL(location.href);u.searchParams.set('lang',value);history.replaceState(null,'',u.pathname+u.search+u.hash);}
 return <Context.Provider value={{lang,setLang}}>{children}</Context.Provider>;
}
export function useLocale(){const {lang,setLang}=useContext(Context);return {lang,setLang,t:(s:string)=>translate(s,lang),text:(english:string,korean:string)=>lang==='en'?english:korean,ui:(node:ReactNode)=>localize(node,lang)};}
export function Localized({children}:{children:ReactNode}){const {ui}=useLocale();return <>{ui(children)}</>;}
export function BilingualContent({english,children}:{english:ReactNode;children:ReactNode}){const {lang}=useLocale();return <>{lang==='en'?english:children}</>;}
export function LanguageToggle(){const {lang,setLang}=useLocale();return <div className="language-toggle" role="group" aria-label="Language / 언어">{(['ko','en'] as const).map(v=><button key={v} type="button" aria-pressed={lang===v} onClick={()=>setLang(v)} lang={v}>{v==='ko'?'한국어':'EN'}</button>)}</div>;}
