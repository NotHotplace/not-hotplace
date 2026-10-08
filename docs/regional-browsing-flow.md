# Regional browsing and detail return

## Scope

- Regional lists now order dated, source-backed recommendation reasons first, then distinct visit details and conditions. Images and crowd/quietness claims do not affect this order. Basic imported setting/location rows and generic “check before visiting” reminders do not earn visit-information credit. Name and ID provide a deterministic tie-break.
- Region pages slice on the server at 18 places. New York's 375 entries span 21 pages (15 on the last page). No all-place client prop, hidden card collection, or all-place JSON-LD is sent. JSON-LD describes this page's entries with their global positions.
- Pagination uses ordinary accessible links, current-page labels, previous/next links, and stable KO/EN query URLs. Invalid/duplicate/non-integer/out-of-range pages return 404. An empty valid first page has a truthful empty state.
- Each page has its own native-head canonical and matching language alternates. Page 1 is the sitemap entry. Later list pages are `noindex, follow`; their places remain discoverable through navigation, and independently eligible detail pages remain in the sitemap. Basic detail pages retain their existing noindex policy.
- Detail links carry a reconstructed internal return target. Allowed destinations are home, a known country map, or a known regional guide. Arbitrary routes, external/protocol-relative URLs, encoded paths, credentials, and unknown query keys are rejected or stripped. Canonicals/share links stay clean.
- Home return retains country, optional region, purpose and theme. Region return retains language/page and anchors to the selected card. Map return retains public filters/query/view and device/account save scope; only a matching session snapshot restores loaded-list length and inner scroll. Explicit new return URLs cannot apply unrelated newer saved filters.
- Detail language switches localize the return context. Direct detail visits safely offer the relevant country's map. Native Back/Forward is not intercepted; no extra history entries are added for filter changes. Restored map scroll is consumed so the next filter change resets normally.

## Verification

Run `npm run check`, `npm test`, `npm run build`, and `npm run test:seo` (the equivalent pnpm scripts are used by CI). The local test runner uses the installed workerd-compatible date without changing production configuration or touching remote data.

New coverage includes:

- Stable evidence ordering, photo-independent ranking, duplicate/unsourced/generic-fact exclusion
- All regional entries covered exactly once by disjoint 18-card slices
- New York first/second/last page HTML, JSON-LD and independent RSC response boundaries
- Invalid page values, KO/EN canonicals/alternates, and noindex/sitemap rules
- Actual KO/EN home/detail/map component return links, sanitized targets, direct entry and language switches
- Integrated LanguageProvider → GlobeHome → HomeFinder/HomeThemes child-before-parent initialization, saved Korean without an explicit language, legacy root redirects, and combined home choice preservation
- Map stale-state rejection, explicit default contexts, matching-session scroll, native popstate, and filter changes after return

The built-worker SEO suite covers 202 successful HTML responses (188 existing + 6 pagination + 8 contextual-detail cases), additional invalid-page responses, separate RSC requests, and existing photo/source/sitemap checks. These are local requests, not a production crawl.

## Measured response size

Same local built-worker New York Korean route, UTF-8 HTML bytes (includes inline RSC):

| Version | Cards | Raw bytes | gzip bytes |
|---|---:|---:|---:|
| Main a28991e | 375 | 797,785 | 47,515 |
| Pagination + contextual return | 18 | 71,840 | 10,686 |

This is a roughly 91% reduction in raw response size and 78% reduction after gzip for this route. It is not a visitor-speed measurement or evidence for the cause of the earlier production incident. The in-memory server catalog itself is unchanged.

No place records, payments, account/resource settings, production deployment configuration or production traffic are changed by this work. Review and preview approval are required before merging/deploying.

## Install entry restoration

The home introduction and footer now link to `/install` in the selected language. Mobile country maps have a separate visible install entry beneath the compact header, while retaining the existing menu entry. When the browser does not provide an install prompt, `/install` has an actionable “How to install” link to its Android/iPhone instructions. Existing browser-prompt and installed/standalone behavior stays intact. No native app-store or APK download is implied; manifest, icons, service worker and cache strategy are unchanged. The install regression covers unavailable, accepted, dismissed, failed, appinstalled and iPhone/standalone states with simulated events, without installing anything on an operating system.
