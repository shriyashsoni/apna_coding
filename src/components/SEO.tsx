import { Helmet } from 'react-helmet-async';
import { NextSeo } from './next-seo';
import { PRIVATE_PATH, SITE_URL, canonicalUrl, plainText, contentSchema, jsonLd } from '@/lib/seo';
interface SEOProps {
  title?: string; description?: string; keywords?: string[]; image?: string; url?: string;
  type?: 'website'|'article'|'product'|'event'|'job'; author?: string; publishedTime?: string;
  modifiedTime?: string; section?: string; tags?: string[]; location?: string; startDate?: string;
  endDate?: string; organization?: string; salary?: string; jobType?: string; noindex?: boolean;
}
export function SEO(props: SEOProps) {
  const noindex = props.noindex || PRIVATE_PATH.test(typeof window !== 'undefined' ? window.location.pathname : '');
  const title = props.title || 'Apna Coding - Web3 Opportunities';
  const description = plainText(props.description || 'Discover Web3 hackathons, jobs, events, news, products and developer communities.').slice(0,160);
  const url = canonicalUrl(props.url);
  const image = props.image || `${SITE_URL}/logo_bg.png`;
  const schema = contentSchema(props.type || 'website', {
    created_at:props.publishedTime, updated_at:props.modifiedTime, author:props.author,
    start_date:props.startDate, end_date:props.endDate, location:props.location, organizer_name:props.organization,
  },url,title,description,image);
  if(props.type === 'website' && url === SITE_URL + '/') schema['@type'] = 'WebSite';
  return <>
    <NextSeo title={title} titleTemplate="%s | Apna Coding" description={description}
      canonical={url} noindex={noindex} robotsProps={{maxImagePreview:'large'}}
      openGraph={{type:props.type === 'article'?'article':'website',title,description,url,siteName:'Apna Coding',images:[{url:image,alt:title}]}}
      twitter={{site:'@apnacoding',cardType:'summary_large_image'}} />
    <Helmet><script id="server-schema" type="application/ld+json">{jsonLd(noindex ? {} : schema)}</script></Helmet>
  </>;
}
