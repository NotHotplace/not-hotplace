import type {Metadata} from 'next';
import {privacyNoticeHtml,privacyNoticeCss} from '@/lib/privacy-notice';
import {BilingualContent,LanguageToggle} from '../locale';
import {PrivacyEnglish} from '../policy-english';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Privacy policy | NotHotplace',robots:{index:false,follow:false}};
export default function Privacy(){return <BilingualContent english={<PrivacyEnglish contact="mythdriveofficial@gmail.com" operator="Lee Wonjae"/>}><style dangerouslySetInnerHTML={{__html:privacyNoticeCss}}/><main className="nhp-privacy"><LanguageToggle/><div dangerouslySetInnerHTML={{__html:privacyNoticeHtml}}/><section><h2>언어 설정</h2><p>한국어·영어 선택은 기기의 로컬 저장소에 보관합니다. 추적 식별자로 사용하지 않으며 언어 버튼으로 바꾸거나 브라우저 사이트 데이터를 지워 삭제할 수 있습니다. 언어 설정 안내 추가일: 2026년 9월 22일.</p></section></main></BilingualContent>;}
