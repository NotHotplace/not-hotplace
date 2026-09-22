import {Localized,LanguageToggle} from '@/app/locale';
import {getSiteUser,googleReady} from '@/lib/site-auth';
import {isOwner} from '@/lib/store';
export const dynamic='force-dynamic';
export default async function AccountCheck(){
 const user=await getSiteUser();
 const owner=user?await isOwner(user):false;
 return <Localized><div className="locale-page-tools"><LanguageToggle/></div><main className="account-page"><a className="brand" href="/">Not<span>_</span>Hotplace</a>
  <h1>로그인 연결 확인</h1><p>지금 로그인한 계정과 권한을 확인해요.</p>
  <dl><dt>Google 연결 설정</dt><dd>{googleReady()?'연결값 등록됨 · 실제 로그인 확인 필요':'외부 계정 연결 필요'}</dd>
  <dt>현재 로그인</dt><dd>{user?user.provider==='google'?'Google':'ChatGPT':'로그인 전'}</dd>
  <dt>현재 계정</dt><dd>{user?.email||'—'}</dd><dt>현재 권한</dt><dd>{owner?'관리자':user?'일반 사용자':'방문자'}</dd></dl>
  {googleReady()&&<a className="google-login" href="/auth/google?next=%2Faccount-check" target="_top">Google로 로그인 확인</a>}
  <a className="secondary" href="/">지도로 돌아가기</a><p className="small">다른 구글 계정에서는 ‘일반 사용자’로 표시되어야 해요. 후기와 저장을 시험한 뒤 실제로 다시 로그인해 기록이 남아 있는지 확인해 주세요.</p>
 </main></Localized>;
}
