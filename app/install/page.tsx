import {Localized,LanguageToggle} from '../locale';
import InstallGuide from './install-guide';
import {SITE_URL} from '@/lib/seo';
export const metadata={title:'앱 설치 | NotHotplace',alternates:{canonical:SITE_URL+'/install'},description:'NotHotplace를 휴대폰 홈 화면에 추가하세요. Android·iPhone 설치 안내와 QR 코드.'};
export default function InstallPage(){return <Localized><main className="rest-page"><div className="locale-page-tools"><LanguageToggle/></div><a className="rest-brand" href="/">Not<span>_</span>Hotplace</a><header className="rest-hero"><span className="rest-eyebrow">YOUR QUIET CORNER, ANYWHERE.</span><h1>쉬고 싶을 때,<br/>홈 화면에서 바로.</h1><p>NotHotplace를 휴대폰에 담아두세요.<br/>지도와 저장한 장소를 더 가깝게 만날 수 있어요.</p></header><InstallGuide/><footer className="rest-footer"><a href="/">지도로 돌아가기</a><a href="/privacy">개인정보처리방침</a></footer></main></Localized>;}
