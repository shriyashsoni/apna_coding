# 📄 Complete Page List - Apna Coding Website

## Overview
This document lists **ALL pages** on the Apna Coding website and shows which sitemap they belong to.

**Total Pages**: 15 static pages + unlimited dynamic pages (based on content)

---

## ✅ All Pages Included in Sitemaps

### 🏠 Main Pages (Priority: 1.0)

| Page | URL | Sitemap | Priority | Update Frequency |
|------|-----|---------|----------|------------------|
| Homepage | https://apnacoding.com/ | sitemap-static.xml | 1.0 | Daily |

---

### 📋 Core Listing Pages (Priority: 0.9)

These are your main content category pages:

| Page | URL | Sitemap | Priority | Update Frequency |
|------|-----|---------|----------|------------------|
| Hackathons | https://apnacoding.com/hackathons | sitemap-static.xml | 0.9 | Daily |
| Events | https://apnacoding.com/events | sitemap-static.xml | 0.9 | Daily |
| Jobs | https://apnacoding.com/jobs | sitemap-static.xml | 0.9 | Daily |
| Products | https://apnacoding.com/products | sitemap-static.xml | 0.9 | Daily |
| News | https://apnacoding.com/news | sitemap-static.xml | 0.9 | Daily |
| Communities | https://apnacoding.com/communities | sitemap-static.xml | 0.9 | Daily |

---

### 🎯 Important Pages (Priority: 0.7-0.8)

| Page | URL | Sitemap | Priority | Update Frequency |
|------|-----|---------|----------|------------------|
| Partnerships | https://apnacoding.com/partnerships | sitemap-static.xml | 0.8 | Weekly |
| Certificates | https://apnacoding.com/certificates | sitemap-static.xml | 0.8 | Weekly |
| Contact | https://apnacoding.com/contact | sitemap-static.xml | 0.8 | Monthly |
| Branding Kit | https://apnacoding.com/branding | sitemap-static.xml | 0.7 | Monthly |

---

### 👤 User Pages (Priority: 0.6)

| Page | URL | Sitemap | Priority | Update Frequency |
|------|-----|---------|----------|------------------|
| Profile | https://apnacoding.com/profile | sitemap-static.xml | 0.6 | Weekly |
| My Content | https://apnacoding.com/my-content | sitemap-static.xml | 0.6 | Weekly |

---

### ⚖️ Legal Pages (Priority: 0.5)

| Page | URL | Sitemap | Priority | Update Frequency |
|------|-----|---------|----------|------------------|
| Privacy Policy | https://apnacoding.com/privacy | sitemap-static.xml | 0.5 | Monthly |
| Terms of Service | https://apnacoding.com/terms | sitemap-static.xml | 0.5 | Monthly |

---

### 📰 Dynamic News Pages (Auto-Generated)

**URL Pattern**: `/news/{slug}`
**Sitemap**: sitemap-news.xml
**Priority**: 0.7-0.9 (featured articles get 0.9)
**Update Frequency**: Weekly

**Example URLs**:
- https://apnacoding.com/news/web3-development-guide
- https://apnacoding.com/news/top-hackathons-2026
- https://apnacoding.com/news/ethereum-layer-2-explained

**Auto-updates when**:
- You publish a new news article (`isPublished: true`)
- You edit article slug
- You feature/unfeature articles

**Current Count**: 0 (will show count when articles are published)

---

### 📅 Dynamic Event Pages (Auto-Generated)

**URL Pattern**: `/events/{id}`
**Sitemap**: sitemap-events.xml
**Priority**: 0.8
**Update Frequency**: Daily

**Example URLs**:
- https://apnacoding.com/events/k12345abc
- https://apnacoding.com/events/k67890def

**Auto-updates when**:
- Events are approved (`approvalStatus: "approved"`)
- Event details are modified

**Current Count**: 0 (will show count when events are approved)

---

### 🏆 Dynamic Hackathon Pages (Auto-Generated)

**URL Pattern**: `/hackathons/{slug}`
**Sitemap**: sitemap-hackathons.xml
**Priority**: 0.8-0.9 (featured hackathons get 0.9)
**Update Frequency**: Weekly

