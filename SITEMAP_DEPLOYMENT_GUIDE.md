# Sitemap & SEO System - Deployment Guide

## Overview
Your sitemap system is now fully configured and ready for deployment. This guide will help you deploy and verify everything works correctly.

## System Architecture

### How It Works
1. **Convex HTTP Endpoints** - Generate dynamic sitemaps from your database
2. **Vercel Rewrites** - Proxy sitemap requests from your domain to Convex
3. **Automatic Updates** - Sitemaps update in real-time when you publish content

```
User Request: https://apnacoding.com/sitemap.xml
       ↓
Vercel Rewrite (vercel.json)
       ↓
Convex HTTP Endpoint: https://quiet-meadowlark-706.convex.site/sitemap.xml
       ↓
Convex Query: api.sitemaps.getSitemapIndex
       ↓
Returns XML with all sitemap URLs
```

## Files Created

### 1. Convex Backend (Already Deployed ✅)
- `convex/sitemaps.ts` - Sitemap generation queries
- `convex/http.ts` - HTTP endpoints for XML serving

### 2. Vercel Configuration (New)
- `vercel.json` - Rewrites to proxy sitemap requests to Convex

### 3. SEO Components (Integrated)
- `src/components/SEOHead.tsx` - Page-level SEO metadata
- `src/lib/structuredData.ts` - Schema.org JSON-LD generators

## Deployment Steps

### Step 1: Push to Git
```bash
git add vercel.json
git commit -m "Add Vercel configuration for sitemap routing"
git push origin main
```

### Step 2: Vercel Will Auto-Deploy
If your project is connected to Vercel, it will automatically:
1. Detect the new `vercel.json`
2. Configure rewrites
3. Deploy the changes

**Expected Time**: 1-2 minutes

### Step 3: Verify Sitemaps Work
After deployment, test these URLs:

```bash
# Main sitemap index
curl -I https://apnacoding.com/sitemap.xml

# Category sitemaps
curl -I https://apnacoding.com/sitemap-static.xml
curl -I https://apnacoding.com/sitemap-news.xml
curl -I https://apnacoding.com/sitemap-events.xml
curl -I https://apnacoding.com/sitemap-hackathons.xml
curl -I https://apnacoding.com/sitemap-jobs.xml

# Robots.txt
curl -I https://apnacoding.com/robots.txt
```

**Expected Response**:
- Status: `200 OK`
- Content-Type: `application/xml` (for sitemaps)
- Content-Type: `text/plain` (for robots.txt)

## Vercel.json Explanation

```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "https://quiet-meadowlark-706.convex.site/sitemap.xml"
    }
    // ... more rewrites
  ]
}
```

**What this does**:
- Intercepts requests to `/sitemap.xml` at your domain
- Proxies them to the Convex HTTP endpoint
- Returns the response as if it came from your domain
- User never sees the Convex URL

## Available Sitemaps

### 1. Sitemap Index (`/sitemap.xml`)
Main sitemap that links to all category sitemaps.

**Contains**:
- `/sitemap-static.xml`
- `/sitemap-news.xml`
- `/sitemap-events.xml`
- `/sitemap-hackathons.xml`
- `/sitemap-jobs.xml`

### 2. Static Pages (`/sitemap-static.xml`)
Core website pages that don't change often.

**Includes**:
- Homepage (`/`)
- About (`/about`)
- News listing (`/news`)
- Events listing (`/events`)
- Hackathons listing (`/hackathons`)
- Jobs listing (`/jobs`)
- Community (`/community`)
- Learn (`/learn`)

**Update Frequency**: Weekly
**Priority**: 0.9 (high)

### 3. News Articles (`/sitemap-news.xml`)
All published news articles.

**Dynamic Content**: Updates automatically when you publish news
**URL Pattern**: `/news/{slug}`
**Update Frequency**: Weekly
**Priority**: 0.7 (medium-high for featured), 0.6 (normal)

### 4. Events (`/sitemap-events.xml`)
All published events.

**Dynamic Content**: Updates automatically when you publish events
**URL Pattern**: `/events/{slug}`
**Update Frequency**: Daily
**Priority**: 0.8

### 5. Hackathons (`/sitemap-hackathons.xml`)
All approved hackathons.

**Dynamic Content**: Updates automatically when hackathons are approved
**URL Pattern**: `/hackathons/{slug}`
**Update Frequency**: Daily
**Priority**: 0.8

