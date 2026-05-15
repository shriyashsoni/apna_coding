import { Helmet } from "react-helmet-async";

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
  const siteTitle = "Apna Coding - Web3 Opportunity Layer";
  const defaultDescription =
    "India's Premier Web3 Opportunity Layer. Join hackathons, find jobs, build products, and connect with developers. Learn blockchain, smart contracts, DeFi, NFTs & more.";
  const defaultImage = "https://apnacoding.com/og-image.png";
  const siteUrl = "https://apnacoding.com";

  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
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

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywordString} />
      <meta name="author" content={author || "Apna Coding"} />
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph Meta Tags (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_IN" />

      {/* Article-specific Open Graph Tags */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}
      {type === "article" &&
        tags.map((tag, index) => (
          <meta property="article:tag" content={tag} key={index} />
        ))}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@apnacoding" />
      <meta name="twitter:creator" content="@apnacoding" />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="General" />

      {/* Mobile & PWA Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />
      <meta name="theme-color" content="#6366f1" />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "Article" : "WebSite",
          name: fullTitle,
          description: finalDescription,
          url: finalUrl,
          image: finalImage,
          ...(type === "article" && {
            author: {
              "@type": "Person",
              name: author || "Apna Coding",
            },
            datePublished: publishedTime,
            dateModified: modifiedTime,
          }),
          ...(type === "event" && {
            "@type": "Event",
            location: {
              "@type": "Place",
              name: location || "Online",
              address: location || "Online",
            },
            startDate: startDate || publishedTime,
            endDate: endDate || publishedTime,
            organizer: {
              "@type": "Organization",
              name: organization || "Apna Coding",
              url: siteUrl,
            },
          }),
          ...(type === "job" && {
            "@type": "JobPosting",
            title: title,
            description: finalDescription,
            datePosted: publishedTime,
            validThrough: endDate,
            employmentType: jobType || "FULL_TIME",
            hiringOrganization: {
              "@type": "Organization",
              name: organization || "Apna Coding",
              sameAs: siteUrl,
              logo: "https://apnacoding.com/logo.png",
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: location || "Remote",
                addressCountry: "IN",
              },
            },
            baseSalary: salary ? {
              "@type": "MonetaryAmount",
              currency: "INR",
              value: {
                "@type": "QuantitativeValue",
                value: salary,
                unitText: "YEAR",
              },
            } : undefined,
          }),
          ...(type === "website" && {
            publisher: {
              "@type": "Organization",
              name: siteTitle,
              logo: {
                "@type": "ImageObject",
                url: "https://apnacoding.com/logo.png",
              },
            },
          }),
        })}
      </script>
    </Helmet>
  );
}
