# Verified existing-place enrichment · 2026-10-07

## Scope

Six existing records were enriched from operator and official tourism sources: Sayuwon, Osulloc Tea Stone, Royal Botanic Garden Sydney, Wellington Botanic Garden, Ryoan-ji and Kew Gardens. The updated records supply 40 substantive bilingual visit-detail rows, retains three original coordinate-reference notes and supplies nine sourced recommendation reasons. This is published-source research, not a site visit or real-time availability check.

All 1,007 place IDs and existing map coordinates are preserved. Source records are updated directly; recommendation reasons use the existing overlay. The compact journal metadata is regenerated. Unknown exclusive-room use, individual seats, crowd levels and parking availability are not filled in from generic marketing or seating counts. No authentication, payment or security settings change.

## Photographs

Four exact-venue WebP photographs were reviewed at original and optimized resolution. Their source pages establish the matching venue and reuse license. Per-image public `.license.json` sidecars preserve author, title, original/derivative hashes, capture date, source, license, rights notices and resize/compression changes. The WebPs retain embedded rights metadata; the detail page displays localized attribution, license/source links and change notices.

- Sydney: Dietmar Rabich, October 2019, CC BY-SA 4.0. The derivative retains the same license, copyright and applicable notice.
- Wellington: Daderot, October 2024, CC0 1.0.
- Kew Temperate House: SkyRose18, June 2019, CC0 1.0.
- Ryoan-ji: Bgabel (Wikivoyage Shared), “JP-kyoto-ryoanji.jpg”, August 2008, CC BY-SA 3.0. The explicitly offered BY-SA license is used and retained for the derivative.

Capture dates are visible; none of these photographs is represented as evidence of current conditions. Sayuwon and Osulloc photos remain absent because no reusable exact-venue photo was verified. Holland Park’s separate photo hold is unchanged. No generated or merely similar-place substitutes were added.

## Source decisions

## 1. kr-sayuwon — 사유원, Gunwi, Daegu

Existing source record: lib/rest-catalog.json. No existing image or gallery photos; only three generic visit paragraphs.

Primary sources:
- https://www.sayuwon.com/about/01 — hillside garden and terrain identity.
- https://www.sayuwon.com/tour/01 — Magnolia Route, approximate one-hour duration, Soyoheon/Sodae stops.
- https://www.sayuwon.com/guide/02 — exact café/library seating totals; no basis for one-person-seat/private-room classification.
- https://sayuwon.com/product/01?seq=22 — opening days/holiday exceptions, main entrance parking, age restrictions.
- https://www.sayuwon.com/reservation/08 — prior-day garden bookings, two-day meal-package deadline, conditional same-day entry.
- https://www.sayuwon.com/guide/03 — official address remains 1176 Chisanhyoryeong-ro.

Secondary official tourism source:
- https://japanese.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=217513 — 09:00–18:00, last entry 15:00, adult KRW 50,000 weekdays/KRW 69,000 weekends/public holidays, car parks 1 and 2.

Handling uncertainty:
- Operator product body does not expose numeric date-specific prices in the accessible text. Therefore price is explicitly attributed to KTO and carries a final-booking-check caveat; `visitFacts.price.amount` is deliberately omitted.
- Japanese KTO text uses address number 1150 while its Korean address line and the operator use 1176. Keep 1176, already in the catalog; do not propagate 1150.
- No wheelchair-access promise, private-room flag, quietness guarantee, live capacity or parking fee is inferred.
- Existing category `drive` is preserved in the update despite the actual visit requiring a walk. A later editorial category review can consider `walk`; it is not necessary for this enrichment.

## 2. kr-osulloc-tea-stone — 오설록 티스톤, Jeju

Existing source record: lib/rest-catalog.json. Already had the 80-minute/KRW 60,000 basic course, but no structured price, site separation, or detailed current curriculum.

