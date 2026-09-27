# 장소 경험 개선 기록

기준: `99d16d3d23f9d80767396e4337c19399fdeacbbb` · 자료 확인일: 2026-09-27

## 목적과 변경

사진과 방문 정보가 부족하고, 장소 상세에서 저장·후기를 남기려면 탐색 화면으로 되돌아가야 했습니다. 한국 대표 30곳의 방문 준비 정보를 보강하고 상세 페이지에서 행동을 완료하도록 연결했습니다.

- 한국 324곳·미국 12곳의 총수는 유지합니다. 한국 사진 보유 장소는 33곳에서 43곳으로 늘어납니다.
- 대표 30곳에 각 3장, 총 90장의 실제 관광 사진 갤러리를 제공합니다. 한·영 소개, 운영 시간, 휴무, 주차, 가격 확인 상태, 혼자 이용 조건을 함께 표시합니다. 출처에서 확인하지 못한 가격·이용 조건은 확인이 필요하다고 표시하며 현장 검증이나 조용함을 보장하지 않습니다.
- 카드는 독립 상세 페이지로 연결됩니다. 목록으로 돌아갈 때 지역·카테고리·검색·필터·보기 방식·목록 스크롤을 같은 탭에서 복원합니다. URL 언어를 서버 첫 렌더에 반영합니다.
- 상세 페이지에 최근 90일 후기 수·비율·최신 평가일·소표본 안내를 표시합니다. 로그인한 사람은 저장 취소와 자신의 후기 작성·수정·삭제를 바로 할 수 있습니다. 기존 서버 권한과 Plus 시간대 분석 제한을 재사용합니다.
- 상세 조회·지도 열기·저장·후기·공유를 날짜/국가/유입 분류별 합계로 집계합니다. 사용자·장소 식별자, 원문 URL, 검색어, 위치는 수집하지 않습니다. DNT/GPC 요청은 제외합니다. 유입 분류만 탭의 sessionStorage에 유지하고 관리자 통계에 최근 30일 합계를 표시합니다. 고유 방문자·실제 길찾기 완료·인과적인 전환율을 뜻하지 않습니다.

## 배포와 검증

- `pnpm run check`, `pnpm test`, `CI=true WRANGLER_SEND_METRICS=false pnpm run build`: 통과.
- 신규 검사: 상세 API의 비공개 응답·본인 데이터만 반환·후기 최신성·삭제 반영, 30곳/90사진 파일, 집계 스키마·허용 항목·크기·출처·DNT/GPC 경계, 관리자 통계 권한.
- 추가 마이그레이션: `drizzle/0004_engagement_totals.sql`. 기존 `pnpm run deploy`가 원격 마이그레이션 후 배포합니다. 기존 데이터 수정·삭제는 없습니다.
- 새 런타임 의존성이나 결제 설정 변경은 없습니다. 롤백은 PR을 revert하여 재배포하고 추가 집계 테이블은 남겨 두는 방식입니다.
- 외부 Google 로그인은 자동 실행하지 않았습니다. 인증 상태별 저장·후기 경계는 테스트 DB와 인증 모의 데이터로 검증했습니다.

## 사진 출처

각 원본의 관광정보 이미지 메타데이터 `cpyrhtDivCd=Type1`을 확인한 사진만 사용했습니다. 사진별 원본 주소·출처·한국관광공사 표기·공공누리 제1유형 링크·변환 안내는 `lib/kr-place-guides.json`과 화면에 보존합니다. WebP로 변환하고 최대 크기를 1440×1080px로 줄였으며 원본 워터마크를 지우지 않았습니다. 소개 문장은 방문 계획에 필요한 범위로 별도 작성했습니다.

| 장소 ID | 자료 출처 | 사진 수 |
| --- | --- | --- |
| tour-3572781 | https://www.ktriptips.com/kor/food/3572781 | 3 |
| tour-4060255 | https://www.ktriptips.com/kor/food/4060255 | 3 |
| tour-2758220 | https://www.ktriptips.com/kor/tourspot/2758220 | 3 |
| tour-4067033 | https://www.ktriptips.com/kor/tourspot/4067033 | 3 |
| tour-4055326 | https://www.ktriptips.com/kor/food/4055326 | 3 |
| tour-3391733 | https://www.ktriptips.com/kor/food/3391733 | 3 |
| tour-3065226 | https://www.ktriptips.com/kor/tourspot/3065226 | 3 |
| tour-4102223 | https://www.ktriptips.com/kor/food/4102223 | 3 |
| tour-4105377 | https://www.ktriptips.com/kor/food/4105377 | 3 |
| tour-4086897 | https://www.ktriptips.com/kor/food/4086897 | 3 |
| tour-4108662 | https://www.ktriptips.com/kor/food/4108662 | 3 |
| tour-2946087 | https://www.ktriptips.com/kor/food/2946087 | 3 |
| tour-4084686 | https://www.ktriptips.com/kor/food/4084686 | 3 |
| tour-126674 | https://www.ktriptips.com/kor/tourspot/126674 | 3 |
| tour-2766515 | https://www.ktriptips.com/kor/food/2766515 | 3 |
| tour-2746373 | https://www.ktriptips.com/kor/tourspot/2746373 | 3 |
| tour-2767445 | https://www.ktriptips.com/kor/tourspot/2767445 | 3 |
| tour-4040783 | https://www.ktriptips.com/kor/food/4040783 | 3 |
| tour-4040770 | https://www.ktriptips.com/kor/food/4040770 | 3 |
| tour-4101201 | https://www.ktriptips.com/kor/food/4101201 | 3 |
| tour-4079286 | https://www.ktriptips.com/kor/food/4079286 | 3 |
| tour-2833705 | https://www.ktriptips.com/kor/food/2833705 | 3 |
| tour-4096621 | https://www.ktriptips.com/kor/food/4096621 | 3 |
| tour-4090470 | https://www.ktriptips.com/kor/food/4090470 | 3 |
| tour-2791501 | https://www.ktriptips.com/kor/tourspot/2791501 | 3 |
| tour-3046002 | https://www.ktriptips.com/kor/tourspot/3046002 | 3 |
| tour-4054732 | https://www.ktriptips.com/kor/tourspot/4054732 | 3 |
| tour-4095424 | https://www.ktriptips.com/kor/food/4095424 | 3 |
| tour-3456289 | https://www.ktriptips.com/kor/food/3456289 | 3 |
| tour-4020623 | https://www.ktriptips.com/kor/food/4020623 | 3 |
