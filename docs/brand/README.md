# Warm illustrated brand

Approved direction: cream paper, olive guidance and burnt-orange actions, paired with the existing fictional tea-guide illustration, 여나온 (Yeonaon). The homepage introduces the character in both languages, with a compact portrait beside the introduction on mobile and the existing full illustration on desktop.

## Assets
- `public/assets/brand-tea-guide.webp`: existing approved tea-guide artwork, proportionally downsampled to 480 × 600 and encoded as WebP (22,776 bytes). Decorative, with intrinsic dimensions and no tracking. The full underlying illustration is not a photograph of a venue or a real visitor.
- `public/favicon.svg`: original code-native mark with warm colors.
- `maskable-icon.svg`: safe-area version of that mark.
- `social-preview.svg`: editable code-native source for `public/og.png`.
- PNG icons/social card are exported from these SVGs with Inkscape. The installation QR stays unchanged.

## Verification
Run `npm run check`, `npm test`, and `npm run build` (equivalent package scripts to the documented pnpm commands).

The new brand regression script checks normal-text AA contrast, matching install/offline colors, full evidence disclosure, bounded image size, current compact-card selectors, and motion controls. These are source checks, not a replacement for browser accessibility or visual testing.

Review before release at 320, 390, 768 and 1440 pixels, both languages:
- No horizontal overflow on home, country results, place detail or guide pages
- Two finder fields; up to three useful cards; collapsed world globe
- A visible 72 × 80 pixel Yeonaon portrait and readable name/introduction on mobile, including 320 pixels; no duplicate screen-reader image label
- Short mobile cards, including a result with no photo
- Full candidate reason and source remain readable when both disclosures open
- Keyboard-visible focus, usable select fields, language toggle and orange action contrast
- Globe open/close/pause, OS reduced-motion, back/forward and repeated disclosures
- Detail/gallery/dialog, saved places, journal, Plus, install and privacy surfaces

Catalog records, APIs, authorization, payment enablement, attribution and privacy rules are outside the visual change and remain untouched.
