# Place quality corrections and Dokk1 registration

## Scope

- 1984 (`tour-4108662`): front-load the existing hours/parking uncertainty so sentence-based summary truncation cannot present 09:00–24:00 as settled current hours. Preserve original publication dates, historical KTO hours, phone and source warnings; add the existing parking source to the combined warning.
- English related names: use bounded editorial romanizations Suyeonsanbang, Suaenyo 339 and Sanmotungi when no verified English name exists. These are reading/search aids, not official English-name claims. Korean canonical names stay unchanged; verified-name evidence still takes precedence. No broader automatic transliteration.
- Install page: server metadata follows `?lang=ko|en`; the live document title follows the language switch. English is the existing fallback language.
- Dokk1: one enriched library record; Denmark/Aarhus navigation and library browse labels. Proposal categories remain unchanged because accepting new user-submitted library entries is outside this catalog registration. No database, authentication, payment, deployment or social changes.

## Dokk1 evidence

Remote source checks: 2026-10-15 22:39–22:40 UTC (2026-10-16 07:39–07:40 KST). Catalog checked dates follow the existing KST convention, 2026-10-16. No in-person visit is claimed. Exact name/address/domain duplicate check found no existing Dokk1 record.

- [Operator visitor information](https://dokk1.dk/planlaeg-dit-besoeg): name, address, level 1 shared quiet room, broader active public/family areas, official-linked map reference.
- [Library opening times](https://dokk1.dk/aabningstider-i-dokk1): weekdays 08:00–21:00, weekends 10:00–16:00, subject to holidays/exceptions. Building closing time is not library closing time.
- [Operator study-space leaflet](https://www.dokk1.dk/sites/default/files/file_upload/studiepladsfolder.pdf): events can require moving from the reading room; leaflet publication date is not asserted.
- [VisitDenmark](https://www.visitdenmark.com/denmark/plan-your-trip/the-culture-house-dokk1-gdk1077504): free general admission, some ticketed events.
- [Operator parking](https://dokk1.dk/parkering): automated parking below the building; prices and current spaces remain unverified.

No private room, exact entrance, guaranteed quietness, live seats, child-targeted rest or operator endorsement is claimed. The map is a venue reference. There is no existing compatible library category: the only catalog library-name match was a library cafeteria classified as food. Minimal library browse support avoids misclassifying this venue as a café or garden.

## Photo rights

[Original file and rights](https://commons.wikimedia.org/wiki/File:Dokk1_version_3.jpg): Dokk1 exterior from Europaplads, photographed 2016-08-16 by [Villy Fink Isaksen](https://commons.wikimedia.org/wiki/User:Villy_Fink_Isaksen), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Locally resized proportionally to 1600px wide and converted to WebP under the same license; display may crop. Visible author/source/license links and adaptation/historical notes are retained. The sidecar records original and derivative SHA-256. The historical exterior is not current interior evidence. No third-party outreach occurred.

## Verification

The dedicated regression suite checks summary truncation, KO/EN related names and search, install metadata, duplicate detection, country/category/search/index/finder integration, source dates, hours boundaries, quiet-room caveats and rendered photo attribution. Existing catalog-count assertions are updated from 1,010/30 to 1,011/31. Globe traversal tests use the actual country count and last country, including repeated two-cycle navigation.

Final local checks: TypeScript check passed; full aggregate suite passed; production build passed. Built-Worker SEO test passed 285 real HTML/API responses across 31 countries and five User-Agent cases, with 960 sitemap URLs. The asynchronous install metadata uses the existing native SeoLinks pattern to retain the canonical in initial HEAD. A final focused run passed install accepted/dismissed/error flows and all Oct16 regressions. Browser-layout QA remains separate from these automated checks.
