# Search names, source dates and Hyde Park notices

Checked 2026-10-13. Based on main `7121c9f4`. Local implementation only; no publication or deployment.

## Bounded English names and search

- `tour-3443228` keeps its stored Korean identity, 벤의 서재. English display and search use **Ben’s Library**, printed in [Marie Claire Japan's April 27, 2025 editorial](https://marieclairejapon.com/culture/234406/). Its address and operator handle match the existing catalog record. This is an editorially attested English name, not a claim that an official English tourism record was found. [Holiday Korea](https://holidaykr.com/attractions/2316) independently displays the same name and matching address. No operating conditions were copied from either source.
- Direct fetches of the [operator profile](https://www.instagram.com/benslibrary_bookcafe/) and [embedded operator post](https://www.instagram.com/p/DDweyqLv8g_/) were unavailable. The implementation does not claim to have verified their content.
- The approved home preview's **Seonyudo Park** and **Seoul Forest** labels are supported by official Visit Seoul: [Seonyudo Park](https://english.visitseoul.net/yongsan%26yeouido-area/SeonyudoPark/ENP000378), [Seoul Forest](https://english.visitseoul.net/nature/seoul-forest/ENP001838).
- Only these three records acquire sourced English display names. Korean names, IDs, addresses and original catalog records remain unchanged. Unknown names keep their original spelling.
- Search normalizes apostrophes, case, and the existing whitespace behavior. No edit-distance, guessed translation, or broad fuzzy alias rule is added. Exact Ben’s Library/Bens Library queries resolve to the existing single venue; mixed Korean/English terms also work.

## Source-date semantics

`checked` retains the existing aggregate visit-information date. `sourceChecked` preserves the base source's date and includes only explicitly dated details whose URL equals the primary source URL. Newer evidence from a different URL cannot refresh that primary-source date.

The shared source summary separates “Visit information updated” from “This source checked.” Ben’s Library shows October 12 for the former and October 2 beside its original KTripTips link. Its underlying identity import remains September 13, and historical tourism hours/closure/payment facts retain October 2. No historical source or visitor publication is described as newly reverified.

This is applied to thematic guides, place details, the legacy explorer dialog, comparison source cells and regional date labels. KO/EN visible names, place metadata, JSON-LD and context-preserving return links use the same sourced-name helper.

## Hyde Park

Sources read on October 13:

- [Hyde Park](https://www.royalparks.org.uk/visit/parks/hyde-park): current page no longer displays the July 1 fountain closure or October 11 race notice.
- [Hyde Park FAQs](https://www.royalparks.org.uk/visit/parks/hyde-park/faqs): directs visitors to current park notices for temporary access changes.
- [Diana Memorial Fountain](https://www.royalparks.org.uk/visit/parks/hyde-park/diana-memorial-fountain): routine seasonal hours and maintenance caveat, with no verified reopening statement.
- [Royal Parks Half Marathon event](https://www.royalparks.org.uk/whats-on/royal-parks-half-marathon): the official indexed result dates the event to October 11, 2026; direct access currently returns 404. [Official autumn overview](https://www.royalparks.org.uk/read-watch-listen/top-things-do-royal-parks-autumn) corroborates that date.

The expired October 11 event warning is removed from active descriptions and visit guidance. For archival context, the prior catalog (checked October 2) described road/cycle-route closures for that event; it is not a current access restriction. The July 1 fountain notice is retained as historical information with its October 2 check date. Current fountain operation is explicitly unverified; the absence of the old notice is not evidence of reopening. Unchanged hours and coordinate-reference dates remain October 2.

No price, coordinate, image, payment or account changes. Catalog count remains 1,010 unique places and 36 Seoul entries. De Krook is not added.

## Verification

- `npm test`: complete repository suite, including new `verify-name-source-freshness.cjs`.
- `npm run check`: TypeScript.
- `npm run build`: production vinext/Cloudflare build.
- `npm run test:seo`: built local Worker responses across Korean/English, browsers, crawlers, social preview user agents and empty user agents. Includes Ben’s localized identities and split source dates, Hyde’s historical/current distinction, canonical/hreflang and return-context behavior.

The package scripts are unchanged except adding the new regression to `test`; npm invokes the same commands. The local pnpm shim initially tried to bootstrap its version in a nonexistent home cache, so verification used the installed dependencies with npm instead.
