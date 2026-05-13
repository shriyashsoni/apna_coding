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

    // 3. Perform Extraction (Simulated)
    let extractedData = {};
    let targetTable = "";

    if (job.job_type === "community") {
      targetTable = "communities";
      extractedData = {
        name: "Extracted Community",
        description: "Description from " + job.source_data,
        status: "pending_approval"
      };
    } else if (job.job_type === "news") {
      targetTable = "news";
      extractedData = {
        title: "Extracted News",
        content: "Content from " + job.source_data,
        status: "pending_approval"
      };
    } else if (job.job_type === "hackathon") {
      targetTable = "hackathons";
      extractedData = {
        title: "Extracted Hackathon",
        description: "Description from " + job.source_data,
        status: "pending_approval"
      };
    }

    // 4. Create the item in the target table
    const { data: newItem, error: createError } = await supabaseClient
      .from(targetTable)
      .insert(extractedData)
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
