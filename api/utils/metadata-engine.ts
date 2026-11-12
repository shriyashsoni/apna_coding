// Configuration for all dynamic modules
export interface MetadataConfig {
  table: string;
  titleField: string | string[];
  descField: string | string[]; // Can check multiple fields
  imageField: string | string[]; // Can check multiple fields
  type: 'website' | 'article' | 'event' | 'product';
  pathPrefix: string;
  slugField: string;
}

export const METADATA_MAPPING: Record<string, MetadataConfig> = {
  hackathons: {
    table: 'hackathons',
    titleField: ['title', 'name'],
    descField: ['short_description', 'tagline', 'description'],
    imageField: ['banner_image', 'image', 'image_url', 'poster_image'],
    type: 'event',
    pathPrefix: '/hackathons/',
    slugField: 'slug'
  },
  jobs: {
    table: 'jobs',
    titleField: 'title',
    descField: 'description',
    imageField: ['image_url', 'image'],
    type: 'article',
    pathPrefix: '/jobs/',
    slugField: 'slug'
  },
  events: {
    table: 'events',
    titleField: 'title',
    descField: 'description',
    imageField: ['image_url', 'image', 'banner_image'],
    type: 'event',
    pathPrefix: '/events/',
    slugField: 'slug'
  },
  news: {
    table: 'news',
    titleField: 'title',
    descField: ['excerpt', 'content'],
    imageField: ['cover_image', 'image_url', 'image'],
    type: 'article',
    pathPrefix: '/news/',
    slugField: 'slug'
  },
  products: {
    table: 'products',
    titleField: 'name',
    descField: 'description',
    imageField: 'image_url',
    type: 'product',
    pathPrefix: '/products/',
    slugField: 'slug'
  },
  community: {
    table: 'communities',
    titleField: 'name',
    descField: 'description',
    imageField: ['logo', 'image_url', 'cover_image'],
    type: 'website',
    pathPrefix: '/community/',
    slugField: 'slug'
  },
  verify: {
    table: 'certificates',
    titleField: 'participant_name',
    descField: 'event_name',
    imageField: '', 
    type: 'article',
    pathPrefix: '/verify/',
    slugField: 'certificate_number'
  },
  'event-groups': {
    table: 'event_groups',
    titleField: 'group_name',
    descField: 'description',
    imageField: 'banner_image',
    type: 'website',
    pathPrefix: '/event-groups/',
    slugField: 'slug'
  }
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yjgjfurrvyvhncjxqcre.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjQsImV4cCI6MjA5NDI2NTM2NH0.6n15TfLnuAfWCRF8oT2P0F5TooeiLHi3P79XpLF3o1I';

export { SITE_URL } from '../../src/lib/seo.js';
import { SITE_URL } from '../../src/lib/seo.js';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only records that are publicly listed may appear in a preview.
// Tables that carry publish flags must have them set to true.
export const PUBLISH_FILTERS: Record<string, string> = {
  hackathons: '&is_published=eq.true&is_approved=eq.true',
  jobs: '&is_published=eq.true&is_approved=eq.true',
  events: '&is_published=eq.true&is_approved=eq.true&is_cancelled=not.eq.true',
  news: '&is_published=eq.true&is_approved=eq.true',
  community: '&is_published=eq.true',
  products: '&status=eq.approved&is_approved=eq.true',
  'event-groups': '&is_published=eq.true'
};

const pick = (data: any, field: string | string[]) => {
  const fields = Array.isArray(field) ? field : [field];
  for (const f of fields) {
    if (f && typeof data[f] === 'string' && data[f].trim()) return data[f].trim();
  }
  return null;
};

/** Fetch one publicly listed record by slug or id. Returns null if missing/unpublished. */
export async function fetchPublicRecord(type: string, slug: string) {
  const config = METADATA_MAPPING[type];
  if (!Object.prototype.hasOwnProperty.call(METADATA_MAPPING,type) || !config || !slug || type === 'verify') return null;
  const isUuid = UUID_RE.test(slug);
  const key = isUuid ? 'id' : config.slugField;
  if (!isUuid && !/^[A-Za-z0-9._~%-]+$/.test(slug)) return null;
  let decoded: string;
  try { decoded = decodeURIComponent(slug); } catch { return null; }
  const url = `${supabaseUrl}/rest/v1/${config.table}?select=*&${key}=eq.${encodeURIComponent(decoded)}${PUBLISH_FILTERS[type] || ''}&limit=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(7000), headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } });
  if (!res.ok) throw new Error(`Public metadata unavailable (${res.status})`);
  const rows = await res.json();
  const data = Array.isArray(rows) ? rows[0] : null;
  if (!data) return null;
  if (type === 'products' && (data.status !== 'approved' || data.is_approved !== true)) return null;
  return { config, data };
}

/** Title, subtitle and kind label used by the generated share card. */
export function cardText(type: string, data: any, config: MetadataConfig) {
  const title = pick(data, config.titleField) || 'Apna Coding';
  const kinds: Record<string, string> = {
    hackathons: 'HACKATHON', jobs: 'JOB', events: 'EVENT', news: 'NEWS', community: 'COMMUNITY',
    products: 'PRODUCT', 'event-groups': 'EVENT GROUP', verify: 'CERTIFICATE'
  };
  let sub = '';
  if (type === 'jobs') sub = [data.company, data.location].filter(Boolean).join('  |  ');
  else if (type === 'events') sub = [data.location].filter(Boolean).join('');
  else if (type === 'hackathons') sub = [data.organized_by || data.organizer_name, data.prize_pool].filter(Boolean).join('  |  ');
  else if (type === 'news') sub = data.category || '';
  else if (type === 'community') sub = data.tagline || data.category || '';
  return { title, sub: String(sub || ''), kind: kinds[type] || 'LISTING' };
}

export async function getMetadataForPath(path: string, record?: any): Promise<any> {
  const parts = path.split('/').filter(Boolean);
  const type = parts[0];
  const slug = parts[1];

  const defaultTitle = "Apna Coding - India's Premier Web3 Opportunity Layer";
  const defaultDesc = "Join India's fastest-growing Web3 & AI community. Discover hackathons, jobs, events, and build products. Learn blockchain, smart contracts, DeFi, NFTs & more.";
  const defaultImage = `${SITE_URL}/logo_bg.png`;
  const fallback = {
    title: defaultTitle,
    description: defaultDesc,
    image: defaultImage,
    url: `${SITE_URL}${path}`,
    type: 'website'
  };

  if (!slug || !METADATA_MAPPING[type]) return fallback;

  try {
    const found = record || await fetchPublicRecord(type, slug);
    if (!found) return fallback;
    const { config, data } = found;

    let title = pick(data, config.titleField);
    if (!title) return fallback;
    if (type === 'jobs' && data.company) title = `${title} at ${data.company}`;
    if (type === 'verify') title = `Verified Certificate: ${title}`;

    let description = pick(data, config.descField) || defaultDesc;
    description = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 160);

    // Real listing image first; otherwise a card generated from this listing's own title.
    let image = pick(data, config.imageField);
    let generated = false;
    if (!image || !/^https?:\/\//i.test(image)) {
      image = `${SITE_URL}/api/og-image?path=${encodeURIComponent(`/${type}/${slug}`)}`;
      generated = true;
    }

    return {
      title: `${title} | Apna Coding`,
      description,
      image,
      generated,
      url: `${SITE_URL}${path}`,
      type: config.type,
      data
    };
  } catch (error) {
    return fallback;
  }
}

/** Paginated public-only reads, shared by discovery HTML and sitemaps. */
export async function fetchPublicRecords(type: string) {
  const config = METADATA_MAPPING[type];
  if (!config || !PUBLISH_FILTERS[type]) throw new Error('Unsupported public category');
  const result: any[] = [];
  for (let offset = 0; ; offset += 500) {
    const url = `${supabaseUrl}/rest/v1/${config.table}?select=*${PUBLISH_FILTERS[type]}&order=id.asc&limit=500&offset=${offset}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(7000), headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } });
    if (!response.ok) throw new Error(`Public listing lookup failed (${response.status})`);
    const rows = await response.json();
    result.push(...rows);
    if (rows.length < 500) break;
  }
  return result;
}
export const recordPath = (type: string, row: any) => `/${type}/${encodeURIComponent(row.slug || row.id)}`;
