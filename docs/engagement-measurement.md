# Anonymous rest-discovery measurement

This change reuses existing counters, categories and consent/privacy-signal behavior. It introduces no event, database migration, place-level analytics, identifier, SDK or campaign URL change.

## What the owner can inspect

- Page opens today, in the last 7 days, and in the last 30 days (Korean calendar days). Refreshes and repeats count; these are not unique visits.
- Existing 30-day actions by country/source and predefined campaign context.
- A compact Instagram/KR summary for `seoul_solo`, `private_room`, and `photo_guides`: guide views, detail views, completed saves, external-map link clicks, and journal opens.
- Current account review and saved-place row counts are inventory, not 30-day activity. Device bookmarks are excluded from this inventory.

Exact event allowlist remains `place_view`, `map_open`, `save`, `review`, `share`, `guide_view`, `recommendation_open`, `review_start`, `review_login`, `quick_review`, `journal_open`.

## Interpretation limits

`place_view` includes detail pages and explorer detail dialogs. `save` includes successful device and account saves, not removals. `map_open` counts the link click, not route calculation, arrival or a physical visit. `review` and `quick_review` count successful saves/updates: optional quick-response day/time updates also increment `quick_review`. `journal_open` is not proof of a returning person. These streams cannot be joined into a per-person funnel or a conversion rate.

Campaign context comes from allowlisted `utm_content`, source from `utm_source` or broad referrer category, retained within the tab's session storage. `utm_campaign` is not a stored reporting dimension. A KR action does not establish a Seoul visit. The same context can cover later actions in that tab, including other places. No place ID, raw search, IP, URL, referrer or personal identifier is sent to the engagement endpoint. Unique people, repeat users, repeat rate and exact-place conversion remain unmeasured. A zero is no received counter, not proof of no visitors.

Keep all eight approved scheduled campaign links unchanged. For additional approved content, reuse the existing relevant `utm_content` categories; these broad categories cannot isolate different creative variants sharing a code. Do not claim A/B causality from this report.

## Verification

Run `node scripts/verify-engagement-summary.cjs`, `pnpm run check`, and the aggregate test suite. Tests use in-memory transport only and never send production events. Production counts require authorized owner access to `/stats`; this implementation does not invent or backfill counts.
