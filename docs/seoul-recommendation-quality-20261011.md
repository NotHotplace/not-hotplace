# Seoul recommendation quality: local review bundle

Prepared against `0f3cb71e32f46a9df620ff90f7b400f9e90998b9` on 2026-10-11. This document describes a local proposal, not a publication or deployment.

## Scope and observed defect

The existing home finder ranked sourced visit-detail counts and a licensed-photo bonus. For selected Seoul, a general pause therefore showed Mouse Rabbit, 1984 and Ikseon-dong Geujip even when details established operating information rather than a specific reason to rest there.

The stricter selection is limited to requests with country `KR` and an explicitly supplied region `서울`. Default Korea requests and every other country/region keep the existing selection algorithm. Map/region ordering, the expanded finder, the globe, review thresholds and moderation behavior are unchanged. Added records and improved source text remain available through the existing browse surfaces.

## Selection and explanation

- An unreviewed home candidate needs a dated HTTPS source with both Korean and English text that explicitly applies to the selected pause, or an actual relevant published condition. `all` means the general pause; it is not a wildcard for every purpose.
- Hours, parking, menus, photographs, popularity, extra detail rows and generic reminders do not establish rest-purpose fit. External visitor impressions alone do not qualify a venue.
- Existing account-feedback thresholds remain conjunctive: at least three recent responses, at least 60% quietness and at least 70% satisfaction. Time-bucket feedback alone does not bypass satisfaction. Paused venues remain excluded.
- Sufficient visitor evidence sorts first. Otherwise comparable candidates use distance when supplied and then stable ID ordering. There is no invented confidence score or photo bonus.
- The exact selected reason appears on the initial card and in its source disclosure. Visitor-only candidates show actual response counts. Dated caveats are not hidden by the mobile two-line teaser clamp.
- The shortlist may contain zero, one or two candidates. Short results explain the limit and the full-candidate browse link remains visible. Unsupported places are never inserted to fill a quota.

## Proposed Seoul results

With public-source data and no visitor reviews:

| Selected pause | Candidates |
| --- | --- |
| General pause | Seoul Forest, Seonyudo Park, 1984 |
| Coffee or tea | 1984 |
| A meal | Yu Yuan |
| A walk or view | Seoul Forest, Seonyudo Park |
| A private room | Sulwhasoo Dosan Spa, Yu Yuan |
| A spa visit | Sulwhasoo Dosan Spa |

The Seoul Forest card explicitly says the Garden Expo runs through **27 October 2026**. These are sourced visit candidates, not promises of quietness or empty seats.

## Catalog changes

Two new, deduplicated walking parks raise the catalog from **1,008 to 1,010 places**, and Seoul from **34 to 36**. The existing Seongsu Forest café on Seoul Forest 2-gil is a different venue and is preserved. No existing ID is removed or replaced.

### Seonyudo Park (`kr-seoul-seonyudo-park`)

