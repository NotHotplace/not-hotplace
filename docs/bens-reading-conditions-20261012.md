# Ben’s Library: dated reading conditions

This change enriches the existing café `tour-3443228` (벤의 서재). It does not
register another place, add a category, import photographs, or change the
venue’s identity, address, coordinates or structured prices. The catalog stays
at 1,010 unique places, including 36 in Seoul.

## Evidence and limits

- [Operator: 대화 없는 북카페를 운영하는 이유](https://brunch.co.kr/@dd96de9407e7419/21),
  published May 29, 2025, checked October 12, 2026 (KST). The operator describes
  books available for on-site reading, prohibits conversation and laptop work,
  and restricts noisy keyboards and mice. This supports only the `books`
  condition and the `all`/`cafe` reading-break purposes. It does not establish
  low music, individual seats, a private room or an acoustic measurement.
- [Rachel Jane: 공간, 아니 휴식 이야기](https://brunch.co.kr/@racheljane/86),
  published August 24, 2026, reporting an August 22 visit; checked October 12,
  2026 (KST). This visitor stayed about 2.5 hours and found the music fairly loud
  but personally unobtrusive. The first-card reason retains both parts of that
  impression. The external memo explicitly says a reported stay is not a
  verified time allowance, and that one visitor’s experience neither measures
  noise nor guarantees quietness now. It creates no account-review totals or
  visitor-verified badge.
- The [KoreaTripTips tourism-data mirror](https://www.koreatriptips.com/dining/3443228.html)
  and [Tabling listing](https://www.tabling.co.kr/place/67eb74c703740c14d39930fd)
  disagree on hours and closure days. Neither is an operator confirmation of
  the current schedule. A new uncertainty row appears in the first-look hours
  slot. The older `ktriptips.com` values remain only as historical tourism
  listing information, with the original October 2 check dates. The unchanged
  payment row also keeps its October 2 date; raw identity/location metadata
  keeps its September 13 date. New evidence does not reverify those facts.

Current fees, maximum stay, reservations, exact seat availability and
accessibility remain unverified. No image reuse permission was established;
no source images are included. Seoul Metropolitan Library is outside this
change because no suitable category currently exists.

## Discovery behavior

No ranking or filter implementation changes are made. With the new explicit
reading evidence and existing deterministic ordering, the Seoul general
shortlist is Seoul Forest, Seonyudo Park and Ben’s Library. Seoul café results
are Ben’s Library and 1984; there is no filler third card. Ben is not marked as
visitor-verified and its first reason links both the dated operator policy and
the dated music impression. 1984 remains in café discovery with all its
existing evidence and media untouched.

## Checks

`pnpm test` includes `verify-bens-reading.cjs`, which checks dates, source
attribution, bilingual visit rules, sound and duration limits, unsupported
conditions, unchanged identity/media/location/price fields, historical schedule
provenance, visible rendering, source links and the two-café/no-filler shortlist.
The Seoul integration expectations also reflect Ben’s new legitimate
eligibility without changing the existing park/photo/caveat tests. Existing
home-ranking regression tests still cover 1,505 non-rollout route combinations.
Run `pnpm check` and `pnpm build` with the complete suite before release.

Local validation on October 12, 2026 (KST):

- All 26 package test scripts passed, including the preserved offline
  authentication/payment fixture guards.
- TypeScript check and production build passed.
- Built-Worker HTTP checks passed: 252 counted HTML/API responses, including
  Ben’s Korean and English detail pages for browser, Googlebot, Bingbot,
  Facebook and empty user agents, and both Seoul general/café finder responses.
  Canonicals, dates, visible source links, memo limits and no filler are covered.
- A baseline comparison against `cd932ea8` confirmed all other records in the
  three changed overlays are identical. Raw catalog, IDs/client indexes,
  locations, images, ranking/filter code, lockfile and deployment configuration
  are byte-identical.

The local environment used `npm test`, `npm run check`, `npm run build` and
`npm run test:seo` to execute the unchanged package-script commands against
existing installed dependencies. The pnpm wrapper attempted an unavailable
home-directory install. Local build/HTTP checks used writable temporary log
paths; no dependency or production-configuration change was needed. HTTP QA
used the installed local workerd compatibility date; production’s configured
date was unchanged. No interactive visual-browser check or remote release was
performed.

## Initial-card regression repair

The existing HomeFinder teaser shortener reduced the original long Ben reason
to its first sentence. The earlier component/API checks did not cover that
initial paragraph, and the HomeFinder harness replaced the shortener with an
identity stub. The first-card visibility claim therefore required correction.

Only Ben’s recommendation copy was shortened, to 90 Korean / 149 English
characters, retaining the operator policy, a dated single-visitor impression,
both sides of the music observation and a quietness limitation. Full operator
and visitor dates/details remain in the visit rows and source disclosure.
Neither the production component nor the ranking or teaser limits changed.

The HomeFinder harness now uses the real `conciseText` helper. Its new test
failed against the original copy, then passed after the copy change. It checks
the actual first paragraph of Ben’s card in Korean and English through café →
general → café selection, with no filler or duplicate source paragraph. It
does not mistake text inside a disclosure or serialized data for the teaser.
