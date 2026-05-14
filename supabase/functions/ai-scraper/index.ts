import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, contentType, textContent } = await req.json();

    if (!url && !textContent) {
      return new Response(JSON.stringify({ error: "URL or text content is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let html = "";
    if (url) {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      html = await response.text();
    } else {
      // If it's just text, we can't really use Cheerio for it, but let's assume we treat it as HTML
      html = textContent;
    }

    const $ = cheerio.load(html);

    // Extraction logic based on Cheerio (No AI)
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

    // Regex helpers
    const extractSalary = (text: string) => {
      const salaryRegex = /(\$\d{1,3}(?:,\d{3})*(?:\s?-\s?\$\d{1,3}(?:,\d{3})*)|(?:\$\d{1,3}k(?:\s?-\s?\$\d{1,3}k))|(?:\$\d{1,3}(?:,\d{3})*))/i;
      const match = text.match(salaryRegex);
      return match ? match[0] : null;
    };

    // Content-type specific extraction
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
        title: metadata.title,
        description: metadata.description,
        prizes: $('[class*="prize"]').first().text().trim() || 
                $('[class*="reward"]').first().text().trim() || null,
        start_date: $('time[datetime]').first().attr('datetime') || new Date().toISOString(),
        end_date: $('time[datetime]').last().attr('datetime') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: $('[class*="location"]').first().text().trim() || 
                  $('[class*="venue"]').first().text().trim() || "Online",
        external_url: url || metadata.website
      };
    } else if (contentType === 'events') {
      result = {
        title: metadata.title,
        description: metadata.description,
        date: Date.now() + 86400000, // Fallback
        location: $('[class*="location"]').first().text().trim() || 
                  $('[class*="venue"]').first().text().trim() || "TBA",
        type: "Meetup",
        registration_link: url || metadata.website
      };
    } else if (contentType === 'news') {
      result = {
        title: metadata.title,
        content: $('article').html() || $('main').html() || html,
        excerpt: metadata.description,
        category: "News",
        tags: [],
        cover_image: metadata.image
      };
    } else if (contentType === 'communities') {
      result = {
        name: metadata.title,
        description: metadata.description,
        logo: metadata.image,
        cover_image: metadata.image, // Fallback to same as logo if not found
        website: url || metadata.website,
        twitter: $('a[href*="twitter.com"]').attr('href') || 
                 $('a[href*="x.com"]').attr('href') || null,
        discord: $('a[href*="discord.gg"]').attr('href') || 
                 $('a[href*="discord.com"]').attr('href') || null,
        partnership_type: "Community",
        partner_category: "Web3"
      };
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
