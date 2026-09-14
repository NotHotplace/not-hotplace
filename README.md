# Not_Hotplace

조용한 카페·음식점·드라이브 코스를 찾는 지도입니다.

## 배포
이 프로젝트는 GitHub Pages용 정적 사이트가 아닙니다. GitHub 저장소를 Cloudflare Workers에 연결해 실행합니다. Google 인증은 Supabase Auth를 이용합니다.

1. 이 폴더의 **내용**을 GitHub 저장소 최상위에 올립니다. package.json과 wrangler.json이 최상위에 있어야 합니다.
2. 공개 저장소라면 https://deploy.workers.cloudflare.com/?url=GITHUB_REPOSITORY_URL 버튼에서 저장소 주소를 넣습니다. 비공개 저장소는 Cloudflare Dashboard → Workers & Pages → Create → Import a repository에서 본인 저장소 접근을 허용합니다.
3. Build command: pnpm run build / Deploy command: pnpm run deploy. DB binding은 DB입니다. Deploy 버튼이 생성한 DB ID로 wrangler.json이 갱신되는지 확인합니다. 00000000으로 시작하는 ID는 템플릿 자리표시자이며 실제 DB가 아닙니다. 자동 생성이 안 되면 D1 데이터베이스를 생성하고 해당 ID를 교체합니다.
4. Cloudflare의 해당 Worker → Settings → Variables and Secrets에서 배포 후 받은 HTTPS 주소를 SITE_URL에 넣고 SUPABASE_URL과 SUPABASE_PUBLISHABLE_KEY를 Text 변수로 추가해 Deploy를 누릅니다. 이 세 값은 wrangler.json에 넣지 않았고 keep_vars가 켜져 있어 다음 소스 배포에서도 유지됩니다. Supabase에 같은 사이트의 /auth/callback을 허용하고 Google 제공자를 켭니다.
5. Google OAuth Audience를 External / In production으로 전환하고 다른 Google 계정으로 로그인·저장·후기를 확인합니다. 관리자 계정에서만 제안 승인 메뉴가 보여야 합니다. Google이 브랜드·도메인 검증을 요구하면 해당 심사를 완료합니다. 무료 하위도메인으로 모든 검증을 통과한다고 보장하지 않습니다.

비밀키를 GitHub에 올리지 마세요. Google Client Secret은 Supabase 제공자 설정에만 넣습니다. 사이트에는 Project URL과 공개용 Publishable key만 필요합니다.

OWNER_GOOGLE_EMAIL과 SUPPORT_EMAIL은 mythdriveofficial@gmail.com으로 준비되어 있습니다. 실제 Google 로그인 완료 전에는 관리자 계정 연결 완료가 아닙니다.

기존 Sites의 후기·사용자 데이터는 이 소스에 포함하지 않았습니다. 새 D1은 비어 있는 DB입니다. 161개 공개 탐색 후보는 소스에 포함되며, 기존 사용자의 기록을 이전하려면 별도 비공개 데이터 이전이 필요합니다.

## 개발
Node 24, pnpm 11.19.0. pnpm install --frozen-lockfile 후 pnpm run build. pnpm test는 인증/권한/후기/결제 경계 검증이며 실제 외부 OAuth 연결을 검증하는 테스트는 아닙니다.

## 문의
mythdriveofficial@gmail.com

서드파티 패키지와 장소 정보·지도 경계의 출처는 각각의 라이선스와 lib/catalog.ts, lib/korea-map.json 및 사이트의 출처 표시를 확인하세요.

## 2026-09-14 업데이트
- /install: Android·iPhone 웹 앱 설치 안내와 자체 생성 QR, 개인정보가 없는 오프라인 안내 캐시.
- /trips: 세 테마의 아홉 가지 여행 일정 아이디어와 공식 예약처 링크.
- /plus: 무료 기능·Plus 혜택·기간권 비교. 기존 가격을 유지하며 자동 갱신은 없습니다.
- /stats: 운영자 전용 일별 페이지 열림 합계와 저장·후기·제안 수. 0003_daily_visits.sql을 적용한 뒤 새 방문부터 집계합니다. 고유 방문자 수가 아닙니다.
- /sitemap.xml, /robots.txt: 공개 소개 페이지와 검색 메타데이터.
- GitHub Actions는 PR와 main의 타입 검사·동작 검사·빌드를 실행합니다. 운영 배포는 기존 Cloudflare Workers Builds의 main 연결을 사용합니다.

### Plus 판매 준비
실결제는 계속 비활성화되어 있습니다. 현재 가격은 1개월 4,900원, 6개월 26,460원, 1년 41,160원(부가세 포함)이며 선택한 기간 전체를 한 번 결제합니다. 카드와 간편결제는 가맹점 계약에서 허용된 결제수단이 토스 통합결제창에 표시됩니다. 무료 체험에 카드를 등록하지 않으며 자동 결제로 전환하지 않습니다.

사업자등록·PG 계약 후 토스의 API 개별 연동 운영키를 Cloudflare 환경에 설정합니다. TOSS_SECRET_KEY는 암호화된 Secret으로 저장하고 저장소에 넣지 않습니다. TOSS_CLIENT_KEY, BUSINESS_NAME, BUSINESS_NUMBER, BUSINESS_ADDRESS, SUPPORT_EMAIL과 실제 판매 조건을 확인하고 TERMS_CONFIRMED를 설정한 후, 승인된 출시 시점에 PAYMENTS_LIVE_ENABLED를 true로 변경합니다. 이 변경은 wrangler.json의 false 값도 함께 갱신해야 다음 배포에서 유지됩니다. 현재는 false를 유지합니다.

토스 PAYMENT_STATUS_CHANGED 웹훅 수신 경로는 https://nothotplace.com/api/payments/webhook 입니다. 테스트 상점과 운영 상점을 분리하고, 테스트 주문을 운영 주문으로 옮기지 않습니다. 실제 카드 결제나 계약은 이번 업데이트에서 진행하지 않았습니다. 국외 처리 국가·제공업체 보관기간 등 개인정보 고지 미확정 항목은 운영자가 추가 확인해야 합니다.