The [Seoul Parks operator](https://parks.seoul.go.kr/content.do?key=2604300019) describes the Garden of Green Columns, riverside outlook/rest areas, approaches and general parking restrictions. [Visit Seoul](https://english.visitseoul.net/yongsan%26yeouido-area/SeonyudoPark/ENP000378) separates park hours from Story Hall hours. [Visit Korea](https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=175826) supports free general entry.

The record retains accessible-only on-site parking versus nearby general parking, park food/picnic restrictions, shared seating, and the limitations of one dated 2023 visitor report. Coordinates are the operator-linked park reference, not an entrance or confirmed step-free route. No dedicated solo/private seating, measured noise or live occupancy is asserted.

### Seoul Forest (`kr-seoul-forest`)

The [operator's park description](https://parks.seoul.go.kr/park/detailView.do?pIdx=5) supports bench gardens, a lakeside rest path and facility-specific hours. [Current operator guidance](https://parks.seoul.go.kr/mini/content.do?key=2605260022) supports paid parking and park rules. The [Seoul government Expo announcement](https://www.seoul.go.kr/news/news_report.do?nttNo=456708) supplies the 1 May–27 October 2026 event dates.

The event warning is on the initial reason, full description and visit detail; its distinct source is linked in the reason disclosure. General park entry is free, while separate program terms remain distinct. No entrance coordinate was verified, so the new record intentionally has no latitude/longitude and cannot enter nearby-distance results. Address-based directions remain available.

### Existing 1984 (`tour-4108662`)

A [Korea Tourism Organization article written in September 2026](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=ca39280b-bb63-454f-b204-9dc2afbef606) describes a long shared reading/work desk, books and LP displays, rear sofas and an outdoor terrace. The new bilingual reason and visit row use those concrete features. Its listed 09:00–24:00 hours are explicitly dated tourism information, not live operator confirmation; earlier disagreement remains disclosed. Current menu prices and parking remain unverified.

The article's KOGL Type 4 photographs are not imported. Existing TourAPI imagery is unchanged; no new asset clearance is claimed for those existing files.

## New photograph rights and dates

- **Seonyudo:** [Seoul Tourism Archive asset ARP0082v1](https://archive.visitseoul.net/ko/contents/ARP0082v1), explicitly KOGL Type 1 with the [archive's copyright policy](https://archive.visitseoul.net/ko/page/copyright?_ID=200100). Only the inspected **852 × 567 preview** is used. The larger original was not downloaded; **capture date is unknown** and is never inferred from an upload path. The file was converted to WebP without resizing/cropping; presentation may crop it.
- **Seoul Forest:** [Qhairy's image-specific Commons page](https://commons.wikimedia.org/wiki/File:Seoul_Forest_Walk_Path.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), captured **2026-06-21**. EXIF orientation 6 is corrected and the portrait image is proportionally resized to **900 × 1200**, then converted to WebP. No crop is baked into the file; presentation may crop it.

Both files carry source/creator/license provenance in embedded metadata and a public `.license.json` sidecar with exact byte count, dimensions and SHA-256. Visible bilingual notes distinguish historic photographs from current appearance, available seats and crowd/noise conditions. Neither implies endorsement. The parks use the normal single-image display so the complete capture/adaptation note remains visible, rather than the legacy gallery's generic note.

## Verification and preview

- Full `npm test`, TypeScript `npm run check` and production `npm run build` are run against the final files.
- New synthetic tests cover source/purpose eligibility, exact selected explanations, 0–3 results, source completeness/photo independence, existing feedback thresholds, immutable/deterministic selection, nearby edge cases and geography.
- **1,505 complete serialized non-rollout responses** are compared against the existing algorithm using the same current catalog, including default Korea requests with no explicit region. This is algorithm parity, not a claim that newly added records never appear in ordinary browsing.
- New Seoul record tests cover counts/deduplication, bilingual aliases/detail markup/return links, parking and seat caveats, photo rights and orientation, source-versus-capture dates, and the first-card Expo warning.
- Existing offline auth/payment fixture guards, private/no-store API checks, device saves, search, guide/region/map return, globe and installation flows remain in the aggregate suite.
- Local production-Worker HTTP verification is reported separately with its actual terminal result. The expanded HTTP suite includes both new park pages and exact photo/rights bytes.
- A rendered-browser/physical-mobile pass is **not established** in this executor: installed Chromium aborts on a prohibited socket syscall, and the cloud browser cannot reach the isolated local server. The responsive caveat/credit CSS has explicit regression guards, but a real 360/390px Korean/English browser review is still required in a reachable preview.

No remote branch, PR, merge, deployment, payment, affiliate, advertising or social-queue action is part of this local bundle. Before publication, use an authorized reachable preview to check Seoul home → detail → return, park/photo sources, mobile warning visibility, changed purpose/country, empty/partial results and the existing browse/guide paths.

## Final local result

On the final code, `npm run check`, all **25 scripts** in `npm test`, `npm run build`, and `npm run test:seo` passed. The HTTP run served **240 real HTML responses**, covered all 30 countries and five browser/crawler user-agent classes, verified both new photographs and their rights sidecars, and checked **955 sitemap URLs**. The built Worker used the installed local runtime's compatible date (2026-05-15); production configuration was not edited.

`git diff --check` and a reverse-apply check of the exact binary patch passed. A semantic comparison with the base commit confirmed exactly two new park IDs, no removed IDs, unchanged existing source records except the bounded 1984 supplement and Seoul purpose metadata, unchanged existing compact index entries, and unchanged non-Korean directory entries. Authentication/payment fixture hardening, the dated Bugak construction warning, the existing ranking/expanded-finder/region comparators and production payment-disabled configuration are byte-unchanged.

There is no configured lint script, no remote CI run, no live OAuth/payment test, and no rendered-browser or physical-device pass in this result. No local preview server is left running. The next release gate is a reachable authorized preview for Korean/English desktop and 360/390px mobile visual/interactivity review, followed by a separate publication decision.
