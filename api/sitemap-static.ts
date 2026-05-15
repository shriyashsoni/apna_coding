export default async function handler(req: any, res: any) {
  const siteUrl = 'https://apnacoding.com';
  const pages = [
    '',
    '/events',
    '/event-groups',
    '/hackathons',
    '/jobs',
    '/products',
    '/news',
    '/partnerships',
    '/branding',
    '/privacy',
    '/terms',
    '/communities',
    '/contact',
    '/services',
    '/launch-onchain',
    '/leaderboard',
    '/learn',
    '/referral'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${siteUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.write(xml);
  res.end();
}
