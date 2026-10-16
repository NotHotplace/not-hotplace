import {Localized,LanguageToggle} from '../locale';
import InstallGuide from './install-guide';
import SeoLinks from '@/components/seo-links';
import {SITE_URL} from '@/lib/seo';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const ko=(await searchParams).lang==='ko';
 return {title:(ko?'앱 설치':'Install the app')+' | NotHotplace',description:ko?'NotHotplace를 휴대폰 홈 화면에 추가하세요. Android·iPhone 설치 안내와 QR 코드.':'Add NotHotplace to your home screen. Installation steps for Android and iPhone, plus a QR code.'};
}
export default function InstallPage(){return <><SeoLinks canonical={SITE_URL+'/install'}/><Localized><main className="rest-page"><div className="locale-page-tools"><LanguageToggle/></div><a className="rest-brand" href="/">Not<span>_</span>Hotplace</a><header className="rest-hero"><span className="rest-eyebrow">YOUR QUIET CORNER, ANYWHERE.</span><h1>쉬고 싶을 때,<br/>홈 화면에서 바로.</h1><p>NotHotplace를 휴대폰에 담아두세요.<br/>지도와 저장한 장소를 더 가깝게 만날 수 있어요.</p></header><InstallGuide/><footer className="rest-footer"><a href="/">지도로 돌아가기</a><a href="/privacy">개인정보처리방침</a></footer></main></Localized></>;}
