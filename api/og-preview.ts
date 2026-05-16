import { getMetadataForPath } from './utils/metadata-engine';

/**
 * Dynamic OG Preview & SEO Generator
 * Servers as a proxy for social media crawlers to provide rich, dynamic meta tags.
 */
export default async function handler(req: any, res: any) {
  const { path } = req.query;
  if (!path) return res.status(400).send('Path required');

  const siteUrl = 'https://apnacoding.com';
  
  try {
    const metadata = await getMetadataForPath(path);
    
    // Construct dynamic OG image URL as a fallback or enhancement
    const dynamicImageUrl = new URL(`${siteUrl}/api/og-image`);
    dynamicImageUrl.searchParams.set('title', metadata.title.split(' | ')[0]);
    dynamicImageUrl.searchParams.set('subtitle', metadata.description);
    
    const parts = path.split('/').filter(Boolean);
    const label = parts[0]?.replace(/-/g, ' ').toUpperCase() || 'OPPORTUNITY';
    dynamicImageUrl.searchParams.set('label', label);

    // If the metadata has a valid absolute image URL, use it; otherwise, use our dynamic generator
    const hasValidImage = metadata.image && metadata.image.startsWith('http') && !metadata.image.includes('logo_bg.png');
    const finalOgImage = hasValidImage ? metadata.image : dynamicImageUrl.toString();

    // Prepare Structured Data (JSON-LD)
    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": metadata.title,
      "description": metadata.description,
      "url": metadata.url,
      "image": finalOgImage,
      "publisher": {
        "@type": "Organization",
        "name": "Apna Coding",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      }
    };

    // Specialize Structured Data based on type
    if (metadata.type === 'event') {
      jsonLd["@type"] = "Event";
      jsonLd["startDate"] = metadata.data?.start_date || metadata.data?.date || new Date().toISOString();
      jsonLd["location"] = {
        "@type": "Place",
        "name": metadata.data?.location || "Online",
        "address": metadata.data?.location || "Online"
      };
    } else if (metadata.type === 'product') {
      jsonLd["@type"] = "Product";
      jsonLd["brand"] = { "@type": "Brand", "name": "Apna Coding" };
    } else if (metadata.type === 'article') {
      jsonLd["@type"] = "Article";
      jsonLd["headline"] = metadata.title;
      jsonLd["datePublished"] = metadata.data?.created_at || new Date().toISOString();
    }

    const safeAttr = (str: string) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

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
  <meta name="robots" content="index, follow">

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
    ${JSON.stringify(jsonLd)}
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
    res.status(200).send(html);

  } catch (error) {
    console.error("OG Preview Error:", error);
    res.status(200).send(`<!DOCTYPE html><html><head><script>window.location.href="${safeAttr(path)}";</script></head><body></body></html>`);
  }
}
