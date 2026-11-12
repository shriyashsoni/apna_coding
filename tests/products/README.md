# Product curation regression checks

Run from the repository root after npm ci. Browser tests use the real public
Products/ProductDetail components, ProductManager, PendingApprovals, and the
homepage teaser. Auth and unrelated components are stubbed. Every external
request is intercepted with synthetic rows, including an approved-status-only
legacy row shaped like the held showcase entry. No production content is read
or written and wallet access throws if called.

```sh
npm install --prefix /tmp/apna-test-runner playwright --no-audit --no-fund
node tests/products/build.mjs
PLAYWRIGHT_MODULE=/tmp/apna-test-runner/node_modules/playwright/index.mjs \
  CHROME_PATH=/usr/bin/google-chrome node tests/products/test.mjs
node tests/products/server-test.mjs
```

Change CHROME_PATH for the installed Chrome executable. SCREENSHOT_DIR overrides
the default screenshot location scratch/product-tests.

Coverage: approved status AND is_approved required on listing, featured, detail,
and homepage; missing author/title schema is not queried; held detail stops
before comment/view calls; original source links and third-party prototype
labels; ID/slug-preserving description, credit, and repository edits; no automatic
publication of inconsistent legacy rows; explicit publication synchronizes both
review fields; write failures keep input; mismatched server state rejects success;
corrected credits visible after publication; stable pagination; mobile Cancel;
editor cannot bypass on-chain review; normal native Approvals synchronizes both
product fields; public query failure ends loading and retry works. Server tests
mock fetch to check metadata withholding and filtered product sitemap using the
live created_at column. News regression suite remains separate under tests/news.

These are controlled component/server tests, not a full production build or real
backend persistence result. Require a successful Vercel build, then authenticated
native UI editing and approval with actual stored readback before calling the
workflow complete. Do not publish legacy rows automatically during deployment.
Creator credits are plain text in description, because no dedicated creator
column exists. Do not infer a complete team or sole authorship from a repository
owner profile. Staked submissions retain the existing Approvals transaction path;
this suite does not send a transaction or prove that path on-chain.

No migrations or RLS changes are included. App and metadata filtering do not make
unapproved rows confidential at the database API layer.
