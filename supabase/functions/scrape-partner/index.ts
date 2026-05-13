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
      return new Response(JSON.stringify({ error: "URL is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch the content of the URL
    // In a real scenario, you might use a scraping service like Firecrawl, ScrapingBee, or a simple fetch
    // For this example, we'll use a simple fetch and convert to text
    const response = await fetch(url);
    const html = await response.text();

    // 2. Use AI to extract information
    // You would call OpenAI or Gemini here
    // For now, we'll simulate the extraction
    
    // Example AI prompt (pseudo-code):
    // "Extract the following information from this HTML: name, description, logo_url, website, twitter, discord, partnership_type"
    
    // Simulated extracted data
    const extractedData = {
      name: "Partner from " + new URL(url).hostname,
      description: "Automatically extracted description from " + url,
      website: url,
      partnership_type: "Community",
      wallet_address: wallet_address,
      status: "pending_approval"
    };

    // 3. Insert into database
    const { data, error } = await supabaseClient
      .from("communities")
      .insert(extractedData)
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
