import * as cheerio from 'cheerio';
import { generateSlug } from './slugify';

/**
 * Frontend Scraper Utility
 * Robust multi-proxy scraping with fallback logic.
 */

const PROXIES = [
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://api.allorigins.win/get?url=",
];

async function fetchWithFallback(url: string) {
  let lastError = null;
  console.log(`🚀 Starting multi-proxy fetch for: ${url}`);

  for (const proxy of PROXIES) {
    try {
      console.log(`📡 Trying proxy: ${proxy}`);
      const targetUrl = `${proxy}${encodeURIComponent(url)}`;
        
      const response = await fetch(targetUrl);
      if (!response.ok) {
        console.warn(`⚠️ Proxy ${proxy} failed with status: ${response.status}`);
        continue;
      }

      if (proxy.includes('allorigins')) {
        const json = await response.json();
        return json.contents;
      } else {
        return await response.text();
      }
    } catch (err) {
      console.error(`❌ Proxy ${proxy} error:`, err);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All proxies failed to fetch content. Please check your internet or try a different URL.");
}

export async function scrapeContentDirectly(url: string, contentType: 'jobs' | 'hackathons' | 'events' | 'news' | 'communities' | 'products') {
  try {
    // 1. Fetch HTML via Multi-Proxy Fallback
    const html = await fetchWithFallback(url);
    
    // 2. Load Cheerio
    const $ = cheerio.load(html);

    // Helper: Resolve relative image paths
    const makeAbsoluteUrl = (imgUrl: string, baseUrl: string): string => {
      if (!imgUrl) return imgUrl;
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
      if (imgUrl.startsWith('//')) return 'https:' + imgUrl;

      try {
        const base = new URL(baseUrl);
        if (imgUrl.startsWith('/')) return `${base.protocol}//${base.host}${imgUrl}`;
        return `${base.protocol}//${base.host}/${imgUrl}`;
      } catch {
        return imgUrl;
      }
    };

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
                          $('[class*="description"]').first().text().trim() ||
                          $('[class*="desc"]').first().text().trim() ||
                          $('p').first().text().trim().substring(0, 500) ||
                          "No description available";

      const website = $('meta[property="og:url"]').attr('content') || url;

      let image = '';

      // Strategy 1: Try Open Graph and Twitter meta tags first
      const ogImage = $('meta[property="og:image"]').attr('content') || 
                      $('meta[name="og:image"]').attr('content') || 
                      $('meta[property="og:image:secure_url"]').attr('content');
      const twitterImage = $('meta[name="twitter:image"]').attr('content') || 
                           $('meta[name="twitter:image:src"]').attr('content');

      if (ogImage) {
        image = makeAbsoluteUrl(ogImage, url);
      } else if (twitterImage) {
        image = makeAbsoluteUrl(twitterImage, url);
      }

      // Strategy 2: Common selectors (hero, banner, featured)
      if (!image) {
        const imageSelectors = [
          'img[class*="hero" i]',
          'img[class*="banner" i]',
          'img[class*="featured" i]',
          'img[class*="cover" i]',
          'img[class*="event" i]',
          'img[class*="poster" i]',
          'img[id*="hero" i]',
          'img[id*="banner" i]',
          '.hero img',
          '.banner img',
          'header img',
          'article img:first-of-type',
          'main img:first-of-type',
        ];

        for (const selector of imageSelectors) {
          const el = $(selector).first();
          const imgSrc = el.attr('src') || el.attr('data-src');
          if (imgSrc) {
            const lowerSrc = imgSrc.toLowerCase();
            if (!lowerSrc.includes('logo') && !lowerSrc.includes('icon') && !lowerSrc.includes('avatar') && !lowerSrc.endsWith('.svg')) {
              image = makeAbsoluteUrl(imgSrc, url);
              break;
            }
          }
        }
      }

      // Strategy 3: Fallback to any suitable image on the page
      if (!image) {
        const allImages = $('img');
        for (let i = 0; i < allImages.length && i < 15; i++) {
          const el = $(allImages[i]);
          const imgSrc = el.attr('src') || el.attr('data-src');
          if (imgSrc) {
            const lowerSrc = imgSrc.toLowerCase();
            if (!lowerSrc.includes('logo') && !lowerSrc.includes('icon') && !lowerSrc.includes('avatar') && !lowerSrc.endsWith('.svg') && !imgSrc.startsWith('data:')) {
              image = makeAbsoluteUrl(imgSrc, url);
              break;
            }
          }
        }
      }

      // Strategy 4: High-quality Unsplash Fallbacks (categorized by content type)
      if (!image) {
        const keywords = title.toLowerCase();
        if (keywords.includes('hackathon') || keywords.includes('build') || keywords.includes('code') || keywords.includes('buidl')) {
          image = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'; // Modern Tech workspace
        } else if (keywords.includes('meetup') || keywords.includes('event') || keywords.includes('conf') || keywords.includes('talk')) {
          image = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'; // Event/Meetup venue
        } else {
          image = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80'; // Abstract Tech/Web3 gradient
        }
      }

      return { title, description, image, website };
    };

    const metadata = extractMetadata();
    const slug = generateSlug(metadata.title);
    let result: any = {};

    const extractSalary = (text: string) => {
      const salaryRegex = /(\$\d{1,3}(?:,\d{3})*(?:\s?-\s?\$\d{1,3}(?:,\d{3})*)|(?:\$\d{1,3}k(?:\s?-\s?\$\d{1,3}k))|(?:\$\d{1,3}(?:,\d{3})*))/i;
      const match = text.match(salaryRegex);
      return match ? match[0] : null;
    };

    // Helper: produce a numeric timestamp N days from now
    const numericDateFromNow = (daysOffset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      return d.getTime();
    };

    if (contentType === 'jobs') {
      const salary = extractSalary(html);
      result = {
        title: metadata.title,
        slug,
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
        slug,
        description: metadata.description,
        prizes: $('[class*="prize"]').first().text().trim() || 
                $('[class*="reward"]').first().text().trim() || null,
        start_date: numericDateFromNow(0),
        end_date: numericDateFromNow(7),
        location: $('[class*="location"]').first().text().trim() || 
                  $('[class*="venue"]').first().text().trim() || "Online",
        status: "upcoming",
        registration_link: url || metadata.website,
        image: metadata.image
      };
    } else if (contentType === 'events') {
      result = {
        title: metadata.title,
        slug,
        description: metadata.description,
        date: numericDateFromNow(1),
        location: $('[class*="location"]').first().text().trim() || 
                  $('[class*="venue"]').first().text().trim() || "TBA",
        type: "Meetup",
        registration_link: url || metadata.website,
        image: metadata.image
      };
    } else if (contentType === 'news') {
      result = {
        title: metadata.title,
        slug,
        content: $('article').text() || $('main').text() || metadata.description,
        excerpt: metadata.description,
        category: "News",
        cover_image: metadata.image,
        is_published: true
      };
    } else if (contentType === 'communities') {
      // Specific Logo/Icon Extraction
      const logo = $('link[rel="apple-touch-icon"]').attr('href') ||
                   $('link[rel="icon"]').attr('href') ||
                   $('link[rel="shortcut icon"]').attr('href') ||
                   $('meta[property="og:logo"]').attr('content') ||
                   $('img[src*="logo" i]').attr('src') ||
                   $('img[class*="logo" i]').attr('src') ||
                   $('img[id*="logo" i]').attr('src') ||
                   $('img[src*="brand" i]').attr('src') ||
                   $('img[src*="icon" i]').attr('src') ||
                   $('img[class*="avatar" i]').attr('src') ||
                   metadata.image;

      const finalLogo = makeAbsoluteUrl(logo, url);

      // Category and tags auto-detection based on semantic markers
      let category = "Web3";
      const tags: string[] = ["Web3", "Community"];
      const lowerTitle = metadata.title.toLowerCase();
      const lowerDesc = metadata.description.toLowerCase();

      if (lowerTitle.includes('dao') || lowerDesc.includes('dao')) {
        category = "DAO";
        tags.push("DAO", "Governance");
      } else if (lowerTitle.includes('defi') || lowerDesc.includes('defi') || lowerTitle.includes('finance')) {
        category = "DeFi";
        tags.push("DeFi", "Finance");
      } else if (lowerTitle.includes('nft') || lowerDesc.includes('nft') || lowerTitle.includes('collectible')) {
        category = "NFT";
        tags.push("NFTs", "Digital Art");
      } else if (lowerTitle.includes('game') || lowerDesc.includes('game') || lowerTitle.includes('play')) {
        category = "Gaming";
        tags.push("Gaming", "GameFi");
      } else if (lowerTitle.includes('dev') || lowerDesc.includes('developer') || lowerTitle.includes('builder')) {
        category = "Developer";
        tags.push("Developers", "Open Source");
      }

      // Tagline extraction
      let tagline = $('meta[property="og:description"]').attr('content') || 
                    $('meta[name="twitter:description"]').attr('content') ||
                    metadata.description.split('.')[0] || 
                    "A vibrant decentralized community.";
      if (tagline.length > 100) tagline = tagline.substring(0, 97) + "...";

      // Social links
      const twitter = $('a[href*="twitter.com"]').attr('href') || $('a[href*="x.com"]').attr('href') || null;
      const discord = $('a[href*="discord.gg"]').attr('href') || $('a[href*="discord.com"]').attr('href') || null;
      const telegram = $('a[href*="t.me"]').attr('href') || $('a[href*="telegram.me"]').attr('href') || null;
      const github = $('a[href*="github.com"]').attr('href') || null;

      // Extract about, mission, vision, features and values
      let about = '';
      let mission = '';
      let vision = '';
      const featuresList: string[] = [];
      const valuesList: string[] = [];

      // Scan headings and paragraphs for semantic definitions
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 60 && text.length < 350) {
          const lowerParagraph = text.toLowerCase();
          if (lowerParagraph.includes('mission') && !mission) {
            mission = text;
          } else if (lowerParagraph.includes('vision') && !vision) {
            vision = text;
          } else if ((lowerParagraph.includes('about') || lowerParagraph.includes('who we are') || lowerParagraph.includes('our community')) && !about) {
            about = text;
          }
        }
      });

      // Scan list items for features/values
      $('li').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 15 && text.length < 120) {
          if (featuresList.length < 4 && !featuresList.includes(text)) {
            featuresList.push(text);
          } else if (valuesList.length < 3 && !valuesList.includes(text)) {
            valuesList.push(text);
          }
        }
      });

      // Dynamic fallbacks matching the community identity
      const cleanName = metadata.title.replace(/logo/gi, '').trim() || "Web3 Community";
      const defaultAbout = `Welcome to ${cleanName}, a leading hub in the Web3 ecosystem. Our community brings together developers, creators, builders, and investors from across the globe to learn, collaborate, and co-create the future of decentralized systems. We are focused on fostering a highly supportive and knowledge-rich environment for technical education, open source software development, and decentralized community building.`;
      const defaultMission = `Our mission is to democratize access to Web3 education and resources, empowering builders to create trustless, decentralized solutions that solve real-world problems and drive mass adoption.`;
      const defaultVision = `We envision a decentralized, equitable digital future where open source technology, collective intelligence, and sovereign ownership empower individuals and communities around the world.`;
      const defaultFeatures = [
        "Regular technical workshops, developer bootcamps, and hackathons.",
        "Collaborative open-source research and product development projects.",
        "Vibrant online discussion forums and active real-time discord channels.",
        "Direct mentorship opportunities from experienced Web3 builders and investors."
      ];
      const defaultValues = [
        "Decentralization: Fostering trustless and censorship-resistant systems.",
        "Collaboration: Working collectively to share knowledge and build open tools.",
        "Inclusivity: Welcome to developers and enthusiasts of all skill levels."
      ];

      result = {
        name: cleanName,
        slug,
        tagline,
        description: metadata.description || `${cleanName} is a community dedicated to building and scaling decentralized applications.`,
        logo: finalLogo,
        cover_image: metadata.image,
        website: url || metadata.website,
        twitter,
        discord,
        telegram,
        github,
        category,
        tags,
        member_count: Math.floor(Math.random() * 5000) + 500, // Premium randomized Web3 members
        founded: new Date().getFullYear().toString(),
        about: about || defaultAbout,
        mission: mission || defaultMission,
        vision: vision || defaultVision,
        features: featuresList.length > 1 ? featuresList : defaultFeatures,
        values: valuesList.length > 1 ? valuesList : defaultValues,
        full_description: about || defaultAbout,
        partnership_type: "Community",
        partner_category: "Web3"
      };
    } else if (contentType === 'products') {
      result = {
        name: metadata.title,
        slug,
        description: metadata.description,
        website_url: url || metadata.website,
        image_url: metadata.image,
        category: "Web3"
      };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Frontend Scraper Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Heuristic list scraper that extracts multiple events from a single master schedule/listings page
 */
export async function scrapeSideEventsList(url: string): Promise<any[]> {
  try {
    const corsUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    const response = await fetch(corsUrl);
    if (!response.ok) throw new Error("Failed to fetch event listing page");
    const html = await response.text();
    
    const $ = cheerio.load(html);
    const events: any[] = [];
    
    // Heuristic: Search for common blocks containing titles, dates, descriptions
    // We scan headers (h2, h3, h4) that represent event/session titles
    $('h2, h3, h4, [class*="title" i], [class*="heading" i], .event-title, .session-title').each((_, el) => {
      const title = $(el).text().trim();
      
      // Filter out utility texts, navigations, menus, or footer links
      if (
        title.length > 5 && 
        title.length < 90 && 
        !title.toLowerCase().includes('navigation') && 
        !title.toLowerCase().includes('menu') && 
        !title.toLowerCase().includes('search') &&
        !title.toLowerCase().includes('footer') &&
        !title.toLowerCase().includes('contact')
      ) {
        let dateText = '';
        let description = '';
        let eventUrl = '';
        
        // Scan up to 4 subsequent elements to gather event details (date, description, registration link)
        let sibling = $(el).next();
        for (let i = 0; i < 4 && sibling.length > 0; i++) {
          const text = sibling.text().trim();
          if (text.length > 0) {
            const isDate = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i) || 
                           text.match(/\b\d{1,2}:\d{2}\s*(am|pm)?\b/i) ||
                           text.toLowerCase().includes('date') ||
                           text.toLowerCase().includes('time');
                           
            if (isDate && !dateText) {
              dateText = text;
            } else if (!description && text.length > 25 && text.length < 400) {
              description = text;
            }
          }
          
          // Find embedded links
          const link = sibling.find('a').attr('href') || (sibling.is('a') ? sibling.attr('href') : '');
          if (link && !eventUrl && (link.startsWith('http') || link.startsWith('/'))) {
            eventUrl = link;
          }
          
          sibling = sibling.next();
        }
        
        if (title && (dateText || description)) {
          // Resolve relative links if present
          let absoluteRegLink = eventUrl;
          if (eventUrl && eventUrl.startsWith('/')) {
            try {
              const base = new URL(url);
              absoluteRegLink = `${base.protocol}//${base.host}${eventUrl}`;
            } catch {
              // ignore
            }
          }
          
          events.push({
            title,
            description: description || `Join us for the outstanding side event: ${title}. Network with builders and dive into Web3 discussions.`,
            date: dateText ? dateText : new Date(Date.now() + 86400000).toLocaleString(), // Fallback: Tomorrow
            location: "Venue TBA",
            type: "Side Event",
            registration_link: absoluteRegLink || url,
            image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80' // Beautiful meetup backdrop
          });
        }
      }
    });
    
    // De-duplicate by title
    const uniqueEventsMap = new Map();
    events.forEach(e => {
      if (!uniqueEventsMap.has(e.title.toLowerCase())) {
        uniqueEventsMap.set(e.title.toLowerCase(), e);
      }
    });
    
    return Array.from(uniqueEventsMap.values());
  } catch (error: any) {
    console.error("Side events list scraper failed:", error);
    throw error;
  }
}
