# Destination-only travel modes (local review, 2026-10-17)

Scope: an inline, keyboard-accessible disclosure on KO/EN place details and Explorer detail dialogs. Driving, walking and transit are handed to external maps only after an explicit link click. Existing place-search links remain search links. The mobile Directions action opens the inline selector with the existing hash/focus/history mechanism. No nested modal, automatic launch, delayed redirect, API key, account setup, route calculation, live ETA or new geolocation request.

## Official URL references checked

- Google: https://developers.google.com/maps/documentation/urls/get-started — `/maps/dir/?api=1`, `destination`, `travelmode=driving|walking|transit`. Origin omitted; Google may use its own location permission or prompt for an origin. Cross-platform HTTPS opens app where supported, otherwise browser. No API key. Catalog has no verified Google place IDs, so none are fabricated.
- Naver: https://guide.ncloud-docs.com/docs/en/application-maps-url-scheme-vpc and https://guide.ncloud-docs.com/docs/en/maps-url-scheme — `nmap://route/car|walk|public`, `dlat`, `dlng`, optional `dname`, mandatory webpage URL `appname`. Origin fields are optional. Documented coordinate bounds are enforced. App must be installed; explicit separate web search fallback is provided. No installation redirect/timer.
- Kakao: https://apis.map.kakao.com/ios_v2/docs/getting-started/urlscheme/ — `kakaomap://route`, `ep`, `by=car|foot|publictransit`. Destination-only scheme is also shown by official support at https://devtalk.kakao.com/t/url-scheme/38132/6 .
- Kakao web: https://apis.map.kakao.com/web/guide/ — destination-only `/link/to/name,latitude,longitude`. Mode-specific web `/link/by/...` examples require a starting point, so the web fallback explicitly asks the visitor to choose the mode again rather than fabricating an origin or promising mode preservation.

Names/addresses use URLSearchParams or encodeURIComponent. No location or user identifier is appended. Existing aggregate map-open tracking remains unchanged and does not imply navigation started, arrival, or a real visit. New UI privacy text is scoped to directions links because the pre-existing nearby explorer is separate.

## Coordinate handling

Valid finite latitude/longitude alone do not establish an entrance. Coordinate routes require existing catalog `locationInfo` with reference/entrance kind, parseable credential-free HTTPS evidence source, and real nonfuture YYYY-MM-DD check date (Asia/Seoul day convention). Reference pins are labeled explicitly as not entrance coordinates, with source and date visible. Unknown, invalid, or unprovenanced coordinates use name/address lookup. All source records are unchanged. No entrance is guessed and no provider place ID is invented.

Korean places get Naver/Kakao app routes only with sourced coordinates in Naver's documented bounds, alongside Google. Unsourced Korean destinations get visible Naver/Kakao name/address search alternatives, labeled to select the mode there. Other countries get Google; provider coverage remains provider-dependent.

## Validation

- `node scripts/verify-place-directions.cjs`: URL modes/encoding including Korean and punctuation, no origins/keys/place IDs, invalid coordinates, missing/invalid/future source dates, unsafe source URLs, KR/world behavior, local radio changes, explicit-click tracking, close/focus and preserved search semantics.
- `npm test`, `node node_modules/typescript/bin/tsc --noEmit`, `npm run build`, `npm run test:seo` are local checks only. See final review report for latest run outcomes.
- Browser QA was attempted in cloud-local Chromium against the local preview with all non-local requests blocked. The environment prevented Chromium startup (Unix socket restriction; escalation failed before launch). Therefore visual layout, actual browser radio behavior and live native app launching have not been verified. No route was opened using user location.

Publishing/merging/deployment requires separate approval. Native provider behavior should be smoke-tested on a permitted device before release, using a manual origin and no user precise location.

Final local checks (2026-10-17): type check passed; complete `npm test` passed; production build passed; SEO validation passed 272 real HTML/API responses across 30 countries and multiple crawler/user agents, with 957 sitemap URLs. `git diff --check` passed. The direct pnpm launcher initially tried to create its unavailable home store; equivalent package scripts were successfully run through npm against the already-installed dependencies. No package or lockfile dependency changes were needed.
