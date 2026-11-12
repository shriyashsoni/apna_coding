# Public SEO changes

- Every real public static route has server-delivered metadata. Listing detail and category HTML contains public content and crawlable links before JavaScript runs. The same response goes to normal visitors and search engines; the original React app, assets and animations still take over the root. Social crawlers keep their listing-specific image/card path.
- `api/seo-page.ts` reads `dist/index.html`, included in that function by `vercel.json`. Verify both the preview build and actual function response before merging changes to this path.
- Sitemaps use the same explicit published/approved filters as public metadata, paginate records, escape XML and fail with 503 if the source fails. The original news query selected a nonexistent `image` column and the community query selected nonexistent `updated_at`; both formerly produced empty sitemaps with status 200.
- Canonicals and sitemap URLs use `https://www.apnacoding.com`, the live host. Non-www redirects to www. Tracking parameters are not canonical URLs. Absolute URLs no longer get concatenated to the site origin.
- JSON-LD uses source data without invented start times, salaries, dates, ratings or third-party brand ownership. TBA event times remain date-only. Fully virtual events use WebPage instead of claiming eligibility for Google's physical Event experience.
- Jobs use WebPage, not JobPosting, until the original employer posting date, complete employer description and verified country/remote eligibility data are available. The platform's import date is not the employer's original datePosted. Products do not claim Apna Coding is their brand.
- Private/account/certificate routes are noindex and excluded from sitemaps. Certificate records are not read by metadata. Unknown/unpublished detail URLs return 404 without listing data. Draft views that an owner can open in the app are also noindex.
- Event groups currently have no rows and no verified public-publish contract. Their category remains public; detail shells remain functional but noindex and do not read group data for SEO until that contract is confirmed. Do not infer publication from mere anon readability.

## Checks

`npx tsc -b`

`node scripts/test-seo.mjs`

The SEO tests are self-contained synthetic fixtures and cover each listing category, private/draft exclusion, canonical normalization, date-only handling, JSON escaping, 404 and source-failure behavior.

## Owner-only follow-up

No Search Console claim, verification, account change or submission is implied. Use the owner's Search Console property to submit `https://www.apnacoding.com/sitemap.xml` and inspect representative detail URLs after deployment. Indexing, rich results and ranking are Google's decisions, not guaranteed by these changes.

## References checked November 12, 2026

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/fundamentals/get-started-developers
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/appearance/structured-data/job-posting
- https://developers.google.com/search/docs/appearance/structured-data/event
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions
