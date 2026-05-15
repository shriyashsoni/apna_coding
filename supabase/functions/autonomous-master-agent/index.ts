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

    // Log cycle start to DB for UI visibility
    await supabase.from('autonomous_agent_logs').insert({
      action_type: 'info',
      message: 'Autonomous Cycle Started: Scanning for new industry content...',
      status: 'info'
    });

    // 1. SEARCH FOR CONTENT
    const searchQuery = "upcoming web3 hackathons 2024 2025";
    const searchResponse = await fetch(SERPER_API_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": SEARCH_API_KEY || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: searchQuery, num: 5 })
    });

    const searchResults = await searchResponse.json();
    const organicResults = searchResults.organic || [];
    
    let processedCount = 0;
    let publishedCount = 0;

    // 2. PROCESS EACH RESULT WITH GEMINI
    for (const result of organicResults) {
      console.log(`Analyzing: ${result.title}`);
      
      const prompt = `
        You are a Web3 Data Extraction Agent. 
        I found this search result for a hackathon:
        Title: ${result.title}
        Snippet: ${result.snippet}
        URL: ${result.link}

        Extract the following details in JSON format. If a detail is missing, provide a logical guess or leave null.
        Fields: name, description, start_date (UNIX timestamp in ms), end_date (UNIX timestamp in ms), location (e.g. Online or City), prize_pool (string), tags (array of strings), logo (URL), website (URL).
        
        Rules:
        - name should be concise.
        - description should be 2-3 sentences.
        - start_date must be a number (ms).
        - output ONLY the JSON.
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

      try {
        const hackathonData = JSON.parse(rawJson);
        processedCount++;

        // Check if it already exists by name or URL
        const { data: existing } = await supabase
          .from('hackathons')
          .select('id')
          .or(`name.eq."${hackathonData.name}",website.eq."${hackathonData.website}"`)
          .single();

        if (!existing) {
          // 3. AUTO-PUBLISH
          const { error: insertError } = await supabase.from('hackathons').insert({
            ...hackathonData,
            slug: hackathonData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            is_published: true, // AUTO-APPROVE
            is_featured: false,
            created_at: Date.now()
          });

          if (!insertError) {
            publishedCount++;
            
            // 4. TELEGRAM NOTIFICATION
            if (TELEGRAM_BOT_TOKEN) {
              const message = `🚀 *New Hackathon Discovered!*\n\n🏆 *${hackathonData.name}*\n💰 Prize: ${hackathonData.prize_pool || "N/A"}\n📍 Location: ${hackathonData.location}\n\n🔗 [View on Apna Coding](https://apnacoding.com/hackathons/${hackathonData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")})`;
              
              await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: TELEGRAM_CHAT_ID,
                  text: message,
                  parse_mode: "Markdown"
                })
              });
            }

            // 5. TWITTER (X) NOTIFICATION
            const TWITTER_BEARER_TOKEN = Deno.env.get('TWITTER_BEARER_TOKEN');
            if (TWITTER_BEARER_TOKEN) {
              try {
                const tweetText = `🚀 New Web3 Hackathon Discovered!\n\n🏆 ${hackathonData.name}\n💰 Prize: ${hackathonData.prize_pool || "N/A"}\n\nCheck it out here: https://apnacoding.com/hackathons/${hackathonData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")} #Web3 #Hackathon #ApnaCoding`;
                
                await fetch("https://api.twitter.com/2/tweets", {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${TWITTER_BEARER_TOKEN}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ text: tweetText })
                });
              } catch (twitterErr) {
                console.error("Twitter post failed:", twitterErr);
              }
            }

            // 6. LOG THE ACTION
            await supabase.from('autonomous_agent_logs').insert({
              action_type: 'publish',
              message: `Auto-published hackathon: ${hackathonData.name}`,
              status: 'success',
              metadata: { url: hackathonData.website }
            });
          }
        }
      } catch (err) {
        console.error("Failed to parse AI output:", err);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Cycle completed",
        scanned: organicResults.length,
        processed: processedCount,
        published: publishedCount
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
