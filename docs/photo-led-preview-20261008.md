# Photo-led design preview — review before publication

## Base and scope

This is an isolated design experiment rebased onto deployed main commit `6eb14fa1d801329a0adc9bccab1d080b919f182a`, tree `2562135f4d2ffe14d9c75c9af160190da7cf9be9`. It was originally authored against release commit `36738a1c3ac95af198ebca9ee50d9a28373c1e0f`. The local rebase preserves the subsequent native React canonical/language/robots tags, explicit head icons, rendering correction and expanded SEO tests. The deleted global `htmlLimitedBots` configuration is not restored. The publisher checkout is not modified by this experiment.

Separate authorization on October 8 covers a preview branch, draft PR and Cloudflare preview validation. It does not authorize merging into main or deploying the design to the production site. No template purchase, new remote asset/font fetch, account/payment change or database migration is included.

## Original changes

- Venue detail pages: title → licensed photo and original credit → concise identity and essential facts → actions and expandable information. Mobile DOM order agrees with visual focus order. Save, map, share, reviews, source deep links, and no-photo states remain.
- Guides: an original alternating image/text rhythm, readable headings, short introductions and optional condition/evidence disclosure. Three pre-visit checks remain available in a native disclosure. Source photos retain attribution and notices.
- Home: larger recommendation images and lighter typography. The existing country/globe → pause type → recommendations flow remains. Yeonaon, the warm palette, country selection, optional region, public fallback and reduced-motion control are unchanged.
- Photo attribution: reusable captions in home evidence disclosures, guides and related-place credit disclosures; exact source, creator, license and alteration/historical notices are preserved.
- No Safeer template code, text, photographs, SVGs, components or Saprona font are incorporated. The work adapts general principles of whitespace, large photography and low-density information using existing product structure.

## Rights boundaries

The three photos used in the review PDF were checked separately against their live source records and local sidecar hashes:

- Kew: SkyRose18, CC0 1.0, https://commons.wikimedia.org/wiki/File:Kew_Gardens_Greenhouse_Exterior.jpg
- Jardin du Luxembourg: Eutouring, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Chairs_at_Jardin_du_Luxembourg.jpg
- Royal Botanic Garden Sydney: Dietmar Rabich, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Sydney_(AU),_Royal_Botanic_Gardens_--_2019_--_3081.jpg

Existing catalog records and photo sidecars are unchanged. This task is not a fresh legal audit of every legacy photo or the original Yeonaon artwork. The site uses its existing system-font fallbacks and does not add font files. PDF-only font rendering does not alter website fonts.

## Verification

Passed against final implementation:

- TypeScript check (`npm run check`)
- Full existing regression suite plus new photo-led checks (`npm test`)
- Production build (`npm run build`)
- Local production-bundle HTML/SEO suite (`npm run test:seo`): 188 actual HTML responses across 30 countries and browser/Googlebot/Bingbot/Facebook/empty User-Agent cases, KO/EN alternatives, canonicals, place links, basic noindex, 404s, login exclusion and 949 sitemap URLs. This is HTTP/HTML integration testing, not browser rendering.
- New KO/EN static server-markup checks for all three review examples; image-before-summary order, exact photo credits/notices, mobile DOM order, native disclosures, no-photo preservation, reduced-motion rules, and unchanged discovery ordering

The code tests cover the existing globe's all-country keyboard/tap selection, drag/cancel recovery, reduced motion, KO/EN finder fallback/empty/error/late-response behavior, and source/review disclosure navigation. These are source/component tests, not rendered touch-device validation.

Actual local browser rendering was blocked by `net::ERR_BLOCKED_BY_CLIENT`. No alternate browser route was used. Therefore final rendered responsive layout, screenshot fidelity, browser-level touch/keyboard behavior and visual regressions are not verified. The four-page PDF is explicitly labelled a manually composed static design board; it is not a browser screenshot or proof of browser QA.

Before release: review the design direction, run actual desktop and narrow-screen browser QA in an approved preview environment, recheck source/license displays and place interactions, then obtain separate publication authorization.

## Mobile polish after design review

The user requested the same airy feel on mobile. Static CSS arithmetic at 320/360/390/430px gives 280/320/350/390px venue/guide content widths, 4:3 photos approximately 210/240/263/293px high, and 24–28px stack gaps. Long titles use wrapping rather than clipping. These are computed design bounds, not measured browser rendering.

Photo captions are now at least 12px. Mobile disclosure hit areas are at least 44px, including nested source disclosures. For the main sections, existing outside padding is moved into the clickable summaries so the larger target does not add oversized blank gaps. The snapshot base is now deployed main `6eb14fa1d801329a0adc9bccab1d080b919f182a` / tree `2562135f4d2ffe14d9c75c9af160190da7cf9be9`; the publisher’s native-metadata/rendering correction is incorporated. The reviewed patch is being published only to the separately authorized preview branch. Actual browser results will be recorded after validation.

