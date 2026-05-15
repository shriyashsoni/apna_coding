import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yjgjfurrvyvhncjxqcre.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjQsImV4cCI6MjA5NDI2NTM2NH0.6n15TfLnuAfWCRF8oT2P0F5TooeiLHi3P79XpLF3o1I';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const siteUrl = 'https://apnacoding.com';

  try {
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
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
    res.write(xml);
    res.end();
  } catch (error) {
    res.status(500).send('Error');
  }
}
