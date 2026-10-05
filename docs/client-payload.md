# Client catalog payload

The full 1,007-place source catalog is now server-side. Client code uses compact IDs, country summaries and narrow API responses instead of importing every place's descriptions, sources, photos and visit details.

## Measurement

Production build snapshot on 2026-10-05, after the integrated presentation and payload/privacy changes. Byte counts are exact file sizes; gzip uses level 9 independently for each file. Component graphs include the named entry and its static imports, not all route requests. They exclude runtime-fetched data, photos, maps and lazy imports. These are build measurements, not measured mobile load times.

| Scope | Before raw bytes | After raw bytes | Before gzip bytes | After gzip bytes |
| --- | ---: | ---: | ---: | ---: |
| All emitted client JavaScript, including vendor assets and lazy chunks | 3,176,654 | 1,372,463 | 580,025 | 437,755 |
| Generated application chunks | 2,896,100 | 1,091,909 | 486,303 | 344,033 |
| Homepage component + static imports | 2,275,896 | 305,364 | 283,875 | 102,747 |
| Explorer component + static imports | 2,612,215 | 644,070 | 398,060 | 218,202 |
| Place-interactions component + static imports | 2,289,583 | 319,650 | 286,897 | 106,238 |

The former global catalog chunk was 1,989,257 raw bytes / 185,840 gzip bytes. It is no longer emitted. The lazy journal display-only chunk is 158,667 raw / 36,241 gzip bytes and is not a static dependency of the homepage or explorer.

Reproduce from the repository root:

```sh
pnpm run build
pnpm run measure:client > client-payload.json
```

If the package-manager launcher is unavailable but dependencies are already installed, the equivalent build and measurement commands are:

```sh
node node_modules/vinext/dist/cli.js build
node scripts/measure-client-payload.cjs
```

## Data and privacy boundaries

- `/api/catalog` serves only curated public source records. It requires a country and supports country, three-candidate finder, four-card theme, and collection-display views. It does not read cookies, accounts, local journal records, saved places, or private submissions.
- `/api/data` keeps its private/no-store response boundary. Its finder and collection views return only their selected result shape, while the normal explorer response retains the existing account/membership behavior.
- Homepage recommendations use server-side filtering/ranking and fetch at most three finder or four theme places. No full Korean catalog is embedded on the homepage.
- Explorer fetches the current country's live data, with a source-only fallback if live data fails. Loading and fetch-failure states are distinct from genuine empty results. Stale or aborted country responses cannot replace newer data.
- Journal lookups stay local. Every journal receives the same public display-only metadata chunk; record IDs, dates, visit states and noise responses are never sent as lookup parameters. Failed metadata loading still leaves local record links and individual deletion controls available.
- Device-bookmark storage, limits, visited-history preservation, sharing URLs and community-suggestion routing are unchanged.
- Full source descriptions, `visitDetails`, `conditions`, `recommendationReasons` and other evidence remain on the server's country/place payloads and detail pages. Only journal and collection-specific display projections intentionally omit unrelated metadata.

## Keeping generated indexes current

After changing catalog IDs, country/city coverage, place names or journal display fields:

```sh
node scripts/catalog-client-index.cjs
```

`pnpm test` checks that the generated indexes match the complete catalog, prevents client imports from reaching `lib/catalog.ts`, verifies all country scopes and source IDs, rejects invalid public views/filters, checks private response caching, and preserves journal/device-bookmark privacy. It also runs the existing product, authorization and payment-boundary tests.

Type checking, all six test scripts and the production build passed for this snapshot. Browser interaction and real mobile network timing were not verified in this environment.
