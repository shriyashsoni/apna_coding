import { 
  NextSeo, 
  ArticleJsonLd, 
  EventJsonLd, 
  JobPostingJsonLd, 
  ProductJsonLd, 
  WebSiteJsonLd 
} from "./next-seo";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product" | "event" | "job";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  // Event & Job specific fields
  location?: string;
  startDate?: string;
  endDate?: string;
  organization?: string;
  salary?: string;
  jobType?: string;
}

export function SEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  location,
  startDate,
  endDate,
  organization,
  salary,
  jobType,
}: SEOProps) {
  const siteTitle = "Apna Coding";
  const siteSlogan = "Web3 Opportunity Layer";
  const defaultDescription =
    "India's Premier Web3 Opportunity Layer. Join hackathons, find jobs, build products, and connect with developers. Learn blockchain, smart contracts, DeFi, NFTs & more.";
  const defaultImage = "https://apnacoding.com/og-image.png";
  const siteUrl = "https://apnacoding.com";

  const fullTitle = title ? `${title} | ${siteTitle} - ${siteSlogan}` : `${siteTitle} - ${siteSlogan}`;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalUrl = url ? `${siteUrl}${url}` : siteUrl;

  // Generate keyword string
  const defaultKeywords = [
    "web3",
    "blockchain",
    "ethereum",
    "smart contracts",
    "DeFi",
    "NFT",
    "hackathon",
    "coding",
    "developer community",
    "India",
    "Solidity",
    "Web3 jobs",
    "crypto jobs",
    "blockchain developer",
    "apna coding",
  ];
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];
  const keywordString = allKeywords.join(", ");

  // Map to NextSeo OpenGraph format
  const ogImages = [
    {
      url: finalImage,
      width: 1200,
      height: 630,
      alt: title || siteTitle,
      type: "image/png"
    }
  ];

  const openGraphData = {
    type,
    title: fullTitle,
    description: finalDescription,
    url: finalUrl,
    siteName: `${siteTitle} - ${siteSlogan}`,
    locale: "en_IN",
    images: ogImages,
    ...(type === "article" && {
      article: {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : [siteTitle],
        section: section || "Web3",
        tags: tags.length > 0 ? tags : ["Blockchain", "Web3"],
      }
    })
  };

  const twitterData = {
    handle: "@apnacoding",
    site: "@apnacoding",
    cardType: "summary_large_image" as const,
  };

  return (
    <>
      {/* 🚀 Render NextSeo Meta Tag Layer */}
      <NextSeo
        title={title}
        titleTemplate={`%s | ${siteTitle} - ${siteSlogan}`}
        defaultTitle={`${siteTitle} - ${siteSlogan}`}
        description={finalDescription}
        canonical={finalUrl}
        themeColor="#6366f1"
        openGraph={openGraphData}
        twitter={twitterData}
        additionalMetaTags={[
          { name: "keywords", content: keywordString },
          { name: "language", content: "English" },
          { name: "rating", content: "General" },
          { name: "mobile-web-app-capable", content: "yes" },
          { name: "apple-mobile-web-app-capable", content: "yes" },
          { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        ]}
      />

      {/* 📊 Render Structured Rich Snippets JSON-LD Schemas based on Content Type */}
      {type === "article" && (
        <ArticleJsonLd
          url={finalUrl}
          title={fullTitle}
          images={[finalImage]}
          datePublished={publishedTime || new Date().toISOString()}
          dateModified={modifiedTime || publishedTime || new Date().toISOString()}
          authorName={author || siteTitle}
          description={finalDescription}
        />
      )}

      {type === "event" && (
        <EventJsonLd
          name={title || siteTitle}
          startDate={startDate || publishedTime || new Date().toISOString()}
          endDate={endDate || startDate || publishedTime || new Date().toISOString()}
          location={{
            name: location || "Online",
            address: location || "Online",
            url: location === "Online" ? finalUrl : undefined,
          }}
          url={finalUrl}
          description={finalDescription}
          images={[finalImage]}
          organizerName={organization || siteTitle}
          organizerUrl={siteUrl}
        />
      )}

      {type === "job" && (
        <JobPostingJsonLd
          title={title || "Web3 Developer"}
          description={finalDescription}
          datePosted={publishedTime || new Date().toISOString()}
          validThrough={endDate}
          employmentType={jobType || "FULL_TIME"}
          hiringOrganizationName={organization || siteTitle}
          hiringOrganizationUrl={siteUrl}
          jobLocation={{
            addressLocality: location || "Remote",
            addressCountry: "IN",
          }}
          baseSalary={salary ? {
            currency: "INR",
            value: Number(salary) || 0,
          } : undefined}
          jobLocationType={location === "Remote" ? "TELECOMMUTE" : undefined}
        />
      )}

      {type === "product" && (
        <ProductJsonLd
          productName={title || "Apna Coding Product"}
          images={[finalImage]}
          description={finalDescription}
          brand={organization || siteTitle}
        />
      )}

      {type === "website" && (
        <WebSiteJsonLd
          url={finalUrl}
          description={finalDescription}
        />
      )}
    </>
  );
}
