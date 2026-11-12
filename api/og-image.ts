import { ImageResponse } from '@vercel/og';
import { fetchPublicRecord, cardText, METADATA_MAPPING } from './utils/metadata-engine.js';

export const config = { runtime: 'edge' };

const el = (type: string, style: any, children?: any) => ({ type, props: { style: { display: 'flex', ...style }, children } });

/**
 * Share-card image for a listing that has no usable picture of its own.
 * Built only from the listing's own public title/company/location, looked up by path,
 * so it cannot be used to render arbitrary text and never shows unpublished listings.
 */
export default async function handler(req: Request) {
  const url = new URL(req.url);
  const parts = (url.searchParams.get('path') || '').split('/').filter(Boolean);
  const type = parts[0];
  const slug = parts[1];

  let title = 'Apna Coding';
  let sub = "India's Premier Web3 Opportunity Layer";
  let kind = 'APNA CODING';
  let found = false;
  try {
    if (type && slug && METADATA_MAPPING[type]) {
      const rec = await fetchPublicRecord(type, slug);
      if (rec) {
        const t = cardText(type, rec.data, rec.config);
        title = t.title; sub = t.sub; kind = t.kind; found = true;
      }
    }
  } catch (_) {}
  if (!found) {
    return new Response('Not found', { status: 404 });
  }
  if (title.length > 90) title = title.slice(0, 87) + '...';
  if (sub.length > 80) sub = sub.slice(0, 77) + '...';
  const size = title.length > 60 ? 54 : title.length > 35 ? 64 : 76;

  const node = el('div', {
    width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between',
    padding: '64px 72px', background: 'linear-gradient(135deg, #050505 0%, #14110a 100%)', color: '#ffffff',
    borderLeft: '16px solid #d4a017'
  }, [
    el('div', { alignItems: 'center', justifyContent: 'space-between' }, [
      el('div', { fontSize: 28, fontWeight: 700, color: '#d4a017', letterSpacing: 4 }, kind),
      el('div', { fontSize: 28, color: '#8a8a8a' }, 'apnacoding.com')
    ]),
    el('div', { flexDirection: 'column' }, [
      el('div', { fontSize: size, fontWeight: 700, lineHeight: 1.12, color: '#ffffff' }, title),
      sub ? el('div', { fontSize: 34, color: '#c9c9c9', marginTop: 28 }, sub) : el('div', {}, '')
    ]),
    el('div', { alignItems: 'center', fontSize: 30, fontWeight: 700, color: '#d4a017' }, 'APNA CODING')
  ]);

  return new ImageResponse(node as any, {
    width: 1200,
    height: 630,
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' }
  });
}
