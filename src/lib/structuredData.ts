// Structured Data (Schema.org) helpers for SEO

// Use dynamic site URL based on environment
const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return "https://apnacoding.site";
};

const siteUrl = getSiteUrl();

export function generateEventSchema(event: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate || event.startDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": event.location === "Online"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    "location": event.location === "Online"
      ? {
          "@type": "VirtualLocation",
          "url": event.link || `${siteUrl}/events/${event.slug}`,
        }
      : {
          "@type": "Place",
          "name": event.location,
          "address": event.location,
        },
    "url": `${siteUrl}/events/${event.slug}`,
    "image": event.image || `${siteUrl}/og-event.png`,
    "organizer": {
      "@type": "Organization",
      "name": event.organizer || "Apna Coding",
      "url": siteUrl,
    },
    "offers": event.price
      ? {
          "@type": "Offer",
          "price": event.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": event.link || `${siteUrl}/events/${event.slug}`,
        }
      : undefined,
  };
}

export function generateHackathonSchema(hackathon: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": hackathon.title || hackathon.name,
    "description": hackathon.description,
    "startDate": hackathon.startDate,
    "endDate": hackathon.endDate || hackathon.startDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": hackathon.mode === "virtual"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : hackathon.mode === "hybrid"
      ? "https://schema.org/MixedEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    "location": hackathon.mode === "virtual" || hackathon.mode === "hybrid"
      ? {
          "@type": "VirtualLocation",
          "url": hackathon.link || `${siteUrl}/hackathons/${hackathon.slug}`,
        }
      : {
          "@type": "Place",
          "name": hackathon.location || "TBD",
          "address": hackathon.location || "TBD",
        },
    "url": `${siteUrl}/hackathons/${hackathon.slug}`,
    "image": hackathon.logo || hackathon.image || `${siteUrl}/og-hackathon.png`,
    "organizer": {
      "@type": "Organization",
      "name": hackathon.organizer || "Apna Coding",
      "url": siteUrl,
    },
    "offers": hackathon.prizes
      ? {
          "@type": "Offer",
          "description": `Prize Pool: ${hackathon.prizes}`,
          "url": hackathon.link || `${siteUrl}/hackathons/${hackathon.slug}`,
        }
      : undefined,
  };
}

export function generateNewsArticleSchema(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || article.description,
    "image": article.coverImage || `${siteUrl}/og-news.png`,
    "datePublished": new Date(article._creationTime).toISOString(),
    "dateModified": article.updatedAt
      ? new Date(article.updatedAt).toISOString()
      : new Date(article._creationTime).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Apna Coding",
      "url": siteUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Apna Coding",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/news/${article.slug}`,
    },
    "articleSection": article.category || "Technology",
    "keywords": article.tags ? article.tags.join(", ") : "web3, blockchain, crypto",
  };
}

export function generateJobPostingSchema(job: any) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": new Date(job._creationTime).toISOString(),
    "validThrough": job.deadline
      ? new Date(job.deadline).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": job.type?.toUpperCase() || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "sameAs": job.companyWebsite || siteUrl,
    },
    "jobLocation": job.location === "Remote"
      ? {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US",
          },
        }
      : {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location,
            "addressCountry": "US",
          },
        },
    "baseSalary": job.salary
      ? {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": {
            "@type": "QuantitativeValue",
            "value": job.salary,
            "unitText": "YEAR",
          },
        }
      : undefined,
    "url": `${siteUrl}/jobs/${job._id}`,
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "US",
    },
    "jobLocationType": job.location === "Remote" ? "TELECOMMUTE" : undefined,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteUrl}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}
