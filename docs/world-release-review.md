# World catalog release review — 2026-10-02

## Changes

- 1,006 unique places across 30 countries, including 605 additions: 105 international reference records and 500 active NYC Parks records. Four new places have enriched visitor information; 601 new records remain basic.
- 307 domestic place records refreshed from public KTripTips tourism listings. These are published tourism references rather than a live confirmation by each venue. Older facts retain their own source/date when no new fact supersedes them.
- 21 new licensed world photographs after visual review removed one photo of a district building unrelated to the named park. Each displayed image keeps its creator, original source and license link. Existing photo galleries are preserved.
- Price, parking and seating pictograms, with distinct available/unavailable/nearby/unknown parking states. Published individual seats and four-seat tables produce one chair and four chairs. Unspecified shared seating uses a generic group symbol with a shared-seating label.
- Thirty searchable country choices, continent filters, country maps and seven new world guides. Singapore has a city navigation fallback when the low-resolution world outline has no polygon.
- Anonymous device-local saves, existing one-tap noise feedback and a new private information/photo contribution queue. Photo links require publication-rights consent. Notes are verified by the operator before catalog changes.
- Expanded engagement/contributor country validation, country-scoped statistics names, reciprocal bilingual links, country sitemap entries and noindex for basic place pages.

## Evidence and limits

The source manifest records each addition and its provenance. NYC Parks records come from the active public properties dataset (`enfh-gkve`); polygon-derived coordinates are reference points, not entrance coordinates. Wikipedia reference records supply place identity and setting, not current opening, parking or quietness evidence. Primary visitor enrichment covers Singapore Botanic Gardens, Royal Botanic Garden Edinburgh, Hyde Park and Royal Botanic Garden Sydney.

Three new external review memos summarize limited public Wanderlog review-summary screens that identify Google/Tripadvisor as underlying sources. They do not represent complete original review feeds. Original ratings, review counts and long review quotations are not imported. Twenty-two external memos exist in total. No imported information creates local visitor votes or a quietness score.

There is no new user traffic, indexing or ranking evidence in this release. Most additions still need primary hours, fee, access and seating checks. Booking, total visit costs and exact entrance locations remain venue-specific. Advertising and payments remain outside scope.

## Verification procedure

Run `pnpm run check`, `pnpm test`, `node scripts/audit-catalog.cjs`, then `pnpm run build`. Product tests cover all 30 country scopes, source/reference integrity, explicit parking states, seat sizes, admission semantics, private contribution boundaries, photo consent, browser/IP daily limits, deletion, moderation, 90-day retention and preservation of legacy data through the new migrations. Existing identity, review, payment and community checks remain in the suite.

Use a local HTTPS preview for mobile and desktop inspection. Check country search, Singapore fallback, destination photographs, pictograms, repeated anonymous saves and short contribution submission/deletion. Do not submit synthetic feedback to production. Google OAuth requires the deployment's actual provider configuration and is not established by mocked authorization tests.

2026-10-02: local type checks, the full product suite, catalog audit and production build passed. Browser checks passed at 390px and 1440px; country/city search, continent filtering, Singapore fallback, sourced individual-seat icons, repeated anonymous saves and local contribution submission/deletion were checked. No client runtime errors or horizontal overflow were detected in the inspected screens.

## Deployment and rollback

The existing Cloudflare Workers build connection deploys GitHub main using the repository's build/deploy scripts. `pnpm run deploy` applies the pending D1 migrations before deployment. Migration 0008 copies four country-constrained tables while retaining rows; 0009 adds the private contribution queue. Existing reviews and saved places are not replaced.

Do not call a main-branch commit a successful release. Verify the public country API counts, new routes, images and contribution form after the hosting build completes. Keep a tested feature-branch checkpoint before moving main. If the build fails, read its actual error and fix it; avoid another duplicate social announcement. The preceding application can still operate with the expanded-country tables and additive contribution table, so an application rollback does not require destructive schema reversal.
