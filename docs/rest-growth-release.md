# Rest feedback, place coverage and regional discovery

Source check: 2026-10-01. All new descriptions summarize public operator, city or tourism information; they are not firsthand reviews or guarantees of quietness.

## Product changes

- A separate anonymous one-question noise response works without sign-in. Optional day/time stay unknown unless selected. Same-browser answers update instead of accumulating. Public summaries cover 90 days, identify small samples and never feed authenticated review scores, recommendation holds or time suggestions.
- Same-origin JSON boundaries, size/schema checks, a Secure/HttpOnly/SameSite browser cookie, private server-generated HMAC salt and atomic daily caps limit repeated submissions. Raw IP is not stored; daily IP hashes help throttle cookie resets. Old responses and limit rows are cleaned on subsequent submissions. Deletion only affects the browser’s own responses. No new credentials or paid service are required.
- Device-local rest journal stores planned/visited place IDs and latest chosen response. A maps click adds a planned candidate, never a completed visit. The journal supports filters, a map for places with known coordinates, individual local deletion and browser-response deletion together. Account records remain separate. Privacy notices explain both stores and retention.
- Aggregate start, login-link, quick-response and journal actions extend owner analytics. Counts do not link identities or claim unique visitors/conversion rates; DNT/GPC behavior stays in place.
- Korea: 50 venue guides, each with three Type1 licensed tourism photos (150 images), bilingual visit conditions, source links and check date. Twenty existing places were enriched; existing catalog IDs remain stable. Ambiguous source hours are explicitly identified.
- U.S.: 43 total places, including 18 Portland and 16 New York City candidates. Japan: 30 places across Tokyo (12), Kyoto (10) and Osaka (8). Eight Japanese places and two new U.S. places include Wikimedia photographs with per-image credits, original/source/license links and conversion notes. Other photo gaps are visible.
- A shared country configuration drives country choice, explore/API scoping, suggestions, detail links, maps and analytics. Japanese maps use three populated city choices. Parks and gardens have a distinct walking category and appear in the scenery finder.
- 23 regional guides with both Korean and English URLs, source-based visitor checks, catalog detail links, reciprocal hreflang/canonicals and sitemap entries. Personal journal is not indexed. No search-ranking result is claimed.

## Verification

`pnpm run check`, `pnpm test` and production build passed. Tests cover origin/schema limits, optional unknowns, cookie ownership, anonymous/account separation, retention, rate limits, invalid device data, new-country filtering, real regional content, source image files and sitemap expansion.

Headless browser checks run against the local app on 390px and 1440px viewports. Local API fixtures simulate guest feedback, journal addition/deletion and Japan discovery; they do not test live Google sign-in. Korean fonts were supplied to the Linux test environment. Screenshots were inspected and horizontal overflow/uncaught browser errors checked.

Migration `0006_quick_feedback.sql` adds anonymous storage and replaces aggregate CHECK constraints while copying existing totals. The existing deploy script runs remote migrations before Workers deployment. Payments and paid advertising remain disabled/unchanged. Existing scheduled Instagram dates and total post count are preserved when selected media and captions are updated.

## Source provenance

Korean photos were accepted only when their tourism metadata explicitly reported `cpyrhtDivCd=Type1`. Original links, credited Korea Tourism Organization, source listing, KOGL Type1 URL and conversion notes are stored in `lib/kr-place-guides.json`.

Japanese text sources: Tokyo Convention & Visitors Bureau (`gotokyo.org`), Kyoto City Tourism Association (`kyoto.travel`), Osaka Convention & Tourism Bureau (`osaka-info.jp`). U.S. sources: City of Portland (`portland.gov`), NYC Parks, Riverside Park Conservancy and Friends of Morningside Park. New York source access varies; hours and closures are left for current confirmation rather than fabricated.

New Wikimedia image credits and license links are retained in `lib/jp-catalog.json` and `lib/us-catalog.json`. No generated image depicts a venue, and no illustrative photo is presented as a current crowd measurement.
