/**
 * SEO USAGE EXAMPLES
 *
 * This file shows how to add SEO to your existing pages.
 * Copy and paste these examples into your actual page files.
 */

import { SEOHead } from "@/components/SEOHead";
import {
  generateEventSchema,
  generateHackathonSchema,
  generateNewsArticleSchema,
  generateJobPostingSchema,
  generateBreadcrumbSchema,
} from "@/lib/structuredData";

// ============================================================================
// EXAMPLE 1: Event Detail Page
// ============================================================================

export function EventDetailPageExample({ event }: any) {
  // Generate structured data
  const eventSchema = generateEventSchema(event);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Events", url: "/events" },
    { name: event.title, url: `/events/${event.slug}` },
  ]);

  return (
    <>
      {/* Add SEO Head */}
      <SEOHead
        title={`${event.title} - Web3 Event`}
        description={event.description.substring(0, 160)}
        canonical={`/events/${event.slug}`}
        ogType="article"
        ogImage={event.image}
        publishedTime={new Date(event._creationTime).toISOString()}
        keywords={["web3", "blockchain", "event", event.title, event.location]}
        structuredData={[eventSchema, breadcrumbSchema]}
      />

      {/* Your existing page content */}
      <div>
        <h1>{event.title}</h1>
        <p>{event.description}</p>
        {/* ... rest of content */}
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 2: Hackathon Detail Page
// ============================================================================

export function HackathonDetailPageExample({ hackathon }: any) {
  const hackathonSchema = generateHackathonSchema(hackathon);

  return (
    <>
      <SEOHead
        title={`${hackathon.title || hackathon.name} - Web3 Hackathon`}
        description={hackathon.description.substring(0, 160)}
        canonical={`/hackathons/${hackathon.slug}`}
        ogType="article"
        ogImage={hackathon.logo || hackathon.image}
        publishedTime={new Date(hackathon._creationTime).toISOString()}
        keywords={["hackathon", "web3", "blockchain", "coding", hackathon.title]}
        structuredData={hackathonSchema}
      />

      <div>
        <h1>{hackathon.title || hackathon.name}</h1>
        <p>{hackathon.description}</p>
        {/* ... rest of content */}
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 3: News Article Page
// ============================================================================

export function NewsDetailPageExample({ article }: any) {
  const articleSchema = generateNewsArticleSchema(article);

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.excerpt || article.description}
        canonical={`/news/${article.slug}`}
        ogType="article"
        ogImage={article.coverImage}
        author="Apna Coding Editorial Team"
        publishedTime={new Date(article._creationTime).toISOString()}
        modifiedTime={article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined}
        keywords={article.tags || ["web3", "blockchain", "crypto", "news"]}
        structuredData={articleSchema}
      />

      <article>
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </>
  );
}

// ============================================================================
// EXAMPLE 4: Job Detail Page
// ============================================================================

export function JobDetailPageExample({ job }: any) {
  const jobSchema = generateJobPostingSchema(job);

  return (
    <>
      <SEOHead
        title={`${job.title} at ${job.company} - Web3 Job`}
        description={job.description.substring(0, 160)}
        canonical={`/jobs/${job._id}`}
        ogType="article"
        keywords={["job", "web3", "blockchain", "career", job.type, job.location]}
        structuredData={jobSchema}
      />

      <div>
        <h1>{job.title}</h1>
        <h2>{job.company}</h2>
        <p>{job.description}</p>
        {/* ... rest of content */}
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 5: Category/Listing Page (Events List)
// ============================================================================

export function EventsListPageExample() {
  return (
    <>
      <SEOHead
        title="Web3 Events & Conferences | Apna Coding"
        description="Discover upcoming Web3, blockchain, and cryptocurrency events worldwide. Find conferences, meetups, and workshops to expand your knowledge."
        canonical="/events"
        ogType="website"
        keywords={["web3 events", "blockchain conferences", "crypto meetups", "ethereum events"]}
      />

      <div>
        <h1>Web3 Events & Conferences</h1>
        <p>Discover upcoming events in the Web3 ecosystem</p>
        {/* Events list */}
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 6: Homepage
// ============================================================================

export function HomepageExample() {
  return (
    <>
      <SEOHead
        title="Apna Coding - Learn Web3, Blockchain & Find Opportunities"
        description="Your gateway to Web3 learning. Find hackathons, events, jobs, and news in blockchain, cryptocurrency, and decentralized technologies."
        canonical="/"
        ogType="website"
        keywords={[
          "web3",
          "blockchain",
          "cryptocurrency",
          "hackathons",
          "jobs",
          "events",
          "learning",
        ]}
      />

      <main>
        <h1>Welcome to Apna Coding</h1>
        {/* Homepage content */}
      </main>
    </>
  );
}

// ============================================================================
// QUICK REFERENCE: SEOHead Props
// ============================================================================

/*
interface SEOHeadProps {
  title: string;                    // Page title (required)
  description: string;              // Meta description (required)
  canonical?: string;               // Canonical URL (optional, auto-generated)
  ogType?: "website" | "article" | "product";  // Open Graph type
  ogImage?: string;                 // Social share image
  author?: string;                  // Content author
  publishedTime?: string;           // ISO 8601 date
  modifiedTime?: string;            // ISO 8601 date
  keywords?: string[];              // SEO keywords array
  structuredData?: any;             // Schema.org JSON-LD
  noindex?: boolean;                // Prevent indexing (default: false)
}
*/

// ============================================================================
// QUICK REFERENCE: Structured Data Functions
// ============================================================================

/*
// Events
generateEventSchema(event: {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  link?: string;
  organizer?: string;
  slug: string;
  image?: string;
  price?: string;
})

// Hackathons
generateHackathonSchema(hackathon: {
  title or name: string;
  description: string;
  startDate: string;
  endDate?: string;
  mode: "virtual" | "in-person" | "hybrid";
  location?: string;
  link?: string;
  organizer?: string;
  slug: string;
  logo or image?: string;
  prizes?: string;
})

// News Articles
generateNewsArticleSchema(article: {
  title: string;
  excerpt or description: string;
  coverImage?: string;
  _creationTime: number;
  updatedAt?: number;
  category?: string;
  tags?: string[];
  slug: string;
})

// Job Postings
generateJobPostingSchema(job: {
  title: string;
  description: string;
  company: string;
  location: string;
  type?: string;
  salary?: string;
  deadline?: string;
  _creationTime: number;
  _id: string;
})

// Breadcrumbs
generateBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>)
*/

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/*
1. Add SEOHead to every page
2. Generate appropriate structured data
3. Test sitemaps:
   - https://apnacoding.com/sitemap.xml
   - https://apnacoding.com/sitemap-events.xml
   - https://apnacoding.com/sitemap-hackathons.xml
   - https://apnacoding.com/sitemap-news.xml
   - https://apnacoding.com/sitemap-jobs.xml
4. Test robots.txt: https://apnacoding.com/robots.txt
5. Submit sitemap to Google Search Console
6. Use URL Inspection tool for immediate indexing
7. Monitor Index Coverage report

Expected indexing time: 24-48 hours (1-6 hours with Request Indexing)
*/
