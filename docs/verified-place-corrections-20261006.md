# Verified place corrections — October 6, 2026

Baseline: production main `0ee841e5249e3e933cdff95fef8dd9ea28da539f`. Scope: four existing records, their guide mirrors, photo provenance, and regression coverage. All 1,007 records remain. This check does not establish current venue operations or refresh unrelated facts.

## 주암산가창저수지 (`tour-2746373`)

- [KTO linked-data record](https://data.visitkorea.or.kr/page/2746373) and [the cited tourism listing](https://www.ktriptips.com/kor/tourspot/2746373) both mention parking and give `경상북도 청도군 각북면 오산리` as the address. The latter shows a January 8, 2025 modification date.
- The existing address is `대구광역시 달성군 가창면 용계리`. The combined mountain/reservoir identity does not establish a visitor entrance or precise parking location. The address and coordinates are therefore preserved and the disagreement is disclosed.
- Replaced the unsupported no-parking claim with uncertainty about the exact parking area and fees. Removed the explicit parking status and retained no positive parking condition. The wording does not trigger automatic availability inference.
- Exact entrance, visitor stop, parking location, and fees remain unresolved.

## 카페 어림비 (`tour-4055439`)

- [KTO's March 2026 article](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=d82adba1-1b97-4f70-a74b-d436e37cef47) gives 10:30–18:30. The article text was recovered through indexed search; direct retrieval timed out.
- [The cited tourism listing](https://www.ktriptips.com/kor/food/4055439), modified April 27, 2026, gives 10:00–19:30 with last orders at 18:00.
- Current operator hours could not be verified. Both guide and visit-information layers now show the conflict, link both sources, and direct visitors to the published phone number to confirm current hours and last orders. Neither schedule is selected as definitive.

## 초정솔밭보리밥집카페 (`tour-3572781`)

- [The KTO article](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=58b8a41f-b750-450b-99c4-d644737d051f) says dinner requires advance reservation and explicitly dates its information to November 2025.
- [The cited tourism listing](https://www.ktriptips.com/kor/food/3572781) supplies the existing hours and phone number. No current operator reconfirmation was obtained.
- Added a separate bilingual Dinner booking detail and a dated reference in Hours so the compact first-look summary does not omit the booking caveat. The November 2025 information date remains distinct from the October 6, 2026 source-check date.
- The existing two-person minimum still applies specifically to the barley set meal; no universal two-visitor requirement was added.

## Point Reyes (`us-point-reyes`)

- [The live NPS homepage](https://www.nps.gov/pore/index.htm) identifies the existing photo as the Cypress Tree Tunnel and credits `NPS Photo/A. Kopshever`.
- [Exact source image](https://www.nps.gov/common/uploads/structured_data/8C577CF2-D1B5-93EB-53FDA20654103FEE.jpeg?maxHeight=800&maxWidth=1200&quality=90): 1200 × 800. SHA-256: `c6ec6ebbf370d396329bf125e387e1da8ea5cdf41e4ac3a4f6b362b21fce9a40`.
- Existing local image: 900 × 600. SHA-256: `75b75eb3a2b572417226a087f5d1557b33452c66f82ed1ee075433f3fe63897b`. The images visually match; they are not byte-identical. No asset bytes were changed.
- [NPS's policy](https://www.nps.gov/aboutus/disclaimer.htm) supports public-domain treatment of NPS official-duty works while excluding third-party works and protected marks. This photo's credit and policy provide a strong rights inference, not an asset-specific license certificate. No third-party restriction was displayed for this photo. Do not label it CC0 or apply this finding to other NPS-hosted material.
- Restored only this held photo with exact source, original image URL, credit, rights-policy link, and bilingual transformation/non-endorsement notes. Both place-page and legacy detail-modal renderers honor the Korean note. The original hold metadata and its October 5 date remain in the audit trail with an October 6 resolution.
- Holland Park's hold is unchanged.

## Regression coverage

`verify-source-corrections.cjs` checks the final merged catalog and guide mirrors, unknown parking inference and filter exclusion, available/unavailable/nearby control cases, unchanged reservoir coordinates, visible address uncertainty, both source links, the dated dinner warning in compact and full copy, preservation of the set-meal qualifier, the exact local photo hash, complete photo provenance, the unchanged Holland hold, generated journal metadata, 1,007 unique IDs, and payments remaining disabled.

The test renders the actual server place page in Korean and English with interactive child components stubbed. Catalog merge, page text, photo caption, links, and metadata are real. It also renders parking pictograms. This is not a production-browser, authenticated-session, or physical-device test.

## Local verification results

- All ten scripts in the final `package.json` test command passed, including the new source-correction suite.
- TypeScript passed: `node node_modules/typescript/bin/tsc --noEmit --incremental false`.
- Production build passed: `WRANGLER_SEND_METRICS=false node_modules/.bin/vinext build` (all five stages completed). Wrangler emitted a nonfatal warning about its default local log directory.
- A local server using the resulting production build returned HTTP 200 for all four corrected pages in both languages. The response HTML contained the corrected facts and photo notes/source links. The restored JPEG returned HTTP 200, `image/jpeg`, and 217,395 bytes. The test server was stopped afterward.
- A source-accuracy review found no factual or rights-wording blockers.
- `git diff --check` passed. Record-level comparison against the baseline confirmed only the four intended IDs changed; the generated journal index changed only for Point Reyes.
- The pnpm wrapper attempted a dependency refresh and stopped at its noninteractive modules-purge confirmation. Tests, type-check, and build were run directly with the already-installed pinned toolchain; no dependency files changed.
- No production-browser, authenticated-session, or physical-device check was performed. No push, pull request, merge, or deployment was performed as part of this local implementation.
