# English area labels and guide return (2026-10-10)

## Presentation-only aliases

`lib/korean-area-labels.json` contains exact English display aliases for the 135 distinct Korean area labels currently in the assembled catalog, plus exact supported Korean city/region labels used by approved community suggestions. District/county/city names retain their romanized administrative suffixes (`-gu`, `-gun`, `-si`); compact city/province names keep cards readable. `placeArea` only translates a complete known label. Unknown labels remain whole instead of being partly translated. Venue names, source addresses, region identifiers, filtering, coordinates, photos and credits are unchanged.

The same helper is used for home recommendations/themes, the rest finder, thematic and regional guides, detail/related-place areas, detail metadata and the local journal including its image exports. Korean displays remain the original source labels. Addresses remain in the source language so visitors can copy the navigable address.

### Primary naming evidence, checked 2026-10-10

- The Ministry of the Interior and Safety's [2026-06-17 announcement](https://www.mois.go.kr/video/bbs/type019/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000255&nttId=126940&searchCode1=) states that the merged Jeonnam/Gwangju authority launches on 2026-07-01. Therefore the source label `전남광주통합특별시` is not replaced with the historical Jeollanam-do.
- A [2026-06-30 official reply by 통합기획담당관](https://www.jeonnam.go.kr/M6691/boardView.do?boardId=M6691&menuId=jeonnam0101120200&pageIndex=7&seq=591) explicitly gives “Jeonnam-Gwangju Special Metropolitan City” and the short form “Jeonnam-Gwangju.” The reply was accessible in indexed text; direct fetches intermittently timed out. The [current official tourism portal](https://tour.jeonnam-gwangju.go.kr/) independently uses the full English name in its footer.
- [Jeonbuk State's own introduction](https://www.jeonbuk.go.kr/governor/index.jeonbuk?menuCd=DOM_000000701000000000) dates its new status/name to 2024-01-18. [Muju's county council](https://assem.muju.go.kr/eng/content/organization.html) uses “Muju-gun, Jeonbuk State.”
- [Damyang's English county site](https://www.damyang.go.kr/eng/index.damyang) confirms Damyang-gun/County, but its English address still says Jeollanam-do. That older provincial label does not override the newer official merger evidence.
- [Gangwon's government](https://state.gwd.go.kr/) uses “Gangwon State.” Jeju is a compact geographic display label; the [official regional investment page](https://invest.investkorea.org/jj-en/cntnts/i-1489/web.do) confirms the full “Jeju Special Self-Governing Province” name.

Examples: `전남광주통합특별시 담양군` → `Damyang-gun, Jeonnam-Gwangju`; `전북특별자치도 무주군` → `Muju-gun, Jeonbuk State`. These are display aliases, not address or administrative-boundary migrations.

## Thematic-guide return

All thematic-guide photo, title and detail-action links now carry the known guide path and selected-card anchor. The detail back link says “Back to the guide” / “가이드로 돌아가기.” Language switches and related-place navigation retain that guide context while updating its language. All 12 waterside cards remain.

Only slugs present in `guides` and `ko`/`en` routes are accepted. Guide queries are discarded; only a `#guide-place-...` anchor survives. Existing home/map filters, regional pagination and regional card anchors remain supported. External URLs, unknown routes, encoded paths, control characters and backslashes remain rejected. Navigation uses native links; no history interception or extra client state was added. SEO links and JSON-LD keep their clean canonical URLs.

## Verification

- `npm run check` (same TypeScript command as CI)
- `npm test`: all existing suites plus exact area alias coverage; repeated guide/detail/language navigation and malicious return targets
- `XDG_CONFIG_HOME=/tmp/nhp-en-guide-config CI=true WRANGLER_SEND_METRICS=false npm run build`
- `XDG_CONFIG_HOME=/tmp/nhp-en-guide-config npm run test:seo`: real built-worker HTML and RSC checks, now including waterside-guide links, localized contextual returns and the two reported English area examples

The npm scripts are identical to their pnpm equivalents. This environment reuses existing dependencies with the exact same lockfile hash; no dependency or lockfile changes. No browser/visual QA was performed in this patch session, and no production resources were changed.
