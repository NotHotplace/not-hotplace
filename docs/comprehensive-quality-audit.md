# Comprehensive defect audit — October 5, 2026

## Scope and limits
Baseline: main `d0d33197c3701bf1075f1377f17adbacb3de6e79`, 1,007 curated records across 30 countries. This release combines source-code/API tests, full-catalog structural checks, reviewed operational-English corrections and targeted external-source checks. It does not establish that every venue is currently open, quiet, available or freshly web-verified. Missing photos and uncertain source facts remain explicit gaps, not fabricated data.

## Confirmed defects fixed
- Hash quicklinks reveal closed source/visit/review disclosures, including direct deep links, Back/Forward and a same-hash click after manual collapse. Focus goes to the relevant heading/summary.
- Quick-feedback reads cannot undo a successful save/delete, overwrite optional-field edits, or populate another place after navigation/unmount. Deferred-promise component tests reproduce the former races.
- Detailed account-review data is also guarded by place ID, request generation and mutation lifecycle, so a late place-A response cannot prefill place B's editor. Views are counted per place ID.
- A device-journal write now validates its supported record before reporting success. Community-suggested places still support online responses and device bookmarks; their device-journal entries are not supported yet. The response UI explains that limitation and existing local history is untouched.
- Fallback recommendation copy no longer repeats “안내”. Generic legacy modal source links say “published”, rather than implying every source is an operator's official page.
- Dormant payment reconciliation returns the persisted order state. A verified settled/expired discrepancy yields a manual-review error instead of false success. Refunded orders remain terminal. Live payments remain disabled; no payment provider was contacted in testing and no charge/refund/recovery policy was introduced. Settled-expired recovery remains a prelaunch operations decision.

## Data and English corrections
- Mouse Rabbit: conflicting 22:00/23:00 listings are shown as a conflict, with both sources linked; no closing time is invented.
- Ikseondong Geujip: nearby paid parking is distinguished from venue parking and removed from the positive venue-parking condition.
- Soyeonjae: corroborated street-level address added with source links; no coordinates invented.
- Four upstream malformed operational fields now explain uncertainty: a phone number stored as a closure schedule, ambiguous AM/PM hours, an incomplete closure label and last orders later than closing.
- 388 reviewed English correction positions across 241 venues: 380 exact-guard patches applied, while eight already-corrected manual fields/mirrors were preserved. Translation-only changes retain Korean text, numbers, qualifiers, original sources and check dates. Menu names and proper names were not blindly translated. The final merged catalog has zero remaining non-menu operational Hangul flags; that is a language-quality check, not evidence of current venue operations.
- The 65 generic payment fields whose source only says “available” retain their generic label. No credit-card-specific meaning is inferred without source evidence; four card-specific translations and one explicit credit-card label remain appropriately scoped.
- Point Reyes' displayed image is withheld because provenance/license links are incomplete. Holland Park's unverified remote image reference is also withheld. Existing asset files and original metadata remain recoverable in `held-photo-provenance.json`; no claim of illegality or replacement image is made.

## Verification
The test command includes the existing authentication, permissions, input-validation, review/payment-boundary, bookmarks, source presentation and client-payload tests plus deferred UI-state and catalog-invariant regression suites. Structural coverage checks every curated ID/country/category, coordinate pairs, source URLs/check dates, referenced local image paths, selected data fixes and the payments-disabled configuration. Generated client indexes must remain synchronized with all 1,007 records.

Predeployment live-browser audit confirmed the disclosure defect and exercised anonymous KR/EN search, filters and navigation without posting reviews. Component/DOM regression tests use controlled mocks; they are not a substitute for postdeployment browser QA. Signed-in production flows and a physical/mobile viewport were not exercised. After deployment, recheck source/visit/review quicklinks, same-hash reopening, feedback controls, save/remove/reload, corrected venue facts and English labels. Revert the release if needed without clearing user storage.
