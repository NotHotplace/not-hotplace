# Search metadata checks

`next.config.ts` uses `htmlLimitedBots: /.*/` to render metadata in the initial
HEAD for browsers and crawlers. Our generators only read local catalog data.
This avoids canonical/hreflang tags in the streamed BODY and the associated
Vinext pathname/hash icon markers. Those markers are internal metadata keys,
not route destinations; no redirects have been added for them.

The installed Vinext beta still streams metadata when a request completely
omits User-Agent. Normal browser, Googlebot and Bingbot requests are covered.
Recheck that upstream behavior before changing or removing this setting.

Country pages share one metadata helper, including the explicit KR/US/JP
routes. Query parameters do not become part of their canonicals. Language
specific place and guide URLs keep reciprocal KO, EN and x-default links.

Basic place pages intentionally remain `noindex, follow` and absent from the
sitemap. Login remains excluded by robots.txt and absent from the sitemap.

## Run the checks

After installing the lockfile dependencies:

```sh
pnpm run check
pnpm test
pnpm run build
pnpm run test:seo
```

`test:seo` starts the built Worker locally with remote bindings disabled,
temporary local persistence, and the installed workerd's supported date. It
does not alter production configuration or data. CI runs it after every build.
It covers 30 countries, 23 bilingual regional guides, representative place
and purpose-guide pages, three User-Agents, query canonicals, icons, 404s,
indexing exclusions, and every sitemap place's indexing policy. Regional
guides include places with empty visitDetails arrays, which must render
without dereferencing a missing first detail.

To verify a deployment with the same read-only assertions:

```sh
SEO_BASE_URL=https://nothotplace.com pnpm run test:seo
```

The checker inspects real elements in the raw response, ignoring serialized
RSC/JSON script text. It does not depend on JavaScript moving tags later.
