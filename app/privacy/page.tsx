import type {Metadata} from 'next';
import {privacyNoticeHtml,privacyNoticeCss} from '@/lib/privacy-notice';
import {BilingualContent,LanguageToggle} from '../locale';
import {PrivacyEnglish} from '../policy-english';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Privacy policy | NotHotplace',robots:{index:false,follow:false}};
export default function Privacy(){return <BilingualContent english={<PrivacyEnglish contact="mythdriveofficial@gmail.com" operator="Lee Wonjae"/>}><style dangerouslySetInnerHTML={{__html:privacyNoticeCss}}/><main className="nhp-privacy"><LanguageToggle/><div dangerouslySetInnerHTML={{__html:privacyNoticeHtml}}/><section><h2>장소 정보·사진 제보</h2><p>2026년 10월 2일부터 장소 ID, 짧은 안내, 선택한 공개 출처·사진 링크, 사진 사용 동의, 처리 상태·시각과 간단 후기와 같은 브라우저 가명 키를 보관합니다. 제보 내용은 운영자만 열람하며 링크를 자동으로 가져오거나 공개하지 않습니다. 90일이 지난 제보는 새 제보 또는 운영자 조회 시 삭제합니다. 제보 양식에서 이 브라우저의 제보를 삭제할 수 있습니다. 사진 공개 전 저작권과 식별 가능한 사람의 동의를 확인합니다.</p></section><section><h2>기기 장소 저장</h2><p>2026년 10월 5일부터 직접 저장한 장소 ID를 이 브라우저의 로컬 저장소에 보관합니다. 장소 ID는 저장 집계 서버로 보내지 않으며 로그인 계정·방문 기록과 분리됩니다. 저장 버튼을 다시 눌러 삭제하거나 브라우저 사이트 데이터를 지워 전체 삭제할 수 있습니다. 저장 완료 행동은 기존 개인정보 없는 합계에 포함됩니다.</p></section><section><h2>언어 설정</h2><p>한국어·영어 선택은 기기의 로컬 저장소에 보관합니다. 추적 식별자로 사용하지 않으며 언어 버튼으로 바꾸거나 브라우저 사이트 데이터를 지워 삭제할 수 있습니다. 언어 설정 안내 추가일: 2026년 9월 22일.</p></section></main></BilingualContent>;}
