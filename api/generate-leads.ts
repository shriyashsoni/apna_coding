export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }

  const { query } = body || {};
  const searchQuery = query || "blockchain developer communities and Web3 companies";

  const groqApiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || "";
  const geminiApiKey = process.env.VITE_GOOGLE_AI_KEY || "";

  // Highly professional fallback database of blockchain leads to ensure 100% uptime
  const fallbackLeads = [
    {
      name: "Solana India Community",
      email: "india@solana.org",
      website: "https://solana.com",
      category: "Developer Alliance",
      focus: "Solana builder meetups, grants, and rust bootcamps in India"
    },
    {
      name: "Arbitrum Developers",
      email: "builders@arbitrum.foundation",
      website: "https://arbitrum.io",
      category: "Technical Integration",
      focus: "Layer 2 scaling integration, L2 hackathons, and gas optimization"
    },
    {
      name: "Polygon Labs",
      email: "partnerships@polygon.technology",
      website: "https://polygon.technology",
      category: "Community Alliance",
      focus: "Multi-chain scaling, developer outreach, and gasless dApp support"
    },
    {
      name: "Superteam India",
      email: "india@superteam.fun",
      website: "https://superteam.fun",
      category: "Education Program",
      focus: "Web3 talent placement, bounties, and startup incubation support"
    },
    {
      name: "Push Protocol Outreach",
      email: "collaboration@push.org",
      website: "https://push.org",
      category: "Technical Integration",
      focus: "Web3 notifications, chat integration, and developer tooling"
    },
    {
      name: "Biconomy Ecosystem",
      email: "relations@biconomy.io",
      website: "https://biconomy.io",
      category: "Technical Integration",
      focus: "Account abstraction, smart wallets, and gasless user onboarding"
    }
  ];

  const systemPrompt = `You are a professional lead-generation intelligence bot.
Your task is to generate a JSON array of 6 realistic blockchain communities, protocols, organizations, or companies matching the user query: "${searchQuery}".
For each lead, provide these exact fields: name, email, website, category, focus.
The category must be one of: "General Partnership", "Hackathon Co-host", "Sponsorship Deal", "Event Collaboration", "Media Partnership", "Technical Integration", "Education Program", "Community Alliance".
Do NOT write markdown formatting, backticks, or conversational text. Return ONLY a valid JSON array matching this TypeScript interface:
Array<{ name: string; email: string; website: string; category: string; focus: string; }>`;

  // 1. Try Groq (Llama 3.3 70B)
  if (groqApiKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim() || "";
        // Clean markdown code blocks if AI returned them
        const cleanContent = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleanContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.status(200).json({ success: true, leads: parsed, provider: "groq" });
        }
      }
    } catch (e: any) {
      console.warn("Groq lead generator failed, attempting Gemini fallback:", e.message);
    }
  }

  // 2. Try Gemini 1.5 Flash Fallback
  if (geminiApiKey) {
    try {
      const response = await fetch(`https://generativetoolkit.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const cleanText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.status(200).json({ success: true, leads: parsed, provider: "gemini" });
        }
      }
    } catch (e: any) {
      console.warn("Gemini lead generator failed, using high-availability fallback database:", e.message);
    }
  }

  // 3. Quaternary Bulletproof Local Database Fallback
  return res.status(200).json({
    success: true,
    leads: fallbackLeads.filter(lead => 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery.length < 5
    ).slice(0, 6) || fallbackLeads,
    provider: "fallback"
  });
}
