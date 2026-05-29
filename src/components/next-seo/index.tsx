import React from 'react';
import { Helmet } from 'react-helmet-async';

// ==========================================
// NextSeo Types
// ==========================================

export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface OpenGraphVideo {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface OpenGraphProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  gender?: string;
}

export interface OpenGraphBook {
  authors?: string[];
  isbn?: string;
  releaseDate?: string;
  tags?: string[];
}

export interface OpenGraphArticle {
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

export interface OpenGraph {
  url?: string;
  type?: string;
  title?: string;
  description?: string;
  images?: OpenGraphImage[];
  videos?: OpenGraphVideo[];
  locale?: string;
  siteName?: string;
  profile?: OpenGraphProfile;
  book?: OpenGraphBook;
  article?: OpenGraphArticle;
}

export interface Twitter {
  handle?: string;
  site?: string;
  cardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

export interface AdditionalMetaTag {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
}

export interface AdditionalLinkTag {
  rel: string;
  href: string;
  sizes?: string;
  type?: string;
  color?: string;
  media?: string;
}

export interface RobotsProps {
  nosnippet?: boolean;
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxVideoPreview?: number;
  noarchive?: boolean;
  noimageindex?: boolean;
  notranslate?: boolean;
  nositelinkssearchbox?: boolean;
}

export interface NextSeoProps {
  title?: string;
  titleTemplate?: string;
  defaultTitle?: string;
  noindex?: boolean;
  nofollow?: boolean;
  robotsProps?: RobotsProps;
  description?: string;
  canonical?: string;
  themeColor?: string;
  openGraph?: OpenGraph;
  twitter?: Twitter;
  facebook?: {
    appId: string;
  };
  additionalMetaTags?: AdditionalMetaTag[];
  additionalLinkTags?: AdditionalLinkTag[];
}

// ==========================================
// NextSeo Main Component
// ==========================================

export function NextSeo({
  title,
  titleTemplate,
  defaultTitle,
  noindex = false,
  nofollow = false,
  robotsProps,
  description,
  canonical,
  themeColor,
  openGraph,
  twitter,
  facebook,
  additionalMetaTags = [],
  additionalLinkTags = [],
}: NextSeoProps) {
  // Format the title
  let displayTitle = '';
  if (title) {
    if (titleTemplate) {
      displayTitle = titleTemplate.replace('%s', title);
    } else {
      displayTitle = title;
    }
  } else {
    displayTitle = defaultTitle || '';
  }

  // Format robots content
  let robotsContent = '';
  if (noindex && nofollow) {
    robotsContent = 'noindex, nofollow';
  } else if (noindex) {
    robotsContent = 'noindex, follow';
  } else if (nofollow) {
    robotsContent = 'index, nofollow';
  } else {
    robotsContent = 'index, follow';
  }

  if (robotsProps) {
    const parts = [robotsContent];
    if (robotsProps.nosnippet) parts.push('nosnippet');
    if (robotsProps.maxSnippet !== undefined) parts.push(`max-snippet:${robotsProps.maxSnippet}`);
    if (robotsProps.maxImagePreview) parts.push(`max-image-preview:${robotsProps.maxImagePreview}`);
    if (robotsProps.maxVideoPreview !== undefined) parts.push(`max-video-preview:${robotsProps.maxVideoPreview}`);
    if (robotsProps.noarchive) parts.push('noarchive');
    if (robotsProps.noimageindex) parts.push('noimageindex');
    if (robotsProps.notranslate) parts.push('notranslate');
    if (robotsProps.nositelinkssearchbox) parts.push('nositelinkssearchbox');
    robotsContent = parts.join(', ');
  }

  return (
    <Helmet>
      {/* Title */}
      {displayTitle && <title>{displayTitle}</title>}
      {displayTitle && <meta name="title" content={displayTitle} />}

      {/* Description */}
      {description && <meta name="description" content={description} />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* Theme Color */}
      {themeColor && <meta name="theme-color" content={themeColor} />}

      {/* Facebook App ID */}
      {facebook?.appId && <meta property="fb:app_id" content={facebook.appId} />}

      {/* Open Graph */}
      {openGraph && (
        <>
          {openGraph.type && <meta property="og:type" content={openGraph.type} />}
          {openGraph.title && <meta property="og:title" content={openGraph.title} />}
          {openGraph.description && <meta property="og:description" content={openGraph.description} />}
          {openGraph.url && <meta property="og:url" content={openGraph.url} />}
          {openGraph.siteName && <meta property="og:site_name" content={openGraph.siteName} />}
          {openGraph.locale && <meta property="og:locale" content={openGraph.locale} />}

          {/* Open Graph Images */}
          {openGraph.images &&
            openGraph.images.map((img, idx) => (
              <React.Fragment key={`og-img-${idx}`}>
                <meta property="og:image" content={img.url} />
                {img.width && <meta property="og:image:width" content={img.width.toString()} />}
                {img.height && <meta property="og:image:height" content={img.height.toString()} />}
                {img.alt && <meta property="og:image:alt" content={img.alt} />}
                {img.type && <meta property="og:image:type" content={img.type} />}
              </React.Fragment>
            ))}

          {/* Open Graph Videos */}
          {openGraph.videos &&
            openGraph.videos.map((vid, idx) => (
              <React.Fragment key={`og-vid-${idx}`}>
                <meta property="og:video" content={vid.url} />
                {vid.width && <meta property="og:video:width" content={vid.width.toString()} />}
                {vid.height && <meta property="og:video:height" content={vid.height.toString()} />}
                {vid.alt && <meta property="og:video:alt" content={vid.alt} />}
                {vid.type && <meta property="og:video:type" content={vid.type} />}
              </React.Fragment>
            ))}

          {/* Open Graph Profile */}
          {openGraph.type === 'profile' && openGraph.profile && (
            <>
              {openGraph.profile.firstName && <meta property="profile:first_name" content={openGraph.profile.firstName} />}
              {openGraph.profile.lastName && <meta property="profile:last_name" content={openGraph.profile.lastName} />}
              {openGraph.profile.username && <meta property="profile:username" content={openGraph.profile.username} />}
              {openGraph.profile.gender && <meta property="profile:gender" content={openGraph.profile.gender} />}
            </>
          )}

          {/* Open Graph Book */}
          {openGraph.type === 'book' && openGraph.book && (
            <>
              {openGraph.book.authors &&
                openGraph.book.authors.map((author, idx) => (
                  <meta key={`book-author-${idx}`} property="book:author" content={author} />
                ))}
              {openGraph.book.isbn && <meta property="book:isbn" content={openGraph.book.isbn} />}
              {openGraph.book.releaseDate && <meta property="book:release_date" content={openGraph.book.releaseDate} />}
              {openGraph.book.tags &&
                openGraph.book.tags.map((tag, idx) => (
                  <meta key={`book-tag-${idx}`} property="book:tag" content={tag} />
                ))}
            </>
          )}

          {/* Open Graph Article */}
          {openGraph.type === 'article' && openGraph.article && (
            <>
              {openGraph.article.publishedTime && <meta property="article:published_time" content={openGraph.article.publishedTime} />}
              {openGraph.article.modifiedTime && <meta property="article:modified_time" content={openGraph.article.modifiedTime} />}
              {openGraph.article.expirationTime && <meta property="article:expiration_time" content={openGraph.article.expirationTime} />}
              {openGraph.article.section && <meta property="article:section" content={openGraph.article.section} />}
              {openGraph.article.authors &&
                openGraph.article.authors.map((author, idx) => (
                  <meta key={`art-author-${idx}`} property="article:author" content={author} />
                ))}
              {openGraph.article.tags &&
                openGraph.article.tags.map((tag, idx) => (
                  <meta key={`art-tag-${idx}`} property="article:tag" content={tag} />
                ))}
            </>
          )}
        </>
      )}

      {/* Twitter Card */}
      {twitter && (
        <>
          {twitter.cardType && <meta name="twitter:card" content={twitter.cardType} />}
          {twitter.site && <meta name="twitter:site" content={twitter.site} />}
          {twitter.handle && <meta name="twitter:creator" content={twitter.handle} />}
          {displayTitle && <meta name="twitter:title" content={displayTitle} />}
          {description && <meta name="twitter:description" content={description} />}
          {openGraph?.images && openGraph.images.length > 0 && (
            <meta name="twitter:image" content={openGraph.images[0].url} />
          )}
        </>
      )}

      {/* Additional Meta Tags */}
      {additionalMetaTags.map((tag, idx) => (
        <meta
          key={`add-meta-${idx}`}
          name={tag.name}
          property={tag.property}
          content={tag.content}
          httpEquiv={tag.httpEquiv}
        />
      ))}

      {/* Additional Link Tags */}
      {additionalLinkTags.map((link, idx) => (
        <link
          key={`add-link-${idx}`}
          rel={link.rel}
          href={link.href}
          sizes={link.sizes}
          type={link.type}
          color={link.color}
          media={link.media}
        />
      ))}
    </Helmet>
  );
}

// ==========================================
// JSON-LD Components (Schema.org)
// ==========================================

interface JsonLdProps {
  type: string;
  data: Record<string, any>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLdData)}
      </script>
    </Helmet>
  );
}

