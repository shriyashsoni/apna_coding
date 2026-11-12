import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchPublicRecord, fetchPublicRecords, getMetadataForPath, METADATA_MAPPING, recordPath } from './utils/metadata-engine.js';
import { SITE_URL, PUBLIC_PAGES, PRIVATE_PATH, plainText, schemaDate, contentSchema, jsonLd } from '../src/lib/seo.js';
const esc = (v: unknown) => String(v || '').replace(/[<>&"']/g, c => ({'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;'}[c]!));
let shell: string;
function template() { return shell ||= readFileSync(join(process.cwd(), 'dist/index.html'), 'utf8'); }
/** Same HTML/content for visitors and search engines. React takes over the existing root. */
export default async function handler(req: any, res: any) {
  let path = '/' + String(req.query?.path || '').replace(/^\/+|\/+$/g, '');
  const [type, slug, extra] = path.split('/').filter(Boolean);
  let status = 200, title = 'Apna Coding', description = '', content = '', image = `${SITE_URL}/logo_bg.png`, schema: any;
  let noindex = PRIVATE_PATH.test(path);
  try {
    if (noindex) { title = 'Private page | Apna Coding'; }
    else if (PUBLIC_PAGES[path]) {
      [title, description] = PUBLIC_PAGES[path];
      const category = type === 'communities' ? 'community' : type;
      if (category && METADATA_MAPPING[category] && category !== 'event-groups') {
        const rows = await fetchPublicRecords(category);
        content = `<ul>${rows.map(row=>`<li><a href="${esc(recordPath(category,row))}">${esc(row.title || row.name)}</a><p>${esc(plainText(row.description || row.content).slice(0,300))}</p></li>`).join('')}</ul>`;
      } else content = `<nav>${Object.entries(PUBLIC_PAGES).filter(([p])=>p!==path).map(([p,[name]])=>`<a href="${p}">${esc(name)}</a>`).join(' | ')}</nav>`;
      schema = {'@context':'https://schema.org','@type':path === '/'?'WebSite':'CollectionPage',name:title,description,url:SITE_URL+path};
    } else if (type === 'event-groups' && slug && !extra) { noindex = true; title = 'Event group | Apna Coding';
    } else if (METADATA_MAPPING[type] && slug && !extra && type !== 'verify' && type !== 'event-groups') {
      const found = await fetchPublicRecord(type, slug);
      if (!found) { status = 404; noindex = true; title = 'Listing not found | Apna Coding'; }
      else {
        const {data,config} = found;
        const canonicalPath = recordPath(type,data);
        if (path !== canonicalPath) {
          res.setHeader('Location', SITE_URL + canonicalPath); return res.status(308).end();
        }
        const metadata = await getMetadataForPath(path, found);
        title = metadata.title; description = metadata.description; image = metadata.image;
        const full = plainText(data.description || data.content || data.full_description || data.about);
        content = `<p>${esc([data.company,data.location,data.type || data.category].filter(Boolean).join(' | '))}</p><p style="white-space:pre-line">${esc(full)}</p>`;
        for (const key of ['date','start_date','end_date']) if(data[key]) content += `<p>${esc(key.replace(/_/g,' '))}: ${esc(schemaDate(data[key],data.timezone === 'TBA') || data[key])}</p>`;
        const source = data.link || data.registration_link || data.external_url || data.website_url || data.website;
        if (source && /^https?:\/\//i.test(source)) content += `<p><a href="${esc(source)}" rel="noopener">Original source / application</a></p>`;
        content += `<p><a href="/${type === 'community'?'communities':type}">More ${esc(type)}</a></p>`;
        schema = contentSchema(type,data,SITE_URL+path,title,full,image);
      }
    } else { status = 404; noindex = true; title = 'Page not found | Apna Coding'; }
    const canonical = SITE_URL + path;
    const robots = noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
    const head = `<title data-server-seo="true">${esc(title)}</title><meta data-server-seo="true" name="description" content="${esc(description)}"><link data-server-seo="true" rel="canonical" href="${esc(canonical)}"><meta data-server-seo="true" name="robots" content="${robots}"><meta data-server-seo="true" name="googlebot" content="${robots}"><meta data-server-seo="true" property="og:title" content="${esc(title)}"><meta data-server-seo="true" property="og:description" content="${esc(description)}"><meta data-server-seo="true" property="og:url" content="${esc(canonical)}"><meta data-server-seo="true" property="og:image" content="${esc(image)}"><meta data-server-seo="true" property="og:type" content="website"><meta data-server-seo="true" name="twitter:card" content="summary_large_image"><meta data-server-seo="true" name="twitter:title" content="${esc(title)}"><meta data-server-seo="true" name="twitter:description" content="${esc(description)}"><meta data-server-seo="true" name="twitter:image" content="${esc(image)}">${schema?`<script data-server-seo="true" id="server-schema" type="application/ld+json">${jsonLd(schema)}</script>`:''}`;
    let html = template().replace(/<title[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name="(?:title|description|robots|googlebot|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi,'').replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,'').replace('</head>', head+'</head>');
    const fallback = `<main style="max-width:70rem;margin:4rem auto;padding:2rem;font-family:system-ui"><h1>${esc(title)}</h1><p>${esc(description)}</p>${content}</main>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', noindex ? 'no-store' : 'public, s-maxage=300');
    if(noindex) res.setHeader('X-Robots-Tag','noindex, follow');
    return res.status(status).send(html);
  } catch (error) {
    console.error('SEO page unavailable',error);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Retry-After','60');
    return res.status(503).send('Page temporarily unavailable. Please retry.');
  }
}
