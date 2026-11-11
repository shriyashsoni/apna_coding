# News workflow regression checks

These checks render the actual AdminDashboard, NewsPostEditor, News, NewsDetail,
and homepage teaser in a small Vite build. Auth and unrelated admin components
are stubbed. Every Supabase request is intercepted by Playwright and handled
against synthetic rows. No production rows are read or written by this suite.

From the repository root, after `npm ci`:

```sh
npm install --prefix /tmp/apna-news-test-runner playwright --no-audit --no-fund
node tests/news/build.mjs
PLAYWRIGHT_MODULE=/tmp/apna-news-test-runner/node_modules/playwright/index.mjs \
  CHROME_PATH=/usr/bin/google-chrome node tests/news/test.mjs
```

The runner needs an installed Chrome executable. Change CHROME_PATH if needed.
Screenshots default to scratch/news-tests; SCREENSHOT_DIR can override it.

Coverage: native published/draft creation; supported category payload; no unsupported
excerpt/tags; publishing/unpublishing by ID and reload; rejected and mismatched
publish responses; editor failure/input retention and successful ID-preserving
edit/reload; mobile Cancel; ordered pagination; Featured persistence without
pagination reset; public listing/homepage published filters; draft detail denial
before comments/views; published detail still readable; no page errors.

This is a controlled UI regression suite, not a full production build or real
backend persistence check. Before release, require a successful Vercel build.
After release, verify actual authenticated edit/publish persistence and public
visibility with authorized content. Published filters do not replace database
RLS: this patch does not change Supabase policies or make draft rows confidential
at the API layer.
