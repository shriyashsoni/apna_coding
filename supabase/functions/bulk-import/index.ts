import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to ensure dates are numeric timestamps (bigint safe)
const sanitizeDate = (val: any, fallback: number = Date.now()): number => {
  if (!val) return fallback;
  const d = new Date(val);
  return isNaN(d.getTime()) ? fallback : d.getTime();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { contentType, importMethod, urlList, excelData, wallet_address, eventGroupId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results = [];

    if (importMethod === "urls") {
      const urls = urlList.split('\n').filter(url => url.trim() !== "");
      
      for (const url of urls) {
        try {
          // Invoke the central AI scraper
          const scraperResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-scraper`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, contentType }),
          });

          if (!scraperResponse.ok) {
            const error = await scraperResponse.json();
            throw new Error(error.error || "AI Scraping failed");
          }

          const { data: extractedData } = await scraperResponse.json();

          // Prepare data for insertion based on content type
          const insertData: any = {
            ...extractedData,
            wallet_address: wallet_address,
          };

          // Set approval/status fields based on table schema
          if (contentType === 'products') {
            insertData.status = 'pending';
          } else if (contentType === 'communities') {
            insertData.is_published = false;
            insertData.slug = extractedData.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `community-${Date.now()}`;
          } else if (contentType === 'news') {
            insertData.is_approved = false;
            insertData.is_published = false;
            insertData.slug = extractedData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `news-${Date.now()}`;
          } else {
            // hackathons, events, jobs
            insertData.is_approved = false;
            if (contentType === 'events' && eventGroupId) {
              insertData.group_id = eventGroupId;
            }
            if (contentType === 'hackathons') {
              insertData.status = 'upcoming';
            }
          }

          // Insert into database
          const { error } = await supabaseClient.from(contentType).insert(insertData);

          if (error) throw error;
          results.push({ url, status: "success", message: "Item scraped and imported successfully" });
        } catch (err) {
          results.push({ url, status: "error", message: err.message });
        }
      }
    } else {
      // Process Excel data (TSV)
      const lines = excelData.split('\n').filter(line => line.trim() !== "");
      const headers = lines[0].split('\t');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const item: any = {};
        headers.forEach((header, index) => {
          item[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
        });

        try {
          const insertData: any = {
            ...item,
            wallet_address: wallet_address,
          };

          // Set approval/status fields based on table schema
          if (contentType === 'products') {
            insertData.status = 'pending';
          } else if (contentType === 'communities') {
            insertData.is_published = false;
            if (!insertData.slug) insertData.slug = (item.name || item.title || `community-${Date.now()}`).toLowerCase().replace(/[^a-z0-9]+/g, "-");
          } else if (contentType === 'news') {
            insertData.is_approved = false;
            insertData.is_published = false;
            if (!insertData.slug) insertData.slug = (item.title || `news-${Date.now()}`).toLowerCase().replace(/[^a-z0-9]+/g, "-");
          } else {
            // hackathons, events, jobs
            insertData.is_approved = false;
            if (contentType === 'events' && eventGroupId) {
              insertData.group_id = eventGroupId;
            }
            if (contentType === 'events' && !insertData.location) {
              insertData.location = "TBA";
            }
            if (contentType === 'hackathons') {
              insertData.status = 'upcoming';
              if (!insertData.location) insertData.location = "Online";
              if (insertData.start_date) insertData.start_date = sanitizeDate(insertData.start_date);
              if (insertData.end_date) insertData.end_date = sanitizeDate(insertData.end_date);
            }
            if ((contentType === 'events' || contentType === 'jobs') && insertData.date) {
              insertData.date = sanitizeDate(insertData.date);
            }
          }

          const { error } = await supabaseClient.from(contentType).insert(insertData);

          if (error) throw error;
          results.push({ url: item.title || item.name || `Row ${i}`, status: "success", message: "Item imported successfully" });
        } catch (err) {
          results.push({ url: item.title || item.name || `Row ${i}`, status: "error", message: err.message });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
