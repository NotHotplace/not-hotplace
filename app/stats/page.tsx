import {getSiteUser} from '@/lib/site-auth';
import {isOwner} from '@/lib/store';
import {trafficSummary} from '@/lib/traffic';
export const dynamic='force-dynamic';
export const metadata={title:'운영자 이용 통계 | NotHotplace',robots:{index:false,follow:false}};
export default async function Stats(){
 const user=await getSiteUser();
 if(!user||!await isOwner(user))return <main className="rest-page"><a className="rest-brand" href="/">Not_Hotplace</a><header className="rest-hero"><h1>운영자 이용 통계</h1><p>운영자 계정으로 로그인하면 볼 수 있어요.</p><a href="/login" className="rest-primary">로그인</a></header></main>;
 let stats;try{stats=await trafficSummary();}catch{return <main className="rest-page"><h1>이용 통계를 불러오지 못했어요.</h1><p>잠시 후 새로고침해 주세요.</p><a href="/">지도로 돌아가기</a></main>;}
 const {traffic,activity,days}=stats;
 return <main className="rest-page"><a className="rest-brand" href="/">Not<span>_</span>Hotplace</a><header className="rest-hero"><span className="rest-eyebrow">OWNER / 한국 시간 기준</span><h1>쉼을 찾아온 발걸음.</h1><p>페이지를 연 횟수와 서비스에 쌓인 기록을 확인하세요.</p></header><div className="stats-grid">{[['오늘 방문 횟수',traffic.today],['최근 7일',traffic.week],['최근 30일',traffic.month],['저장된 후기',activity.reviews],['장소 저장',activity.saves],['승인 대기 제안',activity.pending]].map(([label,value])=><section key={label}><span>{label}</span><strong>{Number(value).toLocaleString('ko-KR')}</strong></section>)}</div><p className="rest-note">{traffic.since?'방문 집계 시작: '+traffic.since:'배포 후 첫 방문부터 집계를 시작합니다.'} · 방문 횟수는 페이지 열림 수입니다. 새로고침·재방문이 포함되며 고유 방문자 수와 다릅니다. 개인정보 보호 신호나 차단 도구로 집계되지 않는 방문도 있습니다. 집계 이전 기록은 포함되지 않습니다.</p><section className="stats-days"><h2>최근 30일 일별 방문 횟수</h2>{days.length?<table><thead><tr><th>날짜</th><th>페이지 열림</th></tr></thead><tbody>{days.map(day=><tr key={day.day}><td>{day.day}</td><td>{day.views.toLocaleString('ko-KR')}</td></tr>)}</tbody></table>:<p>아직 집계된 방문이 없어요.</p>}</section><footer className="rest-footer"><a href="/">지도로 돌아가기</a><a href="/privacy">개인정보처리방침</a></footer></main>;
}
