# Three sourced garden details · 2026-10-08

## Scope

Exactly three existing records are enriched: Jardin du Luxembourg, Hortus Botanicus Amsterdam and Jurong Lake Gardens. They receive 28 substantive bilingual visit-detail rows, six sourced recommendation reasons and three exact-venue licensed photos. Their three original coordinate-reference rows are retained. All 1,007 IDs, country/category/identity fields, record order, map coordinates and coordinate-source dates are unchanged. Other source records are untouched; the compact journal projection is regenerated.

Jurong receives one source-backed parking condition. Luxembourg and Hortus garages remain nearby/off-site and do not activate an on-site parking filter. No private-room, individual-seat, quietness, occupancy, live availability or full-site accessibility inference is introduced. No authentication, payments or registration settings change.

## Source decisions

### Jardin du Luxembourg

[Sénat practical guidance](https://jardin.senat.fr/en/practical-information.html) confirms free garden admission and distinguishes separately paid activities. The [seasonal table](https://jardin.senat.fr/en/practical-information/opening-hours.html) gives October 1–15 hours of 07:45–18:45; a conflicting indexed homepage banner is not used. [Seating history](https://jardin.senat.fr/histoire-patrimoine/patrimoine/les-sieges.html) and [garden figures](https://jardin.senat.fr/infos-pratiques/le-jardin-en-chiffres.html) support movable chairs and fixed benches, not available seats at any particular time.

The [Paris tourist office](https://parisjetaime.com/eng/culture/jardin-du-luxembourg-p1063) supports the boundary-street address and named accessible approaches; continuous step-free routes, slopes and surfaces remain unverified. [INDIGO Soufflot-Panthéon](https://www.indigoneo.fr/fr/parkings/351/parking-soufflot-pantheon) is nearby paid parking at 22 Rue Soufflot. Current operator information says toilets are free, superseding an older brochure's fee statement. These source checks retain the original October 7 date.

### Hortus Botanicus Amsterdam

The [operator visit page](https://www.dehortus.nl/en/plan-your-visit/) supports daily 10:00–17:00 hours, holiday closures, EUR 14.75 adult admission, card-only payment and Museumkaart exclusion. The [Dutch page](https://www.dehortus.nl/Bezoek/) confirms EUR 8.50 student admission. The current page does not establish an October 1 concession-change date, so the additional-source label is neutral. Conflicting child free-admission cutoff wording is omitted.

[Accessibility information](https://www.dehortus.nl/en/accessibility/) and the [detailed visitor guide](https://www.dehortus.nl/wp-content/uploads/2025/11/Voorbereiding-bezoek-Hortus-Amsterdam_algemeen.pdf) establish gravel paths, specific greenhouse and exit limitations, seating and sensory conditions. The café's no-music policy does not guarantee silence. [Café guidance](https://www.dehortus.nl/en/cafe-and-shop/) supports vegetarian food, garden-visitor access, an offline break and group reservations from six people; that threshold is not treated as seating capacity. The nearby Stopera and Markenhoven garages are not on-site parking. Previously recorded checks remain dated October 7 except the hours and admission rows, which were rechecked on October 8. Four additional bilingual rows checked October 8 cover conditional quieter visiting times, eligible companion admission, the accessible toilet route and the lack of luggage storage. Existing mobility limitations and all structured facts, reasons, images and coordinates are retained.

### Jurong Lake Gardens

[NParks operating guidance](https://juronglakegardens.nparks.gov.sg/plan-your-visit/operating-hours-and-services/) distinguishes 24-hour Lakeside Garden grounds from Chinese/Japanese Gardens' 05:30–24:00 access and separately lists attraction schedules. [Getting here](https://juronglakegardens.nparks.gov.sg/plan-your-visit/getting-here/) establishes transport, entrances and carparks. Its current rate guidance takes precedence over inconsistent older brochure charge bands; free general admission does not extend to sports, dining, events or every parking period.

[ABC Waters](https://juronglakegardens.nparks.gov.sg/discover/lakeside-garden/abc-waters/) specifically offers a lakeside amphitheatre rest stop. The [Therapeutic Garden](https://juronglakegardens.nparks.gov.sg/discover/lakeside-garden/therapeutic-garden/) supports its shelter and accessible sections, not every approach across the park. [Heron Island](https://juronglakegardens.nparks.gov.sg/discover/lakeside-garden/heron-island/) bench observations are explicitly attributed to published photographs; these operator images are evidence only and are not redistributed.

Grounds hours and [current NParks notices](https://juronglakegardens.nparks.gov.sg/) were rechecked on October 8, 2026, Korea time. Clusia Cove, Waterwall Court and the Sunken Garden toilet remain closed for maintenance until further notice. Only the toilet is covered by that last notice, not the entire Sunken Garden. Dog Run maintenance is explicitly dated October 14, 2026; no hours or ongoing restriction are invented. Unlit Grasslands and Neram Streams must not be entered after dark. Expired September/early-October shuttle suspensions are not imported. These two rows and Jurong's latest record-check date use October 8; all other previous-source checks stay October 7.

## Photographs and rights

Three original JPEGs and all three regenerated 1200 × 900 WebPs match the exact original/derivative SHA-256 values verified on October 7. No image has been substituted. The WebPs total 863,612 bytes, versus 16,506,083 bytes for the originals. Each is proportionally resized with LANCZOS and encoded as WebP quality 80/method 6. The file itself is not cropped, recolored, retouched or generatively altered.

- Luxembourg: Eutouring, “Chairs at Jardin du Luxembourg.jpg”, June 5, 2015, CC BY-SA 4.0. “Produced by EUtouring.com” is retained. The derivative remains CC BY-SA 4.0.
- Hortus: Faust002, “Green house of Hortus Botanicus in Amsterdam.jpg”, April 30, 2024, CC0 1.0. It is not labeled as the renovated Climate House.
- Jurong: LN9267, “Jurong Lake Gardens 10-11-2023(38).jpg”, November 10, 2023, CC BY-SA 4.0. The derivative retains that license; camera timezone is unspecified. The photographed concrete bench is not represented as the ABC Waters amphitheatre.

Public `.license.json` sidecars and embedded EXIF/XMP preserve title, creator, capture date, source, license, rights notices and transformations. Source ICC profiles are retained where supplied. KO/EN captions link source and license, show photo dates and disclose display cropping and the lack of current-condition verification.

Full images and 480 × 170, 400 × 225 and 358 × 269 cover-crop geometry were inspected. Asset-specific bottom alignment keeps Hortus's lower planted paths and Jurong's foreground bench visible in wide cards. Luxembourg keeps centered framing.

## Validation and release

Base commit: `4982eb97dd6835d02beb2761d224a889b54810ab`. Canonical input hashes match all three baseline records. Semantic comparison verifies exactly three source-record differences, only the intended overlay changes and only three journal-record differences. All IDs, coordinates and unknown-condition handling remain intact.

The catalog date audit now compares source-check dates in Asia/Seoul, matching the project’s calendar-day convention, rather than falsely treating an early-morning Korean check as a future UTC date. Regression assertions cover both sides of Korean midnight and continue rejecting genuinely future dates.

The expanded enrichment test covers all nine records across the two October batches: 68 substantive bilingual rows, six preserved coordinate notes, 15 sourced reasons and seven licensed photos. It checks actual KO/EN server-page markup, prices, conditions, sources, rights notes, embedded metadata, exact hashes and journal consistency. The complete typecheck, all 15 test-suite scripts, production build and built-worker HTTP checks passed against this patch before integration. HTTP checks cover all six KO/EN detail routes, every new row and rights caption, the three image files/sidecars and the compiled crop rule.

Interactive browser verification belongs to the combined release. Earlier local-preview access was blocked; pixel/crop inspection and HTTP/server-rendered markup checks do not claim a live-browser interaction pass. The separate release owner integrates this patch with the SEO and CTA changes, then verifies the combined result. Recheck dated maintenance notices if release is delayed beyond their relevant dates.

## Hortus-only follow-up · 2026-10-08

The local follow-up starts from `03ea497242df5dacd364d8d213b3de61a1458728`. It changes only the Hortus source record, its component/built-worker regression coverage and this source-decision note. Hortus now has 14 substantive bilingual rows plus its unchanged coordinate-reference row; the nine-record regression set has 72 substantive rows plus six coordinate notes. Catalog size remains 1,007. No new recommendation reason or structured condition is added. The current operator accessibility and visit pages are the sources for the four new rows; all unrechecked rows retain their earlier dates. Publication is a separate step.

Follow-up validation: typecheck, all 20 main test scripts, production build and the 202-response built-worker HTTP/SEO suite pass. The checks include every Hortus visit row in visible Korean and English markup, retained image hashes and compact catalog metadata. An exact baseline comparison confirms that only Hortus's record-level check date and visit-detail fields changed. No browser-interaction pass, remote CI or public deployment is claimed.