// 1. Article Schema
interface ArticleJsonLdProps {
  url: string;
  title: string;
  images: string[];
  datePublished: string;
  dateModified?: string;
  authorName: string | string[];
  description: string;
  publisherName?: string;
  publisherLogo?: string;
}

export function ArticleJsonLd({
  url,
  title,
  images,
  datePublished,
  dateModified,
  authorName,
  description,
  publisherName = 'Apna Coding',
  publisherLogo = 'https://apnacoding.com/logo.png',
}: ArticleJsonLdProps) {
  const authors = Array.isArray(authorName)
    ? authorName.map((name) => ({ '@type': 'Person', name }))
    : { '@type': 'Person', name: authorName };

  return (
    <JsonLd
      type="Article"
      data={{
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        headline: title,
        image: images,
        datePublished,
        dateModified: dateModified || datePublished,
        author: authors,
        publisher: {
          '@type': 'Organization',
          name: publisherName,
          logo: {
            '@type': 'ImageObject',
            url: publisherLogo,
          },
        },
        description,
      }}
    />
  );
}

// 2. News Article Schema
export function NewsArticleJsonLd({
  url,
  title,
  images,
  datePublished,
  dateModified,
  authorName,
  description,
  publisherName = 'Apna Coding',
  publisherLogo = 'https://apnacoding.com/logo.png',
}: ArticleJsonLdProps) {
  const authors = Array.isArray(authorName)
    ? authorName.map((name) => ({ '@type': 'Person', name }))
    : { '@type': 'Person', name: authorName };

  return (
    <JsonLd
      type="NewsArticle"
      data={{
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        headline: title,
        image: images,
        datePublished,
        dateModified: dateModified || datePublished,
        author: authors,
        publisher: {
          '@type': 'Organization',
          name: publisherName,
          logo: {
            '@type': 'ImageObject',
            url: publisherLogo,
          },
        },
        description,
      }}
    />
  );
}