### 6. Jobs (`/sitemap-jobs.xml`)
All active job postings.

**Dynamic Content**: Updates automatically with job posts
**URL Pattern**: `/jobs/{id}`
**Update Frequency**: Daily
**Priority**: 0.7

## Google Search Console Setup

### After Deployment

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console
   - Select your property: `apnacoding.com`

2. **Submit Sitemap**
   - Left sidebar → **Sitemaps**
   - Click **Add a new sitemap**
   - Enter: `sitemap.xml`
   - Click **Submit**

3. **Google Will**:
   - Fetch your sitemap index
   - Discover all category sitemaps
   - Start crawling all URLs
   - Index pages within 24-48 hours

4. **Monitor Progress**
   - **Index Coverage** - See which pages are indexed
   - **Sitemaps** - View submitted sitemaps and discovered URLs
   - **URL Inspection** - Test individual URLs

### Request Indexing for Important Pages

For top priority pages, manually request indexing:

1. Go to **URL Inspection** tool
2. Enter URL (e.g., `https://apnacoding.com/news/latest-article`)
3. Click **Request Indexing**
4. Repeat for 10-20 most important pages

**Expected Timeline**:
- Sitemap processed: 1-2 hours
- First pages indexed: 24-48 hours
- Full site indexed: 1-2 weeks

## How to Monitor

### Check Sitemap Status in Google Search Console

1. **Sitemaps Tab**
   - Shows: Submitted sitemaps
   - Discovered URLs count
   - Last read date
   - Status (Success/Error)

2. **Index Coverage Report**
   - Valid: Pages successfully indexed ✅
   - Valid with warnings: Indexed but with issues ⚠️
   - Error: Pages blocked from indexing ❌
   - Excluded: Pages discovered but not indexed yet 📋

### Expected Results

**After 24 Hours**:
- Sitemap processed
- Main pages (homepage, about) indexed
- Some news/events indexed

**After 1 Week**:
- Most pages indexed
- Sitemap refreshed multiple times
- Structured data recognized

**After 2 Weeks**:
- All quality content indexed
- Regular crawl schedule established
- Pages appearing in search results

## Troubleshooting

### Sitemap Returns 404

**Problem**: `https://apnacoding.com/sitemap.xml` returns 404

**Solutions**:

1. **Check Vercel Deployment**
   ```bash
   # Verify vercel.json is in git
   git ls-files | grep vercel.json

   # If not, add it
   git add vercel.json
   git commit -m "Add vercel.json"
   git push
   ```

2. **Verify Convex URL**
   - Open `vercel.json`
   - Check destination URLs match your Convex deployment
   - Should be: `https://quiet-meadowlark-706.convex.site`

3. **Clear Vercel Cache**
   - Go to Vercel dashboard
   - Settings → Domains
   - Click "Invalidate Cache"

### Sitemap Shows No URLs

**Problem**: Sitemap XML is empty or has no content

**Solutions**:

1. **Check Database Has Content**
   ```bash
   npx convex run sitemaps:getNewsSitemap
   ```

2. **Verify Content is Published**
   - News: `isPublished: true`
   - Hackathons: `status: "approved"`
   - Events: `isPublished: true`

3. **Check Convex Deployment**
   ```bash
   npx convex deploy
   ```

### Google Search Console Errors

**Error: "Couldn't fetch sitemap"**
- Wait 1 hour and try again
- Verify sitemap URL loads in browser
- Check for SSL certificate issues

**Error: "Sitemap is an HTML page"**
- Verify Content-Type is `application/xml`
- Check vercel.json headers are configured

**Error: "Parsing error"**
- Test XML validity: https://www.xmlvalidation.com
- Ensure no special characters in URLs
- Check date formats are ISO 8601

## Adding New Content Types

If you add a new content type (e.g., "Products"), follow this pattern:

### 1. Add Sitemap Query (`convex/sitemaps.ts`)

```typescript
export const getProductsSitemap = query({
  args: {},
  handler: async (ctx) => {
    const baseUrl = getBaseUrl();
    const products = await ctx.db.query("products")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    return {
      urls: products.map((product) => ({
        loc: `${baseUrl}/products/${product.slug}`,
        lastmod: new Date(product._creationTime).toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      })),
    };
  },
});
```

