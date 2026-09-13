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
