import type {Metadata} from 'next';
import {privacyNoticeHtml,privacyNoticeCss} from '@/lib/privacy-notice';
import {googleReady} from '@/lib/site-auth';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'개인정보처리방침 | Not_Hotplace',robots:{index:false,follow:false}};
export default function Privacy(){return <><style dangerouslySetInnerHTML={{__html:privacyNoticeCss}}/><main className="nhp-privacy">{googleReady()&&<aside className="status"><strong>로그인 기능이 활성화되어 있습니다.</strong><p>이 문안은 회원 기능 활성화 전 상태를 기준으로 작성되었습니다. 인증정보·회원 기록과 국외 이전 고지를 갱신해야 합니다.</p></aside>}<div dangerouslySetInnerHTML={{__html:privacyNoticeHtml}}/></main></>;}
