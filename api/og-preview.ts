import { SITE_URL, contentSchema, jsonLd } from '../src/lib/seo.js';
import { getMetadataForPath } from './utils/metadata-engine.js';

/**
 * Helper to sanitize strings for HTML attributes
 */
const safeAttr = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Dynamic OG Preview & SEO Generator
 * Servers as a proxy for social media crawlers to provide rich, dynamic meta tags.
 */
export default async function handler(req: any, res: any) {
  const { path } = req.query;
  if (!path) return res.status(400).send('Path required');

  const siteUrl = SITE_URL;
  
  try {
    const metadata = await getMetadataForPath(path);
    
    // Use the actual image from the database (hackathon banner, event image, etc.)
    // Fallback to the default site banner only if no specific image is found.
    let finalOgImage = metadata.image && metadata.image.startsWith('http') 
      ? metadata.image 
      : `${siteUrl}/logo_bg.png`;

    // Some image hosts block hotlinking or are down. If the listing's own image is not
    // fetchable as an image, use the card generated from the listing's title instead.
    if (!(metadata as any).generated && (metadata as any).data && !finalOgImage.startsWith(siteUrl)) {
      let ok = false;
      try {
        const r = await fetch(finalOgImage, { headers: { 'user-agent': 'facebookexternalhit/1.1' }, signal: AbortSignal.timeout(3000) });
        ok = r.ok && (r.headers.get('content-type') || '').startsWith('image/') && !/svg|icon/.test(r.headers.get('content-type') || '');
        try { await r.body?.cancel(); } catch (_) {}
      } catch (_) { ok = false; }
      if (!ok) finalOgImage = `${siteUrl}/api/og-image?path=${encodeURIComponent(String(path))}`;
    }

    const jsonLdData = contentSchema(String(path).split('/').filter(Boolean)[0], metadata.data || {}, metadata.url, metadata.title, metadata.description, finalOgImage);
    const missing = !metadata.data;
    if (missing) res.setHeader('X-Robots-Tag', 'noindex, follow');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeAttr(metadata.title)}</title>
  <meta name="description" content="${safeAttr(metadata.description)}">
  <link rel="canonical" href="${safeAttr(metadata.url)}">
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="${safeAttr(metadata.title)}">
  <meta name="robots" content="${missing ? 'noindex, follow' : 'index, follow'}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${metadata.type === 'website' ? 'website' : 'article'}">
  <meta property="og:url" content="${safeAttr(metadata.url)}">
  <meta property="og:title" content="${safeAttr(metadata.title)}">
  <meta property="og:description" content="${safeAttr(metadata.description)}">
  <meta property="og:image" content="${safeAttr(finalOgImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Apna Coding">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${safeAttr(metadata.url)}">
  <meta name="twitter:title" content="${safeAttr(metadata.title)}">
  <meta name="twitter:description" content="${safeAttr(metadata.description)}">
  <meta name="twitter:image" content="${safeAttr(finalOgImage)}">
  <meta name="twitter:site" content="@apnacoding">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${siteUrl}/logo.png">

  <!-- Structured Data -->
  <script type="application/ld+json">
    ${jsonLd(jsonLdData)}
  </script>

  <!-- Fallback Redirect -->
  <script>
    window.location.href = "${safeAttr(path)}";
  </script>
</head>
<body style="background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center;">
  <img src="${siteUrl}/logo.png" alt="Logo" style="width: 100px; margin-bottom: 24px; border-radius: 50%;">
  <h1 style="font-size: 2.5rem; margin-bottom: 16px;">${safeAttr(metadata.title)}</h1>
  <p style="font-size: 1.2rem; color: #aaa; max-width: 600px; margin-bottom: 32px;">${safeAttr(metadata.description)}</p>
  <div style="padding: 12px 24px; background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.2); borderRadius: 8px; color: #00ffff;">
    Redirecting to Apna Coding...
  </div>
  <p style="margin-top: 40px; font-size: 0.9rem; color: #444;">
    If you are not redirected, <a href="${safeAttr(path)}" style="color: #00ffff;">click here</a>.
  </p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
    res.status(missing ? 404 : 200).send(html);

  } catch (error) {
    console.error("OG Preview Error:", error);
    res.status(200).send(`<!DOCTYPE html><html><head><script>window.location.href="${safeAttr(path)}";</script></head><body></body></html>`);
  }
}
