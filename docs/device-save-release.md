# Device saving and visitor information — October 5, 2026

## Changes
- Explicit device bookmarks use a separate localStorage key, with a 200-place limit. Map-open/visited journal records and account saves are not migrated, deleted, or mixed into bookmarks.
- Anonymous list and detail buttons share device state. Saved places defaults to this device; signed-in users can select their existing account saves. Private back-navigation remembers that selection. Regular browsing always uses device bookmarks.
- Prior device saves remain in the rest journal and are linked from the saved view because old planned records did not distinguish a deliberate save from opening maps.
- Successful device saves contribute to the existing aggregate save event. No bookmark IDs or identities are sent. Stats copy distinguishes aggregate save actions from stored account-save totals.
- Sticky Directions uses the same map-open aggregate and planned-journal behavior as the main map link. Full journals refuse new records instead of evicting past visits.
- Kensington Gardens and VanDusen receive dated official visitor information. AIRE London is added without an unlicensed photo or uncertain coordinates; its official location link and address remain available.
- No payment enablement, authentication changes, new analytics vendor or database migration.

## Verification
Run `pnpm run check`, `pnpm test`, `node scripts/audit-catalog.cjs`, and `pnpm run build`.
Additional runtime tests cover malformed/duplicate data, capacity, blocked storage, bookmark removal/reload, journal preservation and finite DNT/GPC-respecting analytics payloads.
Predeployment browser execution was unavailable in the cloud sandbox. Production smoke checks are required after the existing Cloudflare main deployment finishes: anonymous list save; detail saved state; saved filter; removal; reload; cross-tab synchronization; mobile Directions; and the three visitor-information pages.

## Reversal
If production smoke checks fail, revert this release commit through a new commit on main and let the existing Cloudflare deployment rebuild. Keep the device-bookmark key intact so a later fix can restore access; do not clear user browser data or touch account/journal records.
