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
    const { job_id } = await req.json();

    if (!job_id) {
      return new Response(JSON.stringify({ error: "Job ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from("ai_agent_jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobError || !job) throw new Error("Job not found");

    // 2. Update status to processing
    await supabaseClient
      .from("ai_agent_jobs")
      .update({ status: "processing", initiated_at: new Date().toISOString() })
      .eq("id", job_id);

    const startTime = Date.now();

    // 3. Perform Extraction
    const scraperResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-scraper`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        url: job.source_type === 'url' ? job.source_data : null,
        textContent: job.source_type === 'text' ? job.source_data : null,
        contentType: job.job_type === 'community' ? 'communities' : 
                     job.job_type === 'news' ? 'news' : 
                     job.job_type === 'hackathon' ? 'hackathons' : 'jobs'
      }),
    });

    if (!scraperResponse.ok) {
      const error = await scraperResponse.json();
      throw new Error(error.error || "AI Scraping failed");
    }

    const { data: extractedData } = await scraperResponse.json();
    
    let targetTable = "";
    if (job.job_type === "community") targetTable = "communities";
    else if (job.job_type === "news") targetTable = "news";
    else if (job.job_type === "hackathon") targetTable = "hackathons";
    else targetTable = "jobs";

    // 4. Create the item in the target table with pending status
    const slug = (extractedData.name || extractedData.title || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const insertPayload = {
      ...extractedData,
      slug,
      wallet_address: job.wallet_address,
      is_approved: false, // Ensure it goes to approval section
      status: job.job_type === "product" ? "pending" : "published" // Products use 'status', others use 'is_approved'
    };

    const { data: newItem, error: createError } = await supabaseClient
      .from(targetTable)
      .insert(insertPayload)
      .select()
      .single();

    if (createError) throw createError;

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // 5. Update job status to completed
    await supabaseClient
      .from("ai_agent_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        processing_time: processingTime,
        tokens_used: 1000, // Simulated
        created_item_id: newItem.id,
        created_item_type: job.job_type,
        extracted_data: extractedData
      })
      .eq("id", job_id);

    return new Response(JSON.stringify({ success: true, item: newItem }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Update job status to failed
    // We need to re-initialize client or pass it if possible
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
