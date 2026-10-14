# Editorial homepage implementation, 13 October 2026

Local implementation of the approved editorial-home direction, with the later soft-finish adjustment. This is production React/CSS integrated into the existing app, not the standalone design prototype.

## Scope

- Compact blue-ocean globe control at the top. The existing interactive globe remains the only country selector, with all 30 country pins, keyboard navigation, drag recovery, pause/reduced-motion controls and lazy geometry loading.
- A plain selected-country label, country-scoped region selector and existing six purpose choices. Defaults, remembered country, bilingual choices and home return URLs remain intact.
- One lead from the actual finder response. Seonyudo Park is promoted only when it is already eligible for KR / Seoul / walking. No place is imported to fill an empty response or another country/purpose. Other eligible candidates remain available in a disclosure.
- Real existing photo, visible creator/license/source/derivative notice, complete expandable visit facts and recommendation evidence. Ben’s initial music qualification remains complete. No visit, live crowd or available-seat claim is added.
- Small Yeonaon portrait. Two country-appropriate guides are visible; every remaining eligible guide is still available through a native disclosure. Region browsing, journal, full guide index and the original theme explorer remain linked.
- App installation is visible in the header and footer, including the phone styles. The full-place search/map route is immediately available; existing search, geolocation, auth, device/account save and place-detail code is retained.
- Photos use a 10–12 px radius; the primary button uses 9 px. A lighter border treatment, spacing, serif display heading and larger photo replace the previous large illustrated introduction.

## Combined corrections

The same local branch includes the separately reviewed name/source corrections:
- Sourced Ben’s Library English name and search aliases; verified Seonyudo Park / Seoul Forest English names.
- Separate record-update and individual-source check dates in guides/details.
- Hyde Park’s expired marathon notice removed from current guidance; the older fountain closure remains historical and current operation is unverified.

Place counts remain 1,010 total / 36 Seoul. No place addition, pricing, payment, account, coordinate, repository setting or deployment configuration change.

## Asset provenance

Only one small derivative is new: `public/assets/home-globe.webp` (7,948 bytes, 208 px). It is resized from the approved October 13 design’s static globe preview, using the project’s existing Natural Earth 110m world geometry and D3 projection. Natural Earth is public domain: https://www.naturalearthdata.com/about/terms-of-use/ . No new map dataset or JavaScript library is introduced.

SHA-256: `96a9e8d2b0e18ae2d03b4ba3b2fa37b7857108dde4eb797f84fd52dce06ed3a6`.

Seonyudo reuses `public/places/kr-seoul-seonyudo-park-verified.webp` without modifying it. Its Seoul Tourism Organization / KOGL Type 1 provenance stays next to the photograph through the existing PhotoCredit component. Source: https://archive.visitseoul.net/ko/contents/ARP0082v1 . License: https://archive.visitseoul.net/ko/page/copyright?_ID=200100 . Photo capture date remains unknown.

Yeonaon reuses the existing approved `public/assets/brand-tea-guide.webp`. No generated replacement artwork, external font, dependency or large new photograph.

## Verification

Passed locally on the combined code:
- TypeScript: `npm run check`.
- Entire existing and new test suite: `npm test`.
- Production bundle: `npm run build`.
- `npm run test:seo`: 262 actual built-Worker HTML/API responses, across all 30 countries, both languages, canonical/hreflang, browser/bot user agents, place/source dates, sitemap and return paths.
- New editorial tests render the real component markup for both languages and all guide scopes. They cover two visible guides, the complete expandable remainder, licensed lead attribution, exact candidate counts, no cross-country or missing-candidate Seoul fallback, complete Ben music caveat, install entries, contrast, reduced-motion and the image budget.
- Independent source review found and fixed a tablet-width no-photo cascade issue. The no-photo single-column rule now outranks the two-column tablet rule and has a regression assertion.
- Existing interaction harnesses cover 30-country traversal at four widths, pointer/keyboard/cancel/reopen paths, stale/aborted requests, fallback/empty/error results, country/purpose changes, saved language, root legacy-query redirects, account/device saves and return navigation.

### Explicit limitation

Actual responsive browser rendering is NOT verified. Local Chromium fails at process-socket creation with `Operation not permitted`, including the supported elevated retry. There are no implementation screenshots in this package. The previously approved design boards are design references, not browser evidence. Before production release, verify the actual app at desktop and phone widths in an authorized preview, including country/purpose changes, language changes, source/guide disclosures, installation entry and place-return navigation.

These checks do not constitute live Google sign-in, OS app installation, real payments, load testing or field verification.

## Resource comparison

Fresh production builds compared with main `7121c9f4`:
- Home JavaScript static-import closure: 112,079 → 114,349 gzip bytes (+2,270).
- All CSS: 54,186 → 56,622 gzip bytes (+2,436).
- One new 7,948-byte globe thumbnail. Existing venue and portrait files are reused.
- No dependency or lockfile change. Full catalog still excluded from the client graph.

Gzip level 9 per emitted asset; these are build-size measurements, not browser network timing or Core Web Vitals.

## Release boundary

Local commits and a reviewable source patch only. No remote branch push, pull request, merge, public preview, production deployment, account change or external communication has been performed. Review the combined patch and obtain publication approval before creating the shared preview or release.