Primary sources:
- https://www.osulloc.com/kr/ko/store-introduction/2 — 80-minute premium course at KRW 60,000 per person; four timed sections; bad-weather substitution of garden walk.
- https://www.osulloc.com/kr/ko/store-introduction/jeju-map — Tea Stone upper-floor tea space versus downstairs cellar, museum address/contact, general museum opening/free entry.

Handling uncertainty/conflict:
- Older Visit Jeju page https://www.visitjeju.net/kr/themtour/view?contentsid=CNTS_200000000012034 describes 50/55/60-minute legacy programs and KRW 30,000/35,000. It is not used for current sessions or price.
- KTO legacy travel article https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=db724115-e34b-4d3d-8973-79eeb5303038 describes 45-minute, 20-person, KRW 15,000 programming and multiple conflicting old information blocks. These session/capacity/age claims are not imported.
- General museum hours are explicitly labelled museum hours. Do not convert them into tea-course session times.
- The operator's marketing adjective about privacy is not evidence of exclusive room use. No `privateRoom`, solo seat, or group-size flag is set.
- Parking and mobility facts are left unset because currently corroborated course-specific details were not established. Do not fill them from a legacy article to make the data appear complete.
- Keep Tea Stone and Tea Stone Cellar photos distinct; wider museum/tea-field imagery is only context, not a verified course-room photo.

## 3. world-au-royal-botanic-garden-sydney — Sydney

Existing source record: lib/expanded-catalog.json. Already enriched at a basic operator level, but no photo and no actual hours/parking/access detail.

Primary sources:
- https://www.botanicgardens.org.au/royal-botanic-garden-sydney/plan-your-visit — free general admission, seasonal hours, severe-weather closures.
- https://www.botanicgardens.org.au/royal-botanic-garden-sydney/plan-your-visit/getting-here — metered parking streets, AUD 9/hour daytime and AUD 5/hour overnight, cashless payments.
- https://www.botanicgardens.org.au/royal-botanic-garden-sydney/plan-your-visit/accessibility — most areas wheelchair/walker accessible and pre-bookable free wheelchair loan.
- https://www.botanicgardens.org.au/five-best-picnic-spots-royal-botanic-garden-sydney-has-offer — explicit Fernery/Succulent Garden benches and Main Pond picnic lawns.

Handling uncertainty:
- Seating is described as actual shared benches/lawns, not an individual-seat filter or privacy guarantee.
- Nearby street parking is `nearby`, not an on-site guaranteed space.
- Keep existing reference coordinates and their original 2026-10-02 provenance; no gate-coordinate verification was done.

## 4. world-nz-wellington-botanic-garden — Wellington

Existing source record: lib/expanded-catalog.json. Previously Wikipedia identity/coordinate-only.

Primary sources:
- https://wellingtongardens.nz/our-gardens/wellington-botanic-garden-ki-paekaka — dawn-to-dusk grounds; paid two-hour car park with Centennial Entrance access; hilly terrain and specific wheelchair-friendly areas; visitor-centre seasonal hours; current Begonia House closure.
- https://wellingtongardens.nz/assets/botanic-garden-map-brochure-WEB.pdf — free admission, public entrance/car-park orientation and walking map.

Official tourism cross-check:
- https://www.wellingtonnz.com/visit/see-and-do/best-things-to-do-for-free-in-the-city — free garden, native forest, collections and views.

Handling uncertainty:
- General garden access is not 24 hours: operator says dawn to dusk. Night guided glow-worm tours do not change general hours.
- Begonia House is closed; do not promote its greenhouse as available. Operator says Picnic Café remains open.
- Wheelchair-friendly listed zones do not mean all interconnecting paths are accessible.
- Address is the verified street entrance description, with no invented street number or postcode. Existing coordinates remain reference coordinates.

## 5. jp-kyoto-ryoanji-temple — Ryoan-ji, Kyoto

Existing source record: lib/jp-catalog.json. Previously three generic tourism paragraphs and no image.

