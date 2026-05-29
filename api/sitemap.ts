import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yjgjfurrvyvhncjxqcre.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjQsImV4cCI6MjA5NDI2NTM2NH0.6n15TfLnuAfWCRF8oT2P0F5TooeiLHi3P79XpLF3o1I';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const siteUrl = 'https://apnacoding.com';

  const { type } = req.query || {};
  const sitemapType = type || 'index';

  res.setHeader('Content-Type', 'text/xml');

  try {
    // 1. Index Sitemap
    if (sitemapType === 'index') {
      const categories = ['static', 'hackathons', 'jobs', 'events', 'news', 'communities', 'products'];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories.map(cat => `
  <sitemap>
    <loc>${siteUrl}/sitemap-${cat}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
      return res.status(200).send(xml);
    }

    // 2. Static Pages Sitemap
    if (sitemapType === 'static') {
      const pages = [
        '', '/events', '/event-groups', '/hackathons', '/jobs', '/products', '/news', '/partnerships',
        '/branding', '/privacy', '/terms', '/communities', '/contact', '/services', '/launch-onchain',
        '/leaderboard', '/learn', '/referral'
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${siteUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
      return res.status(200).send(xml);
    }

    // 3. News Articles Sitemap
    if (sitemapType === 'news') {
      const { data: news } = await supabase
        .from('news')
        .select('slug, created_at, title, image, image_url');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${(news || []).map(n => `
  <url>
    <loc>${siteUrl}/news/${n.slug}</loc>
    <lastmod>${new Date(n.created_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    ${(n.image || n.image_url) ? `
    <image:image>
      <image:loc>${n.image || n.image_url}</image:loc>
      <image:title>${(n.title || 'News').replace(/[<>&"']/g, '')}</image:title>
    </image:image>` : ''}
  </url>`).join('')}
</urlset>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
      return res.status(200).send(xml);
    }

    // 4. Events Sitemap
    if (sitemapType === 'events') {
      const [
        { data: events },
        { data: eventGroups }
      ] = await Promise.all([
        supabase.from('events').select('id, slug, created_at, title, image, image_url'),
        supabase.from('event_groups').select('id, slug, created_at, title, image_url')
      ]);

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${(events || []).map(e => `
  <url>
    <loc>${siteUrl}/events/${e.slug || e.id}</loc>
    <lastmod>${new Date(e.created_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${(e.image || e.image_url) ? `
    <image:image>
      <image:loc>${e.image || e.image_url}</image:loc>
      <image:title>${(e.title || 'Event').replace(/[<>&"']/g, '')}</image:title>
    </image:image>` : ''}
  </url>`).join('')}
  ${(eventGroups || []).map(eg => `
  <url>
    <loc>${siteUrl}/event-groups/${eg.slug || eg.id}</loc>
    <lastmod>${new Date(eg.created_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    ${eg.image_url ? `
    <image:image>
      <image:loc>${eg.image_url}</image:loc>
      <image:title>${(eg.title || 'Event Group').replace(/[<>&"']/g, '')}</image:title>
    </image:image>` : ''}
  </url>`).join('')}
</urlset>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
      return res.status(200).send(xml);
    }

    // 5. Hackathons Sitemap
    if (sitemapType === 'hackathons') {
      const { data: hackathons } = await supabase
        .from('hackathons')
        .select('id, slug, created_at, title, image, banner_image')
        .eq('is_approved', true);

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${(hackathons || []).map(h => `
  <url>
    <loc>${siteUrl}/hackathons/${h.slug || h.id}</loc>
    <lastmod>${new Date(h.created_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${(h.image || h.banner_image) ? `
    <image:image>
      <image:loc>${h.image || h.banner_image}</image:loc>
      <image:title>${(h.title || 'Hackathon').replace(/[<>&"']/g, '')}</image:title>
    </image:image>` : ''}
  </url>`).join('')}
</urlset>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
      return res.status(200).send(xml);
    }

    // 6. Jobs Sitemap
    if (sitemapType === 'jobs') {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('slug, id, created_at')
        .eq('is_approved', true);

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${(jobs || []).map(j => `
  <url>
    <loc>${siteUrl}/jobs/${j.slug || j.id}</loc>
    <lastmod>${new Date(j.created_at || Date.now()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
      return res.status(200).send(xml);
    }

    // 7. Communities Sitemap
    if (sitemapType === 'communities') {
      const { data: communities } = await supabase
        .from('communities')
        .select('slug, updated_at')
        .eq('is_published', true);

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${(communities || []).map(c => `
  <url>
    <loc>${siteUrl}/community/${c.slug}</loc>
    <lastmod>${new Date(c.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
      return res.status(200).send(xml);
    }

    // 8. Products Sitemap
    if (sitemapType === 'products') {
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${(products || []).map(p => `
  <url>
    <loc>${siteUrl}/products/${p.slug}</loc>
    <lastmod>${new Date(p.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`.trim();

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
      return res.status(200).send(xml);
    }

    return res.status(400).send('Invalid sitemap type');

  } catch (error) {
    console.error('Unified sitemap error:', error);
    return res.status(500).send('Error rendering sitemap');
  }
}
