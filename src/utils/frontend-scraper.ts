import * as cheerio from 'cheerio';

/**
 * Frontend Scraper Utility
 * Robust multi-proxy scraping with fallback logic.
 */

const PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/get?url=",
  "https://thingproxy.freeboard.io/fetch/"
];

async function fetchWithFallback(url: string) {
  let lastError = null;

  for (const proxy of PROXIES) {
    try {
      const targetUrl = proxy.includes('allorigins') 
        ? `${proxy}${encodeURIComponent(url)}` 
        : `${proxy}${url}`;
        
      const response = await fetch(targetUrl);
      if (!response.ok) continue;

      if (proxy.includes('allorigins')) {
        const json = await response.json();
        return json.contents;
      } else {
        return await response.text();
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All proxies failed to fetch content");
}

export async function scrapeContentDirectly(url: string, contentType: 'jobs' | 'hackathons' | 'events' | 'news' | 'communities' | 'products') {
  try {
    // 1. Fetch HTML via Multi-Proxy Fallback
    const html = await fetchWithFallback(url);
    
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
                          $('.description').first().text().trim() ||
                          $('[class*="desc"]').first().text().trim() ||
                          $('p').first().text().trim().substring(0, 500) ||
                          "No description available";

      const image = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    $('link[rel="apple-touch-icon"]').attr('href') ||
                    $('link[rel="icon"]').attr('href') ||
                    $('img[src*="logo"]').attr('src') ||
                    $('img[src*="banner"]').attr('src') ||
                    $('img[src*="brand"]').attr('src') ||
                    $('img').first().attr('src');

      const website = $('meta[property="og:url"]').attr('content') || url;

      // Fix relative URLs for images
      let finalImage = image;
      if (finalImage && !finalImage.startsWith('http')) {
        try {
          const baseUrl = new URL(url).origin;
          finalImage = new URL(finalImage, baseUrl).toString();
        } catch (e) {}
      }

      return { title, description, image: finalImage, website };
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
        registration_link: url || metadata.website,
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
