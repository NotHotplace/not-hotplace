'use client';
import {useEffect,useState} from 'react';
type InstallEvent=Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
export default function InstallGuide(){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null),[installed,setInstalled]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  const media=matchMedia('(display-mode: standalone)');
  const update=()=>setInstalled(media.matches||!!(navigator as Navigator & {standalone?:boolean}).standalone);
  const ready=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent);};
  const done=()=>{setInstalled(true);setPrompt(null);};
  update();media.addEventListener('change',update);window.addEventListener('beforeinstallprompt',ready);window.addEventListener('appinstalled',done);
  return()=>{media.removeEventListener('change',update);window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',done);};
 },[]);
 async function install(){if(!prompt)return;try{await prompt.prompt();const choice=await prompt.userChoice;setMessage(choice.outcome==='accepted'?'설치를 진행하고 있어요. 홈 화면에서 확인해 주세요.':'아래 안내로 언제든 다시 설치할 수 있어요.');}catch{setMessage('브라우저 메뉴에서 홈 화면에 추가해 주세요.');}finally{setPrompt(null);}}
 return <><section className="install-panel"><div><h2>{installed?'앱으로 열었어요.':'나만의 쉼터 지도 설치하기'}</h2><p>홈 화면에 추가하는 웹 앱입니다. 지도 조회, Google 로그인, 저장·후기에는 인터넷 연결이 필요해요.</p>{installed?<a href="/" className="rest-primary">지도 열기 →</a>:prompt?<button className="rest-primary" onClick={install}>NotHotplace 설치</button>:<p className="rest-note">설치 버튼이 표시되지 않으면 아래 기기별 안내를 따라주세요.</p>}<p role="status">{message}</p></div><figure className="install-qr"><img src="/app-install-qr.svg" width="180" height="180" alt="https://nothotplace.com/install 설치 안내 QR 코드"/><figcaption>휴대폰 카메라로 스캔<br/><a href="https://nothotplace.com/install">nothotplace.com/install</a></figcaption></figure></section><div className="install-steps"><section><span className="rest-eyebrow">01 / ANDROID</span><h2>Android · Chrome</h2><ol><li>Chrome에서 이 페이지를 열어주세요.</li><li>메뉴(⋮)에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.</li><li>설치를 마치면 홈 화면의 NotHotplace 아이콘을 눌러주세요.</li></ol></section><section><span className="rest-eyebrow">02 / IPHONE</span><h2>iPhone · Safari</h2><ol><li>Safari에서 이 페이지를 열어주세요.</li><li>공유 버튼을 누르고 ‘홈 화면에 추가’를 선택하세요.</li><li>‘웹 앱으로 열기’가 표시되면 켠 뒤 ‘추가’를 눌러주세요.</li></ol></section></div><p className="rest-note">Instagram·카카오톡 안에서 열었다면 메뉴의 ‘외부 브라우저로 열기’를 이용하세요. 기기와 브라우저에 따라 메뉴 이름은 다를 수 있어요.</p></>;
}
