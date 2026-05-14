import * as cheerio from 'cheerio';

/**
 * Frontend Scraper Utility
 * This ports the logic from the Supabase Edge Functions directly to the frontend.
 * It uses a CORS proxy to fetch HTML from external sites.
 */

const CORS_PROXY = "https://api.allorigins.win/get?url=";

export async function scrapeContentDirectly(url: string, contentType: 'jobs' | 'hackathons' | 'events' | 'news' | 'communities' | 'products') {
  try {
    // 1. Fetch HTML via CORS Proxy
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Failed to fetch content through proxy");
    
    const json = await response.json();
    const html = json.contents;
    
    // 2. Load Cheerio
    const $ = cheerio.load(html);

    // 3. Extraction logic (Ported from Edge Function)
    const extractMetadata = () => {
      const title = $('meta[property="og:title"]').attr('content') ||
                    $('meta[name="twitter:title"]').attr('content') ||
                    $('h1').first().text().trim() ||
                    $('title').text().trim() ||
                    "Untitled Content";

      const description = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') ||
                          $('meta[name="twitter:description"]').attr('content') ||
                          $('p').first().text().trim().substring(0, 500) ||
                          "No description available";

      const image = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    $('img[src*="logo"]').attr('src') ||
                    $('img[src*="banner"]').attr('src') ||
                    $('img').first().attr('src');

      const website = $('meta[property="og:url"]').attr('content') || url;

      return { title, description, image, website };
    };

    const metadata = extractMetadata();
    let result: any = { ...metadata };

    const extractSalary = (text: string) => {
      const salaryRegex = /(\$\d{1,3}(?:,\d{3})*(?:\s?-\s?\$\d{1,3}(?:,\d{3})*)|(?:\$\d{1,3}k(?:\s?-\s?\$\d{1,3}k))|(?:\$\d{1,3}(?:,\d{3})*))/i;
      const match = text.match(salaryRegex);
      return match ? match[0] : null;
    };

    if (contentType === 'jobs') {
      const salary = extractSalary(html);
      result = {
        title: metadata.title,
        company: $('meta[property="og:site_name"]').attr('content') || 
                 $('[class*="company"]').first().text().trim() || 
                 $('a[href*="company"]').first().text().trim() ||
                 "Unknown Company",
        description: metadata.description,
        location: $('[class*="location"]').first().text().trim() || 
                  $('[class*="remote"]').first().text().trim() || 
                  "Remote",
        type: html.toLowerCase().includes("part-time") ? "part-time" :
              html.toLowerCase().includes("contract") ? "contract" :
              html.toLowerCase().includes("internship") ? "internship" : "full-time",
        salary: salary,
        link: url || metadata.website
      };
    } else if (contentType === 'hackathons') {
      result = {
        name: metadata.title,
        description: metadata.description,
        prizes: $('[class*="prize"]').first().text().trim() || 
                $('[class*="reward"]').first().text().trim() || null,
        start_date: Date.now(),
        end_date: Date.now() + 7 * 24 * 60 * 60 * 1000,
        location: $('[class*="location"]').first().text().trim() || 
                  $('[class*="venue"]').first().text().trim() || "Online",
        external_url: url || metadata.website,
        image: metadata.image
      };
    } else if (contentType === 'events') {
      result = {
        title: metadata.title,
        description: metadata.description,
        date: Date.now() + 86400000,
        location: $('[class*="location"]').first().text().trim() || 
                  $('[class*="venue"]').first().text().trim() || "TBA",
        type: "Meetup",
        registration_link: url || metadata.website,
        image_url: metadata.image
      };
    } else if (contentType === 'news') {
      result = {
        title: metadata.title,
        content: $('article').html() || $('main').html() || html,
        excerpt: metadata.description,
        category: "News",
        cover_image: metadata.image
      };
    } else if (contentType === 'communities') {
      result = {
        name: metadata.title,
        description: metadata.description,
        logo: metadata.image,
        cover_image: metadata.image,
        website: url || metadata.website,
        twitter: $('a[href*="twitter.com"]').attr('href') || 
                 $('a[href*="x.com"]').attr('href') || null,
        discord: $('a[href*="discord.gg"]').attr('href') || 
                 $('a[href*="discord.com"]').attr('href') || null,
        partnership_type: "Community",
        partner_category: "Web3"
      };
    } else if (contentType === 'products') {
      result = {
        name: metadata.title,
        description: metadata.description,
        website_url: url || metadata.website,
        image_url: metadata.image,
        category: "Web3",
        status: "approved"
      };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Frontend Scraper Error:", error);
    return { success: false, error: error.message };
  }
}
