import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, wallet_address } = await req.json();

    if (!url) {
      throw new Error("URL is required");
    }

    // 1. Invoke the central AI scraper
    const scraperResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-scraper`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, contentType: "hackathons" }),
    });

    if (!scraperResponse.ok) {
      const error = await scraperResponse.json();
      throw new Error(error.error || "AI Scraping failed");
    }

    const { data: extractedData } = await scraperResponse.json();

    // 2. Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 3. Insert into database
    const { data, error } = await supabaseClient
      .from("hackathons")
      .insert({
        ...extractedData,
        wallet_address: wallet_address,
        is_approved: false, // Always need review
        status: "upcoming",
        slug: extractedData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `hackathon-${Date.now()}`
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
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
