import { fetchPublicRecords, recordPath } from './utils/metadata-engine.js';
import { SITE_URL, PUBLIC_PAGES, schemaDate } from '../src/lib/seo.js';
const categories = ['static', 'hackathons', 'jobs', 'events', 'news', 'communities', 'products'];
const xml = (s: string) => s.replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[c]!));
export default async function handler(req: any, res: any) {
  const type = String(req.query?.type || 'index');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (type === 'index') {
      res.setHeader('Cache-Control', 'public, s-maxage=300');
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${categories.map(c=>`<sitemap><loc>${SITE_URL}/sitemap-${c}.xml</loc></sitemap>`).join('')}</sitemapindex>`);
    }
    if (!categories.includes(type)) return res.status(404).send('Sitemap not found');
    let urls: {path:string;modified?:string}[];
    if (type === 'static') urls = Object.keys(PUBLIC_PAGES).map(path=>({path}));
    else {
      const category = type === 'communities' ? 'community' : type;
      const rows = await fetchPublicRecords(category);
      urls = rows.map(row => ({ path: recordPath(category,row), modified: schemaDate(row.updated_at || row.created_at) }));
    }
    const body = urls.map(u=>`<url><loc>${xml(SITE_URL + u.path)}</loc>${u.modified ? `<lastmod>${xml(u.modified)}</lastmod>` : ''}</url>`).join('');
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
  } catch (error) {
    console.error('Sitemap source unavailable', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).send('Sitemap temporarily unavailable');
  }
}