### 2. Add HTTP Route (`convex/http.ts`)

```typescript
http.route({
  path: "/sitemap-products.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const data = await ctx.runQuery(api.sitemaps.getProductsSitemap);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${data.urls.map((url: any) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800",
      },
    });
  }),
});
```

### 3. Add to Sitemap Index

In `getSitemapIndex()`, add:

```typescript
{
  loc: `${baseUrl}/sitemap-products.xml`,
  lastmod: lastMod,
}
```

### 4. Add Vercel Rewrite

In `vercel.json`, add:

```json
{
  "source": "/sitemap-products.xml",
  "destination": "https://quiet-meadowlark-706.convex.site/sitemap-products.xml"
}
```

### 5. Deploy

```bash
npx convex deploy
git add .
git commit -m "Add products sitemap"
git push
```

## Performance Optimization

### Caching Strategy

**Sitemap Index**: 1 hour cache (max-age=3600)
- Changes infrequently
- Points to other sitemaps

**Category Sitemaps**: 30 minutes cache (max-age=1800)
- Updates when content published
- Balance between freshness and performance

**Robots.txt**: 24 hours cache (max-age=86400)
- Rarely changes
- Can be cached aggressively

### Load Testing

Monitor Convex function execution:

```bash
# Check recent sitemap requests
npx convex logs --function http --tail 50
```

**Expected Performance**:
- Sitemap generation: <500ms
- XML response size: <50KB per sitemap
- Concurrent requests: Unlimited (Convex scales automatically)

## Security Headers

The `vercel.json` includes security headers:

```json
"X-Content-Type-Options": "nosniff"
"X-Frame-Options": "DENY"
"X-XSS-Protection": "1; mode=block"
```

**What they do**:
- Prevent MIME type sniffing attacks
- Block iframe embedding (prevents clickjacking)
- Enable browser XSS protection

## Maintenance

### Weekly Tasks
- [ ] Check Google Search Console for errors
- [ ] Verify new content appears in sitemaps
- [ ] Monitor index coverage report

### Monthly Tasks
- [ ] Review and optimize sitemap priorities
- [ ] Check for crawl errors
- [ ] Update robots.txt if needed
- [ ] Test sitemap XML validity

### As Needed
- [ ] Request indexing for important new pages
- [ ] Fix any validation errors from GSC
- [ ] Update structured data schemas

## Support

### If Sitemaps Don't Work After Deployment

1. **Wait 5 minutes** - Vercel deployments take time
2. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
3. **Test direct Convex URL** - Should work: https://quiet-meadowlark-706.convex.site/sitemap.xml
4. **Check Vercel logs** - Dashboard → Deployments → View logs
5. **Verify vercel.json syntax** - Use JSON validator

### Contact Points

- **Vercel Issues**: https://vercel.com/support
- **Convex Issues**: https://docs.convex.dev/support
- **Google Search Console**: https://support.google.com/webmasters

## Success Checklist

After deployment, verify:

- [ ] `https://apnacoding.com/sitemap.xml` returns XML (not 404)
- [ ] `https://apnacoding.com/robots.txt` shows correct content
- [ ] All category sitemaps load (news, events, hackathons, jobs)
- [ ] Sitemaps show your actual published content
- [ ] URLs in sitemaps match your site structure
- [ ] Submitted sitemap to Google Search Console
- [ ] Google successfully fetched the sitemap
- [ ] First pages appear in Index Coverage report

## What's Next

After sitemaps are deployed and submitted to Google:

1. **Implement SEO on Individual Pages**
   - Use `SEOHead` component on all pages
   - Add structured data for specific content types
   - See: `src/examples/SEO_Usage_Examples.tsx`

2. **Optimize Content for Search**
   - Write descriptive titles (50-60 characters)
   - Create compelling meta descriptions (150-160 characters)
   - Use proper heading hierarchy (H1 → H2 → H3)
   - Add alt text to images

3. **Build Internal Links**
   - Link from homepage to top content
   - Create "Related Posts" sections
   - Use descriptive anchor text

4. **Monitor Performance**
   - Track rankings in Google Search Console
   - Monitor click-through rates
   - Analyze which pages get traffic

---

**Your SEO system is now complete and ready for deployment!** 🚀

Once you deploy, pages will start appearing in Google Search within 24-48 hours.
