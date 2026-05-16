import { createClient } from '@supabase/supabase-js';

// Configuration for all dynamic modules
export interface MetadataConfig {
  table: string;
  titleField: string;
  descField: string | string[]; // Can check multiple fields
  imageField: string | string[]; // Can check multiple fields
  type: 'website' | 'article' | 'event' | 'product';
  pathPrefix: string;
  slugField: string;
}

export const METADATA_MAPPING: Record<string, MetadataConfig> = {
  hackathons: {
    table: 'hackathons',
    titleField: 'title',
    descField: ['short_description', 'tagline', 'description'],
    imageField: ['banner_image', 'image', 'poster_image'],
    type: 'event',
    pathPrefix: '/hackathons/',
    slugField: 'slug'
  },
  jobs: {
    table: 'jobs',
    titleField: 'title',
    descField: 'description',
    imageField: 'image_url',
    type: 'article',
    pathPrefix: '/jobs/',
    slugField: 'slug'
  },
  events: {
    table: 'events',
    titleField: 'title',
    descField: 'description',
    imageField: ['image_url', 'banner_image'],
    type: 'event',
    pathPrefix: '/events/',
    slugField: 'slug'
  },
  news: {
    table: 'news',
    titleField: 'title',
    descField: ['excerpt', 'content'],
    imageField: ['cover_image', 'image'],
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
    imageField: 'logo',
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
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getMetadataForPath(path: string) {
  const parts = path.split('/').filter(Boolean);
  const type = parts[0];
  const slug = parts[1];

  const siteUrl = 'https://apnacoding.com';
  const defaultTitle = "Apna Coding - India's Premier Web3 Opportunity Layer";
  const defaultDesc = "Join India's fastest-growing Web3 & AI community. Discover hackathons, jobs, events, and build products. Learn blockchain, smart contracts, DeFi, NFTs & more.";
  const defaultImage = `${siteUrl}/logo_bg.png`;

  if (!slug || !METADATA_MAPPING[type]) {
    return {
      title: defaultTitle,
      description: defaultDesc,
      image: defaultImage,
      url: `${siteUrl}${path}`,
      type: 'website'
    };
  }

  const config = METADATA_MAPPING[type];

  try {
    const { data } = await supabase
      .from(config.table)
      .select('*')
      .or(`${config.slugField}.eq."${slug}",id.eq."${slug}"`)
      .single();

    if (!data) throw new Error('Not found');

    const getVal = (field: string | string[]) => {
      if (Array.isArray(field)) {
        for (const f of field) {
          if (data[f]) return data[f];
        }
        return null;
      }
      return data[field];
    };

    let title = getVal(config.titleField);
    if (type === 'jobs' && data.company) title = `${title} at ${data.company}`;
    if (type === 'verify') title = `Verified Certificate: ${title}`;

    let description = getVal(config.descField) || defaultDesc;
    // Strip HTML if news content
    if (typeof description === 'string') {
      description = description.replace(/<[^>]*>/g, '').substring(0, 160);
    }

    let image = getVal(config.imageField) || defaultImage;

    return {
      title: `${title} | Apna Coding`,
      description,
      image,
      url: `${siteUrl}${path}`,
      type: config.type,
      data // Return raw data for image generation/structured data
    };
  } catch (error) {
    return {
      title: defaultTitle,
      description: defaultDesc,
      image: defaultImage,
      url: `${siteUrl}${path}`,
      type: 'website'
    };
  }
}