**Example URLs**:
- https://apnacoding.com/hackathons/ethindia-2026
- https://apnacoding.com/hackathons/build-on-base
- https://apnacoding.com/hackathons/web3-gaming-hackathon

**Auto-updates when**:
- Hackathons are approved (`status: "approved"`)
- Hackathon slug is changed
- Featured status changes

**Current Count**: 0 (will show count when hackathons are approved)

---

### 💼 Dynamic Job Pages (Auto-Generated)

**URL Pattern**: `/jobs/{id}`
**Sitemap**: sitemap-jobs.xml
**Priority**: 0.8
**Update Frequency**: Daily

**Example URLs**:
- https://apnacoding.com/jobs/k98765xyz
- https://apnacoding.com/jobs/k54321abc

**Auto-updates when**:
- Jobs are added (`isActive: true`)
- Jobs are deactivated

**Current Count**: 0 (will show count when jobs are added)

---

### 🛍️ Dynamic Product Pages (Auto-Generated)

**URL Pattern**: `/products/{slug}`
**Sitemap**: sitemap-products.xml
**Priority**: 0.8
**Update Frequency**: Weekly

**Example URLs**:
- https://apnacoding.com/products/web3-dev-course
- https://apnacoding.com/products/smart-contract-audit-tool
- https://apnacoding.com/products/nft-generator-kit

**Auto-updates when**:
- Products are published (`isPublished: true`)
- Product slug changes

**Current Count**: 0 (will show count when products are published)

---

### 👥 Dynamic Community Pages (Auto-Generated)

**URL Pattern**: `/community/{slug}` (note: singular "community")
**Sitemap**: sitemap-communities.xml
**Priority**: 0.7-0.9 (featured communities get 0.9)
**Update Frequency**: Monthly

**Example URLs**:
- https://apnacoding.com/community/web3-builders-india
- https://apnacoding.com/community/defi-enthusiasts
- https://apnacoding.com/community/nft-creators-hub

**Auto-updates when**:
- Communities are published (`isPublished: true`)
- Community slug changes
- Featured status changes

**Current Count**: 0 (will show count when communities are published)

---

## 🚫 Pages NOT in Sitemap (Intentionally Excluded)

These pages are blocked in `robots.txt` for security/privacy:

| Page | URL | Reason |
|------|-----|--------|
| Admin Dashboard | /admin | Private admin area |
| Admin Certificates | /admin/certificates | Private admin area |
| Issue Certificate | /issue-certificate | Internal tool |
| Verify Certificate | /verify/{number} | Dynamic verification (user-specific) |
| 404 Page | * (catch-all) | Error page |

**Robots.txt Configuration**:
```
Disallow: /admin/
Disallow: /issue-certificate
Disallow: /verify
```

---

## 📊 Sitemap Summary

### Main Sitemap Index
**URL**: https://apnacoding.com/sitemap.xml

Contains links to all category sitemaps:

| Sitemap File | URL | Content Type | Current Pages |
|--------------|-----|--------------|---------------|
| sitemap-static.xml | https://apnacoding.com/sitemap-static.xml | Static pages | 15 pages ✅ |
| sitemap-news.xml | https://apnacoding.com/sitemap-news.xml | News articles | 0 (ready) |
| sitemap-events.xml | https://apnacoding.com/sitemap-events.xml | Event details | 0 (ready) |
| sitemap-hackathons.xml | https://apnacoding.com/sitemap-hackathons.xml | Hackathon details | 0 (ready) |
| sitemap-jobs.xml | https://apnacoding.com/sitemap-jobs.xml | Job postings | 0 (ready) |
| sitemap-products.xml | https://apnacoding.com/sitemap-products.xml | Products | 0 (ready) |
| sitemap-communities.xml | https://apnacoding.com/sitemap-communities.xml | Communities | 0 (ready) |

**Total Current Pages**: 15 static pages
**Potential Total**: Unlimited (grows with content)

---

## 🔄 How Pages Get Added Automatically

### To Add News Pages
1. Go to Admin Dashboard
2. Create news article
3. Set `isPublished: true`
4. Page appears in `/sitemap-news.xml` within 30 minutes

### To Add Event Pages
1. Go to Admin Dashboard
2. Approve event
3. Set `approvalStatus: "approved"`
4. Page appears in `/sitemap-events.xml` within 30 minutes