Sources:
- https://www.ryoanji.jp/smph/rode/index.html — operator search-index text exposes seasonal hours, JPY 600/500/300 admission and one-hour free visitor parking. Direct full fetch failed; operational fields use readable official tourism pages instead.
- https://www.kyoto-kankou.or.jp/info_search/3455 — Kyoto prefectural tourism federation: same admission/hours, parking conditions, staff-assisted wheelchair viewing, accessible toilet and closer parking for visitors with mobility limitations.
- https://ja.kyoto.travel/tourism/single01.php?category_id=7&tourism_id=482 — Kyoto city: hours, open year-round, bus-stop and train walk times.
- https://kyoto.travel/en/destinations/ryoanji-temple/ — seated rock-garden viewing, grounds and Kyoyo-chi Pond walking, address.

Handling uncertainty:
- Bus access is described using the current city stop/location guidance. Avoid importing old route numbers from the operator's search-index copy.
- Wheelchair access requires staff guidance; do not imply an entirely step-free free-roaming site.
- The city/prefecture use slightly different walking estimates; update chooses city wording of about one minute from bus stop/eight minutes from Randen station.
- No low-crowd or silence guarantee is implied by Zen-garden design.

## 6. world-gb-royal-botanic-gardens-kew — Kew, London

Existing source record: lib/expanded-catalog.json. Previously Wikipedia identity/coordinate-only.

Primary sources:
- https://www.kew.org/kew-gardens — garden identity and collection.
- https://www.kew.org/kew-gardens/visit-kew-gardens/tickets — specific autumn 2026 adult ticket bands and Tuesday promotion; optional donation separated.
- https://www.kew.org/kew-gardens/visit-kew-gardens/opening-and-closing-times — dated October/November 2026 schedule.
- https://www.kew.org/kew-gardens/visit-kew-gardens/getting-here — exact gate postcodes, station distances and GBP 10/day limited parking.
- https://www.kew.org/kew-gardens/visit-kew-gardens/accessibility — generally flat paths; express warnings about aircraft/vehicle/machinery noise.
- https://www.kew.org/sites/default/files/2026-05/RBG-Kew-Community-Open-Week-2026-Visual-Guide-Final-Version.pdf — benches and picnic-blanket spaces (page 20). Only these enduring facilities are used; June event hours/attendance claims are not imported.
- https://www.kew.org/kew-gardens/visit-kew-gardens/planned-closures — Waterlily House until spring 2027, Natural Area boardwalk and Ice House closures.

Handling uncertainty/conflict:
- Generic homepage displays older broad opening hours; use the dedicated date-bounded opening-times page.
- Exact prices are not put into a timeless `amount` field: the price text carries the valid season and sale channel.
- No quiet-place promise. Its operator specifically warns of noise.
- Gate counts/accessible parking-space counts differ across dated sources; omit counts, preserve the actual supported parking access/fee facts.
- Existing map coordinates stay reference points, not verified Victoria Gate coordinates.

## Verification

- Base: main `0ea81d77553dbbb8fe21d201dd96ae2451f87bb8`, tree `234c962177a8c0ba183c3859638b00ae7e2815a6`.
- All six source-record hashes matched the research snapshots before applying. JSON comparison verified that unrelated source records are unchanged and that IDs, category, country, coordinates and coordinate provenance remain intact.
- Four optimized image SHA-256 hashes match the verified photo inputs; licensed originals were not silently replaced or generatively altered.
- `scripts/verify-place-enrichment.cjs` checks the final merged catalog, all 43 detail rows, nine reasons, seasonal prices, museum/course separation, closure/mobility caveats, absent unsupported conditions, exact image hashes/rights sidecars, journal index and real Korean/English server-page, pricing and condition markup.
- The full typecheck, test suite and production build are required before release. CI and preview results belong in the pull request, with the exact tested head.
- No production release is included in this change; it remains a draft pull request until approved.