// 3. Breadcrumb Schema
interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

interface BreadcrumbJsonLdProps {
  itemListElements: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ itemListElements }: BreadcrumbJsonLdProps) {
  return (
    <JsonLd
      type="BreadcrumbList"
      data={{
        itemListElement: itemListElements.map((elem) => ({
          '@type': 'ListItem',
          position: elem.position,
          name: elem.name,
          item: elem.item,
        })),
      }}
    />
  );
}

// 4. Job Posting Schema
interface JobPostingJsonLdProps {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string | string[];
  hiringOrganizationName: string;
  hiringOrganizationUrl?: string;
  hiringOrganizationLogo?: string;
  jobLocation: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  baseSalary?: {
    currency: string;
    value: number | { min: number; max: number };
    unitText?: string;
  };
  jobLocationType?: string;
  applicantLocationRequirements?: string;
}

export function JobPostingJsonLd({
  title,
  description,
  datePosted,
  validThrough,
  employmentType = 'FULL_TIME',
  hiringOrganizationName,
  hiringOrganizationUrl,
  hiringOrganizationLogo,
  jobLocation,
  baseSalary,
  jobLocationType,
  applicantLocationRequirements,
}: JobPostingJsonLdProps) {
  const salaryData = baseSalary
    ? {
        '@type': 'MonetaryAmount',
        currency: baseSalary.currency,
        value: typeof baseSalary.value === 'number'
          ? {
              '@type': 'QuantitativeValue',
              value: baseSalary.value,
              unitText: baseSalary.unitText || 'YEAR',
            }
          : {
              '@type': 'QuantitativeValue',
              minValue: baseSalary.value.min,
              maxValue: baseSalary.value.max,
              unitText: baseSalary.unitText || 'YEAR',
            },
      }
    : undefined;

  const locData = jobLocationType === 'TELECOMMUTE'
    ? undefined
    : {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: jobLocation.streetAddress,
          addressLocality: jobLocation.addressLocality,
          addressRegion: jobLocation.addressRegion,
          postalCode: jobLocation.postalCode,
          addressCountry: jobLocation.addressCountry,
        },
      };

  return (
    <JsonLd
      type="JobPosting"
      data={{
        title,
        description,
        datePosted,
        validThrough,
        employmentType,
        hiringOrganization: {
          '@type': 'Organization',
          name: hiringOrganizationName,
          sameAs: hiringOrganizationUrl,
          logo: hiringOrganizationLogo,
        },
        jobLocation: locData,
        jobLocationType,
        applicantLocationRequirements: applicantLocationRequirements
          ? {
              '@type': 'Country',
              name: applicantLocationRequirements,
            }
          : undefined,
        baseSalary: salaryData,
      }}
    />
  );
}

// 5. Event Schema
interface EventLocation {
  name: string;
  address: string;
  url?: string;
}

interface EventOffers {
  price: string;
  priceCurrency: string;
  url?: string;
  availability?: string;
}

interface EventJsonLdProps {
  name: string;
  startDate: string;
  endDate: string;
  location: EventLocation;
  url: string;
  description: string;
  images?: string[];
  organizerName?: string;
  organizerUrl?: string;
  offers?: EventOffers;
}

