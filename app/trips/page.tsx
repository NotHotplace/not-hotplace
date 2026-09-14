import {SITE_URL} from '@/lib/seo';
import TripBrowser from './trip-browser';
export const metadata={title:'템플스테이와 느린 여행 | NotHotplace',description:'템플스테이, 숲에서 쉬기, 느린 하루. 나에게 맞는 9가지 휴식 여행 아이디어를 살펴보세요.',alternates:{canonical:SITE_URL+'/trips'}};
export default function Trips(){return <main className="rest-page"><a className="rest-brand" href="/">Not<span>_</span>Hotplace</a><header className="rest-hero"><span className="rest-eyebrow">LESS PLANS. MORE REST.</span><h1>어디 갈지보다,<br/>어떻게 쉬고 싶나요?</h1><p>템플스테이부터 책 한 권과 보내는 오후까지.<br/>나에게 맞는 여행의 속도를 찾아보세요.</p></header><TripBrowser/><footer className="rest-footer"><a href="/">지도에서 장소 찾기</a><a href="/install">홈 화면에 추가하기</a><a href="/privacy">개인정보처리방침</a></footer></main>;}
