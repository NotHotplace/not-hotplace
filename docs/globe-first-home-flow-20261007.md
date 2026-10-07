# Globe-first homepage flow

Date: 2026-10-07
Base: `93aef98ea9e8279ad1d8e0b82e84e5dde17d0526` (six-place enrichment retained)

## Changes

- Country selection is the first interactive homepage stage, in a compact globe disclosure. The tall country directory and two duplicate country dropdowns are removed from the homepage.
- Country pins and supported land shapes select on the homepage. Selection closes the globe and focuses the pause control. Country exploration remains an explicit separate link.
- Previous/next-country controls and arrow/Home/End navigation make all 30 countries reachable without a country list. Browsing and focus do not commit the country or reload recommendations. Enter, Space, or a deliberate tap commits.
- Keyboard navigation prioritizes its target pin and turns immediately, so it works when motion is paused or reduced. Opening/closing preserves the manual motion preference. Escape cancels browsing and returns focus to the disclosure summary.
- The pause choice comes next, with an optional region dropdown limited to the chosen country. “All regions” is the default; country changes reset the region and preserve the pause choice.
- Recommendations have their own heading. Existing theme discovery remains under a secondary collapsed disclosure. The compact mobile Yeonaon introduction is preserved.
- A failed globe load can be retried. The error overlay sits above the opaque SVG.

## Verification

Passed:

- TypeScript check (`pnpm run check`).
- Full existing test suite plus updated globe interaction and new home-flow tests (`pnpm test`).
- Production build (`pnpm run build`).
- `git diff --check`.
- Independent read-only review, including confirmation of the retry overlay and repeated same-orientation keyboard focus fixes.

The pnpm commands used `--config.manage-package-manager-versions=false --config.verify-deps-before-run=false` to use this checkout's installed toolchain without its automatic dependency installation step. Build logs were redirected to a writable temporary path with `WRANGLER_LOG_PATH`.

The component tests exercise actual handlers in KO/EN at 280, 320, 375 and 650 pixels: all 30 countries, explicit selection versus browsing, Enter/Space/tap, drag/scroll/cancel suppression, collapsed/reopened state, focus handoff, repeat Home at an unchanged orientation, remembered country, map retry, and manual/reduced motion. The existing geometry suite passes 2,884 layouts. Independent projection checks also covered all 30 countries at six widths.

Home-finder tests cover stage order, optional country-scoped regions, preservation of purpose, region reset, explicit localized country links, late/aborted responses, fallback, empty results, and errors.

## Remaining release check

Rendered browser QA was attempted against the local Vite server, but Chromium could not start because this executor denies its required socket operation. One approved elevated retry produced the same OS failure. No new screenshots or browser-pass claim are included. Verify the actual preview on mobile 320/375/390 and desktop in both languages before release, including country browsing/selection, long labels, focus visibility, page overflow, and source disclosures.

This change was prepared locally. It does not itself authorize pushing, opening a PR, merging, or deploying.

## Preview interaction correction

The first actual Chromium preview check found that auto-scrolling a pointer-selected browse target moved the country navigation beneath the viewport. Repeated clicks could then land on a pin. Pointer next/previous navigation now keeps focus on the stationary control and does not scroll; keyboard traversal explicitly focuses and instantly reveals its target. The globe is also bounded by viewport height on short laptop windows. Regression tests cover 60 consecutive pointer browse actions in each locale without selection, focus transfer, or scroll, plus keyboard focus visibility.
