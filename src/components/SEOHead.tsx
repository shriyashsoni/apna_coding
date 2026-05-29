import { NextSeo } from "./next-seo";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  structuredData?: any;
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  author,
  publishedTime,
  modifiedTime,
  keywords = [],
  structuredData,
  noindex = false,
}: SEOHeadProps) {
  const siteUrl = typeof window !== 'undefined'
    ? window.location.origin
    : "https://apnacoding.com";
  const siteName = "Apna Coding";
  const siteSlogan = "Web3 Opportunity Layer";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName} - ${siteSlogan}`;
  const canonicalUrl = canonical || `${siteUrl}${window.location.pathname}`;
  const imageUrl = ogImage || `${siteUrl}/og-image.png`;

  // Merge structured schemas if provided
  const baseWebsiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "description": "Learn Web3, find hackathons, events, and job opportunities in blockchain and crypto",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const baseOrgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": "Web3 learning platform for blockchain, crypto, and decentralized technologies",
    "sameAs": [
      "https://twitter.com/apnacoding",
      "https://github.com/apnacoding",
    ],
  };

  const schemas = [baseWebsiteSchema, baseOrgSchema];
  if (structuredData) {
    if (Array.isArray(structuredData)) {
      schemas.push(...structuredData);
    } else {
      schemas.push(structuredData);
    }
  }

  // Construct NextSeo props
  const openGraphData = {
    type: ogType,
    title: fullTitle,
    description: description,
    url: canonicalUrl,
    siteName: `${siteName} - ${siteSlogan}`,
    locale: "en_IN",
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title || siteName,
        type: "image/png"
      }
    ],
    ...(ogType === "article" && {
      article: {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : [siteName],
      }
    })
  };

  const twitterData = {
    handle: "@apnacoding",
    site: "@apnacoding",
    cardType: "summary_large_image" as const,
  };

  const additionalMetaTags = [
    { name: "language", content: "English" },
    { name: "rating", content: "General" },
    { name: "theme-color", content: "#000000" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  ];

  if (keywords.length > 0) {
    additionalMetaTags.push({ name: "keywords", content: keywords.join(", ") });
  }

  if (author) {
    additionalMetaTags.push({ name: "author", content: author });
  }

  return (
    <>
      <NextSeo
        title={title}
        titleTemplate={`%s | ${siteName} - ${siteSlogan}`}
        defaultTitle={`${siteName} - ${siteSlogan}`}
        description={description}
        canonical={canonicalUrl}
        noindex={noindex}
        nofollow={noindex}
        openGraph={openGraphData}
        twitter={twitterData}
        additionalMetaTags={additionalMetaTags}
      />

      {/* Render All JSON-LD Schemas */}
      {schemas.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </>
  );
}
