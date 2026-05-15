export default async function handler(req: any, res: any) {
  const siteUrl = 'https://apnacoding.com';
  const categories = [
    'static',
    'hackathons',
    'jobs',
    'events',
    'news',
    'communities',
    'products'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories.map(cat => `
  <sitemap>
    <loc>${siteUrl}/sitemap-${cat}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
  res.write(xml);
  res.end();
}
