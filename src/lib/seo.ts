/** Shared, conservative metadata. Never infer dates, pay, ratings or affiliations. */
export const SITE_URL = 'https://www.apnacoding.com';
export const PUBLIC_PAGES: Record<string, [string, string]> = {
  '/': ['Apna Coding - Web3 Opportunities', 'Discover Web3 hackathons, developer jobs, events, news, products and blockchain communities on Apna Coding.'],
  '/events': ['Web3 Events and Conferences', 'Explore published blockchain and Web3 events, dates, locations and registration details.'],
  '/event-groups': ['Web3 Event Groups and Side Events', 'Find Web3 event groups and their published side events.'],
  '/hackathons': ['Web3 and Blockchain Hackathons', 'Find Web3 hackathons, build competitions, schedules, prize information and registration details.'],
  '/jobs': ['Web3 and Blockchain Jobs', 'Explore developer and non-technical Web3 jobs with company, location and application details.'],
  '/news': ['Web3 and Blockchain News', 'Read published Web3 and blockchain news with links to the original sources.'],
  '/products': ['Web3 Products and Builder Projects', 'Explore published Web3 products and builder prototypes with project details and links.'],
  '/communities': ['Blockchain and Web3 Communities', 'Discover blockchain ecosystems and developer communities with their official links and resources.'],
  '/partnerships': ['Partnerships', 'Learn about working with Apna Coding and its Web3 developer community.'],
  '/branding-kit': ['Apna Coding Branding Kit', 'Find Apna Coding brand assets and branding information.'],
  '/privacy': ['Privacy Policy', 'Read the Apna Coding privacy policy.'],
  '/terms': ['Terms of Service', 'Read the Apna Coding terms of service.'],
  '/contact': ['Contact Apna Coding', 'Contact Apna Coding about the platform, events and collaboration.'],
  '/services': ['Apna Coding Services', 'Learn about Apna Coding services for Web3 builders and communities.'],
  '/launch-onchain': ['Launch Onchain', 'Explore the Apna Coding onchain launch service.'],
};
export const PRIVATE_PATH = /^\/(?:admin|profile|my-content|issue-certificate|certificates|verify|user|auth|social)(?:\/|$)/;
export function canonicalUrl(value?: string) {
  try { return SITE_URL + new URL(value || (typeof window !== 'undefined' ? window.location.pathname : '/'), SITE_URL).pathname.replace(/\/$/, '').replace(/^$/, '/'); }
  catch { return SITE_URL + '/'; }
}
export function plainText(value: unknown) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
export function schemaDate(value: unknown, dateOnly = false): string | undefined {
  if (!value) return undefined;
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(/^\d+$/.test(s) ? Number(s) : s);
  return Number.isNaN(d.getTime()) ? undefined : dateOnly ? d.toISOString().slice(0, 10) : d.toISOString();
}
export function contentSchema(type: string, data: any, url: string, title: string, description: string, image?: string) {
  const base: any = { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description: plainText(description), url };
  if (image) base.image = image;
  if (type === 'news' || type === 'article') {
    base['@type'] = 'Article'; base.headline = title;
    const date = schemaDate(data.created_at); if (date) base.datePublished = date;
    const modified = schemaDate(data.updated_at); if (modified) base.dateModified = modified;
    if (data.author) base.author = { '@type': data.author === 'Apna Coding' ? 'Organization' : 'Person', name: data.author };
    base.publisher = { '@type': 'Organization', name: 'Apna Coding', url: SITE_URL };
  } else if (['event','events','hackathons'].includes(type)) {
    const start = schemaDate(data.start_date || data.date, data.timezone === 'TBA');
    if (start && data.location && !/^(online|remote|virtual|tba)$/i.test(data.location)) {
      base['@type'] = 'Event'; base.startDate = start;
      const end = schemaDate(data.end_date, data.timezone === 'TBA'); if (end) base.endDate = end;
      base.location = { '@type': 'Place', name: data.location, address: data.location };
      const organizer = data.organizer_name || data.organized_by;
      if (organizer) base.organizer = { '@type': 'Organization', name: organizer };
    }
  } else if (type === 'product' || type === 'products') base['@type'] = 'Product';
  // Jobs lack country/eligibility and original posting-date fields. Use WebPage until
  // verified JobPosting-required data exists, rather than manufacture rich-result fields.
  return base;
}
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