export function EventJsonLd({
  name,
  startDate,
  endDate,
  location,
  url,
  description,
  images,
  organizerName = 'Apna Coding',
  organizerUrl = 'https://apnacoding.com',
  offers,
}: EventJsonLdProps) {
  const isOnline = location.url && location.name === 'Online';

  const locData = isOnline
    ? {
        '@type': 'VirtualLocation',
        url: location.url,
      }
    : {
        '@type': 'Place',
        name: location.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: location.address,
          addressCountry: 'IN',
        },
      };

  return (
    <JsonLd
      type="Event"
      data={{
        name,
        startDate,
        endDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: isOnline
          ? 'https://schema.org/OnlineEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
        location: locData,
        url,
        description,
        image: images,
        organizer: {
          '@type': 'Organization',
          name: organizerName,
          url: organizerUrl,
        },
        offers: offers
          ? {
              '@type': 'Offer',
              price: offers.price,
              priceCurrency: offers.priceCurrency,
              url: offers.url,
              availability: offers.availability || 'https://schema.org/InStock',
            }
          : undefined,
      }}
    />
  );
}

// 6. Product Schema
interface ProductOffer {
  price: string;
  priceCurrency: string;
  url?: string;
  availability?: string;
  priceValidUntil?: string;
}

interface ProductReview {
  author: string;
  datePublished?: string;
  reviewBody?: string;
  name?: string;
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
}

interface ProductJsonLdProps {
  productName: string;
  images: string[];
  description: string;
  sku?: string;
  gtin14?: string;
  mpn?: string;
  brand?: string;
  reviews?: ProductReview[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount?: number;
    bestRating?: number;
  };
  offers?: ProductOffer | ProductOffer[];
}

export function ProductJsonLd({
  productName,
  images,
  description,
  sku,
  gtin14,
  mpn,
  brand,
  reviews,
  aggregateRating,
  offers,
}: ProductJsonLdProps) {
  const ratingData = aggregateRating
    ? {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
      }
    : undefined;

  const reviewData = reviews
    ? reviews.map((rev) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: rev.author },
        datePublished: rev.datePublished,
        reviewBody: rev.reviewBody,
        name: rev.name,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rev.reviewRating.ratingValue,
          bestRating: rev.reviewRating.bestRating || 5,
          worstRating: rev.reviewRating.worstRating || 1,
        },
      }))
    : undefined;

  const offersArray = offers
    ? (Array.isArray(offers) ? offers : [offers]).map((off) => ({
        '@type': 'Offer',
        price: off.price,
        priceCurrency: off.priceCurrency,
        url: off.url,
        availability: off.availability || 'https://schema.org/InStock',
        priceValidUntil: off.priceValidUntil,
      }))
    : undefined;

  return (
    <JsonLd
      type="Product"
      data={{
        name: productName,
        image: images,
        description,
        sku,
        gtin14,
        mpn,
        brand: brand ? { '@type': 'Brand', name: brand } : undefined,
        aggregateRating: ratingData,
        review: reviewData,
        offers: offersArray,
      }}
    />
  );
}

// 7. WebSite Schema
interface WebSiteJsonLdProps {
  url: string;
  description: string;
  potentialAction?: Array<{
    target: string;
    queryInput: string;
  }>;
}

export function WebSiteJsonLd({ url, description, potentialAction }: WebSiteJsonLdProps) {
  const actions = potentialAction
    ? potentialAction.map((act) => ({
        '@type': 'SearchAction',
        target: act.target,
        'query-input': act.queryInput,
      }))
    : undefined;

  return (
    <JsonLd
      type="WebSite"
      data={{
        url,
        description,
        potentialAction: actions,
      }}
    />
  );
}

// 8. Logo Schema
interface LogoJsonLdProps {
  url: string;
  logo: string;
}

export function LogoJsonLd({ url, logo }: LogoJsonLdProps) {
  return (
    <JsonLd
      type="Organization"
      data={{
        url,
        logo,
      }}
    />
  );
}

// 9. Social Profile Schema
interface SocialProfileJsonLdProps {
  type: 'Person' | 'Organization';
  name: string;
  url: string;
  sameAs: string[];
}

export function SocialProfileJsonLd({ type, name, url, sameAs }: SocialProfileJsonLdProps) {
  return (
    <JsonLd
      type={type}
      data={{
        name,
        url,
        sameAs,
      }}
    />
  );
}

// 10. Course Schema
interface CourseJsonLdProps {
  courseName: string;
  description: string;
  providerName: string;
  providerUrl?: string;
}

export function CourseJsonLd({ courseName, description, providerName, providerUrl }: CourseJsonLdProps) {
  return (
    <JsonLd
      type="Course"
      data={{
        name: courseName,
        description,
        provider: {
          '@type': 'Organization',
          name: providerName,
          sameAs: providerUrl,
        },
      }}
    />
  );
}
