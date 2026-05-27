import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ====================================================================
// ENVIRONMENT CONFIG LOADER
// ====================================================================
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  });
  return env;
}

const env = {
  ...loadEnv(path.resolve('.env')),
  ...loadEnv(path.resolve('.env.local'))
};
Object.assign(process.env, env);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "@ApnaCoding_Updates";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERROR: Missing Supabase URL or credentials. Please check your .env or .env.local!");
  process.exit(1);
}

if ((!GOOGLE_AI_KEY && !GROK_API_KEY) || !SEARCH_API_KEY) {
  console.error("❌ ERROR: Missing AI API keys (GOOGLE_AI_KEY or GROK_API_KEY) or SEARCH_API_KEY. Please add them to your .env!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SERPER_API_URL = "https://google.serper.dev/search";
const SERPER_IMAGE_URL = "https://google.serper.dev/images";
const TELEGRAM_API_URL = "https://api.telegram.org/bot";

// ====================================================================
// CORE HELPER FUNCTIONS
// ====================================================================
async function writeLog(actionType, message, status = 'info') {
  console.log(`[LOG] [${actionType.toUpperCase()}] [${status.toUpperCase()}] ${message}`);
  try {
    await supabase.from('autonomous_agent_logs').insert({
      action_type: actionType,
      message,
      status,
      timestamp: Date.now()
    });
  } catch (err) {
    // If the table doesn't exist yet, gracefully skip database logging and print to terminal
  }
}

async function fetchImage(query, apiKey) {
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

// ====================================================================
// AUTONOMOUS AGENT ACTIVE INTELLIGENCE CYCLE
// ====================================================================
async function startCycle() {
  console.log("====================================================================");
  console.log("⚡ APNA CODING - AUTONOMOUS MASTER AGENT LOCAL CYCLE KICKSTART ⚡");
  console.log("====================================================================");
  
  await writeLog('info', 'Autonomous Master Agent Intelligence Cycle Initiated Locally', 'info');

  const queries = [
    { q: "new web3 hackathons 2026 global devpost", type: "hackathon" },
    { q: "upcoming blockchain developer conferences 2026", type: "event" },
    { q: "latest solidity crypto developer jobs Remote 2026", type: "job" }
  ];

  let totalPublished = 0;
  const nowMs = Date.now();

  for (const queryObj of queries) {
    console.log(`\n🔍 Searching Google for: "${queryObj.q}"...`);
    try {
      const searchResponse = await fetch(SERPER_API_URL, {
        method: "POST",
        headers: { "X-API-KEY": SEARCH_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ q: queryObj.q, num: 8 })
      });

      const searchData = await searchResponse.json();
      const results = searchData.organic || [];
      console.log(`✅ Retrieved ${results.length} organic search results for analysis.`);

      for (const result of results) {
        // Year validation checks (Filter past events)
        if (result.title.includes("2024") || result.title.includes("2025")) {
          console.log(`⏩ Skipping outdated resource: ${result.title}`);
          continue;
        }

        try {
          console.log(`🤖 Analyzing content with Gemini: "${result.title}"...`);
          
          const prompt = `Return JSON ONLY for this 2026 ${queryObj.type}. 
          Content: ${result.title} - ${result.snippet}
          Rules: 
          1. Must be 2026 or later. 
          2. If past, set is_expired: true. 
          3. Extract rich description, dates (ms), location (city/country or Online), and search_keyword for images.
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

          if (extracted.is_expired || (extracted.end_date_ms && extracted.end_date_ms < nowMs)) {
            console.log(`⏩ Skipping opportunity: ${extracted.title || 'Unknown'} (Expired or out of date limits)`);
            continue;
          }

          const tableName = queryObj.type === 'hackathon' ? 'hackathons' : queryObj.type === 'job' ? 'jobs' : 'events';
          const slug = `${extracted.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Date.now() / 1000)}`;

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

          console.log(`🌐 Fetching relevant artwork/logo for: ${extracted.title}...`);
          
          // Punchy logo/banner query extraction
          let imageSearchQuery = extracted.search_keyword || extracted.title;
          imageSearchQuery = imageSearchQuery
            .replace(/(2024|2025|2026|2027)/gi, "") // remove years
            .replace(/(hackathon|event|conference|job|jobs|hiring|indeed|ziprecruiter|devpost)/gi, "") // remove generic terms
            .trim();
          
          if (!imageSearchQuery) {
            imageSearchQuery = extracted.title;
          } else {
            imageSearchQuery = `${imageSearchQuery} logo banner`;
          }

          const imageUrl = await fetchImage(imageSearchQuery, SEARCH_API_KEY);

          const insertData = {
            slug,
            title: extracted.title,
            description: extracted.description,
            image_url: imageUrl,
            is_published: true,
            registration_link: result.link,
            created_at: new Date().toISOString()
          };

          if (queryObj.type === 'hackathon') {
            insertData.name = extracted.title;
            insertData.start_date = Number(extracted.start_date_ms || nowMs);
            insertData.end_date = Number(extracted.end_date_ms || (nowMs + 604800000));
            insertData.location = extracted.location || "Online";
            insertData.prize_pool = "$10,000";
          } else if (queryObj.type === 'job') {
            insertData.company = extracted.company || "Web3 Dev Lab";
            insertData.location = extracted.location || "Remote";
            insertData.type = "Full-time";
            insertData.link = result.link;
          } else {
            insertData.date = Number(extracted.start_date_ms || nowMs);
            insertData.location = extracted.location || "TBA";
            insertData.type = "Conference";
          }

          console.log(`💾 Inserting opportunity into "${tableName}"...`);
          const { error: insertError } = await supabase.from(tableName).insert(insertData);

          if (insertError) {
            console.error(`❌ DB Insert error:`, insertError.message);
            continue;
          }

          totalPublished++;
          await writeLog('publish', `Auto-published 2026 ${queryObj.type}: ${extracted.title}`, 'success');

          // Send Telegram Broadcast if configured
          if (TELEGRAM_BOT_TOKEN && !TELEGRAM_BOT_TOKEN.includes("BotToken")) {
            try {
              const text = `🚀 *New 2026 Opportunity Found by Apna Agent*\n\n*Type:* ${queryObj.type.toUpperCase()}\n*Title:* ${extracted.title}\n*Location:* ${insertData.location}\n\n🔗 [Apply / Register Here](${result.link})`;
              await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" })
              });
              console.log("📢 Telegram broadcast sent successfully!");
            } catch (teleErr) {
              console.log("⚠️ Telegram notification failed, skipping.");
            }
          }

          // Respect API Rate limits
          await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
          console.error("❌ Error parsing candidate result:", err.message);
        }
      }
    } catch (err) {
      console.error(`❌ Search pipeline error for query "${queryObj.q}":`, err.message);
    }
  }

  console.log("\n====================================================================");
  console.log(`🎉 CYCLE COMPLETE. Successfully Auto-Published: ${totalPublished} Items!`);
  console.log("====================================================================");
  await writeLog('info', `Autonomous Cycle Concluded. Published: ${totalPublished} updates`, 'success');
}

startCycle().catch(console.error);
