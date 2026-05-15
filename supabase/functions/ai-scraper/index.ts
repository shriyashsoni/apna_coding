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
    let cleanText = "";

    if (url) {
      console.log(`Scraping URL: ${url}`);
      // Use Jina Reader for robust scraping (bypasses most bots and cleans HTML)
      const jinaUrl = `https://r.jina.ai/${url}`;
      try {
        const response = await fetch(jinaUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });
        if (response.ok) {
          cleanText = await response.text();
          console.log("Successfully scraped with Jina Reader");
        } else {
          throw new Error("Jina Reader failed");
        }
      } catch (e) {
        console.warn("Jina Reader failed, falling back to direct fetch");
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });
        if (!response.ok) throw new Error(`Failed to fetch URL: ${response.statusText}`);
        html = await response.text();
      }
    } else {
      cleanText = textContent;
    }

    // Extraction Logic
    let result: any = {};

    // If we have an AI key, use it! (Placeholder for real AI call)
    const AI_KEY = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("GROQ_API_KEY");
    
    if (AI_KEY && cleanText) {
      console.log("Using AI for extraction...");
      // For now, we'll still use the robust fallback but this is where you'd call GPT/Groq
      // Implementation would be: const aiResult = await callAI(cleanText, contentType);
    }

    const $ = cheerio.load(html || `<html><body>${cleanText}</body></html>`);

    const extractMetadata = () => {
      const title = $('meta[property="og:title"]').attr('content') ||
                    $('meta[name="twitter:title"]').attr('content') ||
                    $('h1').first().text().trim() ||
                    $('title').text().trim() ||
                    (cleanText.split('\n')[0].substring(0, 100)) ||
                    "Untitled Content";

      const description = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') ||
                          $('.description').first().text().trim() ||
                          $('p').first().text().trim().substring(0, 500) ||
                          (cleanText.substring(0, 500)) ||
                          "No description available";

      const image = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    $('img[src*="logo"]').attr('src') ||
                    $('img').first().attr('src');

      return { title, description, image };
    };

    const metadata = extractMetadata();
    result = { ...metadata };

    if (contentType === 'jobs') {
      result = {
        title: metadata.title,
        company: $('[class*="company"]').first().text().trim() || "Unknown Company",
        description: metadata.description,
        location: "Remote",
        type: "full-time",
        link: url
      };
    } else if (contentType === 'news') {
      result = {
        title: metadata.title,
        content: cleanText || html,
        excerpt: metadata.description,
        cover_image: metadata.image
      };
    } else if (contentType === 'hackathons') {
      result = {
        name: metadata.title,
        description: metadata.description,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        location: "Online",
        registration_link: url
      };
    } else if (contentType === 'communities') {
      result = {
        name: metadata.title,
        description: metadata.description,
        logo: metadata.image,
        website: url
      };
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Scraper Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