### To Add Hackathon Pages
1. Go to Admin Dashboard
2. Approve hackathon
3. Set `status: "approved"`
4. Page appears in `/sitemap-hackathons.xml` within 30 minutes

### To Add Job Pages
1. Add job via admin or AI scraper
2. Set `isActive: true`
3. Page appears in `/sitemap-jobs.xml` within 30 minutes

### To Add Product Pages
1. Go to Admin Dashboard
2. Create product
3. Set `isPublished: true`
4. Page appears in `/sitemap-products.xml` within 30 minutes

### To Add Community Pages
1. Go to Admin Dashboard
2. Create community
3. Set `isPublished: true`
4. Page appears in `/sitemap-communities.xml` within 30 minutes

---

## 🎯 SEO Priority Explanation

### Priority 1.0 (Highest)
- **Homepage only** - Your main landing page

### Priority 0.9 (Very High)
- **Core listing pages** - Main content categories
- **Featured content** - Featured news/hackathons/communities

### Priority 0.8 (High)
- **Important pages** - Partnerships, Certificates, Contact
- **Content detail pages** - Individual events, hackathons, jobs, products

### Priority 0.7 (Medium-High)
- **Branding page**
- **Regular content** - Non-featured news/communities

### Priority 0.6 (Medium)
- **User pages** - Profile, My Content

### Priority 0.5 (Low)
- **Legal pages** - Privacy, Terms

---

## 📈 Current Status

### ✅ Completed
- [x] 15 static pages in sitemap
- [x] All listing pages included
- [x] Dynamic sitemaps ready for content
- [x] Proper priorities assigned
- [x] Update frequencies configured
- [x] Robots.txt blocking private pages
- [x] All pages using correct domain (apnacoding.com)

### 📝 Next Steps
1. **Deploy to Production**
   ```bash
   git add .
   git commit -m "Add all 15 static pages to sitemap"
   git push origin main
   ```

2. **Verify Sitemaps Work**
   - Test: https://apnacoding.com/sitemap.xml
   - Should show all 7 category sitemaps

3. **Submit to Google**
   - Submit `sitemap.xml` to Google Search Console
   - Google will discover all 7 category sitemaps
   - All 15 static pages will be crawled

4. **Add Content**
   - Publish news articles
   - Approve events and hackathons
   - Add jobs and products
   - Sitemaps update automatically!

---

## 🔍 How to View Your Sitemaps

### After Deployment

**Main Sitemap Index**:
```
https://apnacoding.com/sitemap.xml
```

**Static Pages** (15 pages):
```
https://apnacoding.com/sitemap-static.xml
```

**Dynamic Content** (auto-updates):
```
https://apnacoding.com/sitemap-news.xml
https://apnacoding.com/sitemap-events.xml
https://apnacoding.com/sitemap-hackathons.xml
https://apnacoding.com/sitemap-jobs.xml
https://apnacoding.com/sitemap-products.xml
https://apnacoding.com/sitemap-communities.xml
```

**Robots.txt**:
```
https://apnacoding.com/robots.txt
```

---

## 📋 Complete URL List

### Copy-Paste List for Testing

After deployment, test these URLs:

```
https://apnacoding.com/
https://apnacoding.com/hackathons
https://apnacoding.com/events
https://apnacoding.com/jobs
https://apnacoding.com/products
https://apnacoding.com/news
https://apnacoding.com/communities
https://apnacoding.com/partnerships
https://apnacoding.com/certificates
https://apnacoding.com/contact
https://apnacoding.com/branding
https://apnacoding.com/profile
https://apnacoding.com/my-content
https://apnacoding.com/privacy
https://apnacoding.com/terms
```

All 15 pages should load successfully!

---

## ✅ Summary

**Static Pages**: 15 pages ✅
**Dynamic Pages**: Unlimited (based on content) ✅
**Sitemaps Created**: 8 files (1 index + 7 categories) ✅
**Pages in Google**: Ready for indexing ✅
**Auto-Updates**: Enabled ✅

**Your complete sitemap system is ready to deploy!** 🚀

All 15 static pages + unlimited dynamic pages will be discoverable by Google when you push to production.
