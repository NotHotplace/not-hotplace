# October 1, 2026 release

The requested physical QR promotion is excluded. Existing scheduled Instagram posts are unchanged.

## Evidence and review sources

`lib/external-review-memos.json` contains 19 short, independently written place notes. Each includes the source actually read, the date it was checked, an explicit age description, and a separate visiting consideration. These notes are external editorial context; they do not create user reviews, review counts, quietness percentages, time recommendations or verified visits.

Sources examined include publicly readable Polle, Diningcode, Tripadvisor, Tistory visit reports, publicly indexed Daangn reviews, and Wanderlog. The Division Stumptown note explicitly identifies Google reviews displayed by Wanderlog. The Leach Garden note identifies an external review summary instead of claiming individual Google reviews were read. Diningcode’s linked Naver visit reports are labeled accordingly. Some direct Google, Naver, Kakao and Tabling pages could not be read in the available public retrieval surface. They are linked for the visitor, without invented summaries. This is not a claim that all reviews of all 401 places were read.

Naver’s public Local Search API returns place details, with a blog/café-review-count sort option, but does not document review bodies: https://developers.naver.com/docs/serviceapi/search/local/local.md

Kakao’s public Maps REST API documents place searches and coordinates, but does not document review bodies: https://developers.kakao.com/docs/ko/kakaomap/rest-api

Google Place Details does provide a reviews field in its Enterprise + Atmosphere SKU: https://developers.google.com/maps/documentation/places/web-service/place-details. No billed Google API or paid review provider has been configured or called by this release.

## Location sources

The 12 Tokyo points are the tourism agency’s published map locations, matched by the exact catalog source path against the `contents.json` records from its public travel-directory map response. Relevant public areas: 7, 8, 9, 37, 47, 50, 59, 61, 65, 66, 69 and 73. Example public map endpoint: https://www.gotokyo.org/en/travel-directory/api/map/area/65/limit/0

The eight Osaka points are from the `maps.google.com/maps?output=embed&q=latitude,longitude` frame on the exact Osaka tourism source for each catalog place. `lib/location-catalog.json` records the place-level source and check date. All 20 points are labeled reference points. Kyoto map viewport centers were not turned into precise place coordinates. Entrance and parking directions remain separate source checks.

## Conditions, privacy and moderation

Published condition facts include a specific source and check date. Music, partitioned seats, individual seats and ordering experiences from account reviews need three distinct account reports in the last 90 days. Guest reactions remain separate. Quietness filtering is free; the detailed time comparison remains Plus.

Information reports never automatically change a place. Reports use the existing Secure HttpOnly same-site pseudonymous cookie, limited submissions and 90-day expiry, plus own-browser deletion. The operator queue can mark reports resolved or dismissed after checking the source.

Public contributor profiles require explicit consent, authenticated ownership and operator approval. Collections contain 2–8 distinct registered places in one region, require approval, and become invisible on consent withdrawal. Profile edits require review again. Public responses expose no account ID or email. A user can delete their profile application and collections. Approved place suggestions show contributor credit only while the profile remains consenting and approved.

Story cards render locally at 1080×1920 from up to three records selected by the user. Record dates and individual noise choices are excluded by default. Download and native share require a user click. Photos are limited to compatible published licenses and include credit and a place page for the full source/license. Planned records are labeled as places to explore, not visits.

## Validation

Passed `pnpm run check`, `pnpm test` (including new report, contributor, unique reviewer, expiry and withdrawal checks), and the production build. Mobile/desktop browser smoke flows passed for the homepage, free condition filters, source links, information reports, contributor consent/re-submission/deletion, owner moderation and actual PNG download. All three downloaded cards were verified at 1080×1920; no browser exceptions or mobile horizontal overflow were found. Development analytics remained suppressed. The migration adds community/report tables without deleting existing place, review, payment or authentication records. Deploy through the established GitHub/Cloudflare pipeline; payment activation remains unchanged.
