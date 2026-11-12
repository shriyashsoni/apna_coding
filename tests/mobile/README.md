# Mobile and usability regression

From the repository root:

```
node tests/mobile/build.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/mobile/test.mjs
npx tsc -b
```

Uses installed Chromium at `/usr/bin/google-chrome`. The focused harness renders real public page/layout components, with authentication, wallet execution and SEO stubbed. It is not a substitute for the full deployment build or the signed-in production check.

- Home, events, hackathons, jobs, products and news at 320/390/768/1024/1440px: content loaded, viewport does not expand, actual screenshots.
- Phone/tablet menu toggle, Escape and navigation close behavior.
- Remote decorative video failure cannot cover the page; phone requests no decorative video; reduced-motion desktop uses static opportunity cards.
- Community directory names remain readable without logo assets; no unsupported partnership claims.
- Controlled admin draft creation: pending-only, rejection keeps input, duplicate slug prevented, uncertain save response recovers the same ID without duplicate insert, reload readback.
- Controlled product image editing: mirror failure makes no row change, denial/mismatched server return retains form, successful mirror changes image_url only and preserves pending state/ID/slug.

Public page tests may read current public database rows/images. Every non-GET request from public tests is blocked. Admin scenarios use synthetic intercepted data only and cannot perform live writes, uploads or wallet transactions. Screenshots/results are written under `/downloads/` by the test runner.
