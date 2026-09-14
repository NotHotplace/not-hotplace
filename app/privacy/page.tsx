import type {Metadata} from 'next';
import {privacyNoticeHtml,privacyNoticeCss} from '@/lib/privacy-notice';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'개인정보처리방침 | Not_Hotplace',robots:{index:false,follow:false}};
export default function Privacy(){return <><style dangerouslySetInnerHTML={{__html:privacyNoticeCss}}/><main className="nhp-privacy"><div dangerouslySetInnerHTML={{__html:privacyNoticeHtml}}/></main></>;}
