import { createClient } from '@supabase/supabase-js';

/**
 * Dynamic OG Preview Generator for Social Media Crawlers.
 * Fetches real-time data from Supabase and serves a minimal HTML page 
 * with accurate Open Graph and Twitter meta tags.
 */
export default async function handler(req: any, res: any) {
  const { path } = req.query;
  if (!path) return res.status(400).send('Path required');

  // Supabase Configuration (using fallbacks from existing sitemap code)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yjgjfurrvyvhncjxqcre.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjQsImV4cCI6MjA5NDI2NTM2NH0.6n15TfLnuAfWCRF8oT2P0F5TooeiLHi3P79XpLF3o1I';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const siteUrl = 'https://apnacoding.com';
  const defaultTitle = "Apna Coding - India's Premier Web3 Opportunity Layer";
  const defaultDesc = "Join India's fastest-growing Web3 & AI community. Discover hackathons, jobs, events, and build products. Learn blockchain, smart contracts, DeFi, NFTs & more.";
  const defaultImage = `${siteUrl}/logo_bg.png`;

  let title = defaultTitle;
  let description = defaultDesc;
  let image = defaultImage;

  try {
    // Parse path: /hackathons/my-slug -> parts = ['hackathons', 'my-slug']
    const parts = path.split('/').filter(Boolean);
    const type = parts[0];
    const slug = parts[1];

    if (slug) {
      if (type === 'hackathons') {
        const { data } = await supabase
          .from('hackathons')
          .select('*')
          .or(`slug.eq."${slug}",id.eq."${slug}"`)
          .single();
        
        if (data) {
          title = `${data.title} | Hackathon | Apna Coding`;
          description = data.short_description || data.tagline || data.description?.substring(0, 160) || defaultDesc;
          image = data.banner_image || data.image || data.poster_image || defaultImage;
        }
      } else if (type === 'events') {
        const { data } = await supabase
          .from('events')
          .select('*')
          .or(`slug.eq."${slug}",id.eq."${slug}"`)
          .single();
        
        if (data) {
          title = `${data.title} | Event | Apna Coding`;
          description = data.description?.substring(0, 160) || defaultDesc;
          image = data.image_url || data.banner_image || defaultImage;
        }
      } else if (type === 'jobs') {
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .or(`slug.eq."${slug}",id.eq."${slug}"`)
          .single();
        
        if (data) {
          title = `${data.title} at ${data.company} | Job | Apna Coding`;
          description = data.description?.substring(0, 160) || defaultDesc;
          image = data.image_url || defaultImage;
        }
      } else if (type === 'news') {
        const { data } = await supabase
          .from('news')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (data) {
          title = `${data.title} | News | Apna Coding`;
          description = data.excerpt || data.content?.replace(/<[^>]*>/g, '').substring(0, 160) || defaultDesc;
          image = data.cover_image || defaultImage;
        }
      } else if (type === 'products') {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (data) {
          title = `${data.title} | Product | Apna Coding`;
          description = data.description?.substring(0, 160) || defaultDesc;
          image = data.image_url || defaultImage;
        }
      } else if (type === 'community') {
        const { data } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (data) {
          title = `${data.name} | Community | Apna Coding`;
          description = data.description?.substring(0, 160) || defaultDesc;
          image = data.logo || defaultImage;
        }
      } else if (type === 'event-groups') {
        const { data } = await supabase
          .from('event_groups')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (data) {
          title = `${data.group_name} | Event Group | Apna Coding`;
          description = data.description?.substring(0, 160) || defaultDesc;
          image = data.banner_image || defaultImage;
        }
      } else if (type === 'verify') {
        const { data } = await supabase
          .from('certificates')
          .select('*')
          .eq('certificate_number', slug)
          .single();
        
        if (data) {
          title = `Verified: ${data.participant_name}'s Certificate | Apna Coding`;
          description = `Official certificate for ${data.event_name} (${data.certificate_type}). Achievement: ${data.achievement || 'N/A'}. Verified on Flow Blockchain.`;
          image = `${siteUrl}/logo_bg.png`; // Certificates usually don't have images in DB, using site logo
        }
      }
    }

    // Helper to sanitize strings for HTML attributes
    const escapeAttr = (str: string) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const safeTitle = escapeAttr(title);
    const safeDescription = escapeAttr(description);
    const safeImage = escapeAttr(image);
    const safeUrl = escapeAttr(`${siteUrl}${path}`);

    // Serve a minimal HTML shell with the correct metadata
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="${safeTitle}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${safeUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:site_name" content="Apna Coding">
  <meta property="og:locale" content="en_IN">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${safeUrl}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeImage}">
  <meta name="twitter:site" content="@apnacoding">
  <meta name="twitter:creator" content="@apnacoding">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${siteUrl}/logo.png">

  <!-- In case a human visits this URL directly, redirect them to the real page -->
  <script>
    window.location.href = "${escapeAttr(path)}";
  </script>
</head>
<body style="background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
  <div style="text-align: center;">
    <img src="${siteUrl}/logo.png" alt="Logo" style="width: 80px; margin-bottom: 20px;">
    <h1>${safeTitle}</h1>
    <p>Redirecting you to Apna Coding...</p>
    <p style="font-size: 0.8rem; color: #666;">If you are not redirected, <a href="${escapeAttr(path)}" style="color: #00ffff;">click here</a>.</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
    res.status(200).send(html);

  } catch (error) {
    console.error("OG Preview Error for path:", path, error);
    // On error, just return a basic shell that redirects
    res.status(200).send(`<!DOCTYPE html><html><head><script>window.location.href="${escapeAttr(path)}";</script></head><body></body></html>`);
  }
}
