import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SERPER_API_URL = "https://google.serper.dev/search";
const TELEGRAM_API_URL = "https://api.telegram.org/bot";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_KEY');
    const SEARCH_API_KEY = Deno.env.get('SEARCH_API_KEY');
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID') || "@ApnaCoding_Updates"; // Fallback to a channel name if ID is missing

    console.log("Autonomous Super Agent: Cycle Started");

    // 1. Log cycle start
    await supabase.from('autonomous_agent_logs').insert({
      action_type: 'info',
      message: 'Global Intelligence Cycle Started: Scanning for Hackathons, Jobs, and News...',
      status: 'info'
    });

    const queries = [
      { q: "upcoming web3 hackathons 2024 2025", type: "hackathon" },
      { q: "remote web3 developer jobs blockchain", type: "job" },
      { q: "latest web3 news blockchain industry", type: "news" }
    ];

    let totalPublished = 0;

    for (const queryObj of queries) {
      console.log(`Searching for: ${queryObj.q}`);
      
      const searchResponse = await fetch(SERPER_API_URL, {
        method: "POST",
        headers: {
          "X-API-KEY": SEARCH_API_KEY || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: queryObj.q, num: 5 })
      });

      const searchResults = await searchResponse.json();
      const organicResults = searchResults.organic || [];
      
      console.log(`Found ${organicResults.length} potential sources for ${queryObj.type}`);

      for (const result of organicResults) {
        try {
          const prompt = `
            You are a Web3 Data Extraction Agent. 
            I found this search result for a ${queryObj.type}:
            Title: ${result.title}
            Snippet: ${result.snippet}
            URL: ${result.link}

            Extract details in JSON format. If a detail is missing, provide a logical guess or leave null.
            
            If type is 'hackathon': name, description, start_date (UNIX ms), end_date (UNIX ms), location, prize_pool, website.
            If type is 'job': title, company, description, location, type (full-time/contract), salary, link.
            If type is 'news': title, content (3-4 paragraphs), excerpt, category, tags (array).

            Output ONLY valid JSON.
          `;

          const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          const aiData = await aiResponse.json();
          const rawJson = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, "").trim();
          
          if (!rawJson) continue;

          const extractedData = JSON.parse(rawJson);
          const slug = (extractedData.name || extractedData.title).toLowerCase().replace(/[^a-z0-9]+/g, "-");

          // Check for duplicates
          const tableName = queryObj.type === 'hackathon' ? 'hackathons' : queryObj.type === 'job' ? 'jobs' : 'news';
          const { data: existing } = await supabase
            .from(tableName)
            .select('id')
            .eq('slug', slug)
            .single();

          if (!existing) {
            const insertData = {
              ...extractedData,
              slug,
              is_published: true,
              is_approved: true,
              created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase.from(tableName).insert(insertData);

            if (!insertError) {
              totalPublished++;
              await supabase.from('autonomous_agent_logs').insert({
                action_type: 'publish',
                message: `Auto-published ${queryObj.type}: ${extractedData.name || extractedData.title}`,
                status: 'success',
                metadata: { url: result.link, type: queryObj.type }
              });

              // Social Notifications (simplified for brevity)
              if (TELEGRAM_BOT_TOKEN) {
                const text = `🚀 *Auto-Published ${queryObj.type}*\n\n*${extractedData.name || extractedData.title}*\n\n🔗 [View on Platform](https://apnacoding.com/${tableName}/${slug})`;
                await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" })
                });
              }
            }
          }
        } catch (err) {
          console.error(`Error processing ${queryObj.type}:`, err);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Cycle completed",
        published: totalPublished
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
