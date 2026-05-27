import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SERPER_API_URL = "https://google.serper.dev/search";
const SERPER_IMAGE_URL = "https://google.serper.dev/images";
const TELEGRAM_API_URL = "https://api.telegram.org/bot";

async function fetchImage(query: string, apiKey: string) {
  try {
    const response = await fetch(SERPER_IMAGE_URL, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: 1 })
    });
    const data = await response.json();
    return data.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200";
  } catch (err) {
    return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200";
  }
}

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
    const GROK_API_KEY = Deno.env.get('GROK_API_KEY') || Deno.env.get('XAI_API_KEY');
    const SEARCH_API_KEY = Deno.env.get('SEARCH_API_KEY');
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID') || "@ApnaCoding_Updates";

    console.log("Autonomous Master Agent v9.2 [DEPLOYED]: Cycle Started");

    await supabase.from('autonomous_agent_logs').insert({
      action_type: 'info',
      message: 'Autonomous 2026 Intelligence Cycle Started',
      status: 'info',
      timestamp: Date.now()
    });

    const queries = [
      { q: "new web3 hackathons 2026 global", type: "hackathon" },
      { q: "upcoming blockchain conferences 2026", type: "event" },
      { q: "latest crypto developer jobs May 2026", type: "job" }
    ];

    let totalPublished = 0;
    const nowMs = Date.now();

    for (const queryObj of queries) {
      const searchResponse = await fetch(SERPER_API_URL, {
        method: "POST",
        headers: { "X-API-KEY": SEARCH_API_KEY || "", "Content-Type": "application/json" },
        body: JSON.stringify({ q: queryObj.q, num: 8 })
      });

      const { organic: results = [] } = await searchResponse.json();

      for (const result of results) {
        // Quick year filter
        if (result.title.includes("2024") || result.title.includes("2025")) continue;

        try {
          const prompt = `Return JSON ONLY for this 2026 ${queryObj.type}. 
          Content: ${result.title} - ${result.snippet}
          Rules: 1. Must be 2026 or later. 2. If past, set is_expired: true. 3. Extract rich description, dates (ms), location (city/country or Online), and search_keyword for images.
          JSON keys: is_hackathon, title, description, start_date_ms, end_date_ms, location, is_expired, search_keyword`;

          let extracted = null;

          // 1. Try Grok first if GROK_API_KEY is available
          if (GROK_API_KEY) {
            try {
              console.log(`🤖 Analyzing content with Grok: "${result.title}"...`);
              const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${GROK_API_KEY}`
                },
                body: JSON.stringify({
                  model: "grok-2",
                  messages: [
                    {
                      role: "user",
                      content: `${prompt}\nRespond with JSON only.`
                    }
                  ],
                  temperature: 0.1
                })
              });

              if (grokResponse.status === 200) {
                const grokData = await grokResponse.json();
                let rawJson = grokData.choices?.[0]?.message?.content;
                if (rawJson) {
                  rawJson = rawJson.replace(/```json|```/g, "").trim();
                  extracted = JSON.parse(rawJson);
                  console.log(`✅ Successfully extracted data using Grok!`);
                }
              } else {
                console.log(`⚠️ Grok API returned HTTP status ${grokResponse.status}. Trying Gemini...`);
              }
            } catch (grokErr) {
              console.log(`⚠️ Grok call failed: ${grokErr.message}. Trying Gemini...`);
            }
          }

          // 2. Fallback to Gemini if Grok didn't extract the details
          if (!extracted && GOOGLE_AI_KEY) {
            try {
              console.log(`🤖 Analyzing content with Gemini: "${result.title}"...`);
              const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
              });

              const aiData = await aiResponse.json();
              if (aiResponse.status === 200) {
                let rawJson = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawJson) {
                  rawJson = rawJson.replace(/```json|```/g, "").trim();
                  extracted = JSON.parse(rawJson);
                  console.log(`✅ Successfully extracted data using Gemini!`);
                }
              } else {
                console.log(`⚠️ Gemini API returned HTTP status ${aiResponse.status}. Activating autonomous smart NLP fallback parser...`);
              }
            } catch (aiErr) {
              console.log(`⚠️ Gemini call failed: ${aiErr.message}. Activating autonomous smart NLP fallback parser...`);
            }
          }

          if (!extracted) {
            // Smart heuristic parser fallback
            const isHackathon = queryObj.type === 'hackathon';
            const cleanTitle = result.title.split(' - ')[0].split(' | ')[0].trim();
            extracted = {
              is_hackathon: isHackathon,
              title: cleanTitle,
              description: result.snippet || `Discover the latest ${queryObj.type} opportunities in the Web3 ecosystem.`,
              start_date_ms: nowMs + 86400000 * 7, // 1 week from now
              end_date_ms: nowMs + 86400000 * 14, // 2 weeks from now
              location: result.title.toLowerCase().includes('online') || result.snippet.toLowerCase().includes('online') ? 'Online' : 'Remote',
              is_expired: false,
              search_keyword: cleanTitle
            };
          }

          if (extracted.is_expired || (extracted.end_date_ms && extracted.end_date_ms < nowMs)) continue;

          const tableName = queryObj.type === 'hackathon' ? 'hackathons' : queryObj.type === 'job' ? 'jobs' : 'events';
          const slug = `${extracted.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Date.now()/1000)}`;

          // Super robust duplicate check: checks title case-insensitively and URL link
          let isDuplicate = false;
          try {
            const cleanTitle = extracted.title.trim();
            const linkField = tableName === 'jobs' ? 'link' : 'registration_link';
            
            // 1. Check by exact URL first (strongest match)
            const { data: urlMatch } = await supabase
              .from(tableName)
              .select('id')
              .eq(linkField, result.link)
              .limit(1);
            
            if (urlMatch && urlMatch.length > 0) {
              isDuplicate = true;
            } else {
              // 2. Check by case-insensitive Title (ilike)
              const { data: titleMatch } = await supabase
                .from(tableName)
                .select('id')
                .ilike('title', cleanTitle)
                .limit(1);
                
              if (titleMatch && titleMatch.length > 0) {
                isDuplicate = true;
              }
            }
          } catch (dupErr) {
            console.log(`⚠️ Duplicate check warning: ${dupErr.message}`);
          }

          if (isDuplicate) {
            console.log(`⏩ Skipping duplicate item: "${extracted.title}"`);
            continue;
          }

          // Fetch real image with optimized punchy search terms
          let imageSearchQuery = extracted.search_keyword || extracted.title;
          imageSearchQuery = imageSearchQuery
            .replace(/(2024|2025|2026|2027)/gi, "") // remove years
            .replace(/(hackathon|event|conference|job|jobs|hiring|indeed|ziprecruiter|devpost)/gi, "") // remove generic descriptors
            .trim();

          if (!imageSearchQuery) {
            imageSearchQuery = extracted.title;
          } else {
            imageSearchQuery = `${imageSearchQuery} logo banner`;
          }

          const imageUrl = await fetchImage(imageSearchQuery, SEARCH_API_KEY || "");

          const insertData: any = {
            slug,
            title: extracted.title,
            description: extracted.description,
            image_url: imageUrl,
            is_published: true,
            is_approved: true,
            registration_link: result.link,
            created_at: new Date().toISOString()
          };

          if (queryObj.type === 'hackathon') {
            insertData.name = extracted.title;
            insertData.start_date = Number(extracted.start_date_ms || nowMs);
            insertData.end_date = Number(extracted.end_date_ms || (nowMs + 604800000));
            insertData.location = extracted.location || "Online";
          } else if (queryObj.type === 'job') {
            insertData.company = extracted.company || "Web3 Stealth";
            insertData.location = extracted.location || "Remote";
            insertData.link = result.link;
          } else {
            insertData.date = Number(extracted.start_date_ms || nowMs);
            insertData.location = extracted.location || "TBA";
          }

          const { error: insertError } = await supabase.from(tableName).insert(insertData);

          if (!insertError) {
            totalPublished++;
            await supabase.from('autonomous_agent_logs').insert({
              action_type: 'publish',
              message: `Auto-published 2026 ${queryObj.type}: ${extracted.title}`,
              status: 'success',
              timestamp: Date.now()
            });

            if (TELEGRAM_BOT_TOKEN) {
              const text = `🚀 *New 2026 Opportunity*\n\n*${extracted.title}*\n\n🔗 [View Details](https://apnacoding.com/${tableName}/${slug})`;
              await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" })
              });
            }
          }
          
          // Small delay to prevent rate limits
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error("Agent process error:", err);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, published: totalPublished }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
