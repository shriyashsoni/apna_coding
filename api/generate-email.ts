export default async function handler(req: any, res: any) {
  // Set CORS headers
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

  const { companyName, purpose, additionalContext, emailLength } = req.body;

  try {
    const grokApiKey = process.env.VITE_GROK_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY || "";
    const geminiApiKey = process.env.VITE_GOOGLE_AI_KEY || process.env.GOOGLE_AI_KEY || "AIzaSyBoKnjf9OFEo4LZPymYFAXNjMJJvwPwPZM";

    const prompt = `
      You are the Apna Coding AI Email Partnership Agent.
      Please write three highly personalized partnership email drafts based on the following parameters:
      - Partner Company Name: "${companyName || "Partner"}"
      - Partnership Purpose/Category: "${purpose || "partnership"}"
      - Additional Context: "${additionalContext || "developer collaboration"}"
      - Desired Email Length: "${emailLength || "medium"}"

      For each template (formal, friendly, creative), write a complete HTML email body.
      - Start each email with "Hi [Recipient Name]," or if name is empty, "Hi Team,".
      - Integrate a professional mention of Apna Coding (https://apnacoding.com) and how partnering is mutually beneficial.
      - Include clean HTML tags (like <p>, <ul>, <li>, <strong>) but NO body/html outer wrapping tags.
      - Include a clear call to action: "If you are interested in discussing this further, please reply directly to this email."
      - Sign off as:
        Shriyash Soni
        Founder, Apna Coding
        shriyash.soni@apnacoding.com

      Your response must be a single, strict JSON object matching this schema exactly:
      {
        "formal": {
          "subject": "Subject line...",
          "content": "HTML content..."
        },
        "friendly": {
          "subject": "Subject line...",
          "content": "HTML content..."
        },
        "creative": {
          "subject": "Subject line...",
          "content": "HTML content..."
        }
      }

      Do not include markdown code block fences (\`\`\`json). Return ONLY the raw JSON string.
    `;

    // 1. Try Grok-2 first if Grok Key is configured
    if (grokApiKey) {
      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${grokApiKey}`
          },
          body: JSON.stringify({
            model: "grok-2",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const text = resData.choices?.[0]?.message?.content;
          if (text) {
            const parsed = JSON.parse(text.trim());
            return res.status(200).json({ success: true, provider: "grok", templates: parsed });
          }
        }
      } catch (e) {
        console.warn("Grok failed, falling back to Gemini...", e);
      }
    }

    // 2. Fallback to Gemini
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text.trim());
            return res.status(200).json({ success: true, provider: "gemini", templates: parsed });
          }
        }
      } catch (e) {
        console.warn("Gemini failed inside API, using structural fallback...", e);
      }
    }

    throw new Error("All AI models failed");

  } catch (error: any) {
    console.error("API handler error, executing bulletproof fallback:", error);
    
    // Fallback: Dynamically generate high-quality templates if keys are offline/blocked
    const fallbackTemplates = {
      formal: {
        subject: `Strategic Partnership Proposal: Apna Coding & ${companyName || "Partner"}`,
        content: `
          <p>Hi Team,</p>
          <p>I hope this email finds you well.</p>
          <p>My name is Shriyash Soni, Founder of <strong>Apna Coding</strong> (https://apnacoding.com). We have been following your impressive work in the ecosystem and believe there is a unique opportunity for us to explore a strategic partnership.</p>
          <p>Given your focus and our developer-centric platform, we could collaborate on developer advocacy, joint hackathons, or ecosystem resources that deliver incredible value to both our communities.</p>
          <p>If you are interested in discussing this further, please reply directly to this email.</p>
          <p>Best regards,<br><strong>Shriyash Soni</strong><br>Founder, Apna Coding<br>shriyash.soni@apnacoding.com</p>
        `
      },
      friendly: {
        subject: `Let's build together! 🚀 Apna Coding + ${companyName || "Partner"}`,
        content: `
          <p>Hi Team,</p>
          <p>Hope you're having an awesome week!</p>
          <p>I'm Shriyash Soni, and I run <strong>Apna Coding</strong>. I wanted to reach out because we're big fans of what you are building, and we'd love to partner up and co-create some cool projects together.</p>
          <p>We are thinking about joint community events, cross-promotions, or hackathons that will get developers super excited.</p>
          <p>Let me know if you'd be open to a quick chat next week! Just reply directly here.</p>
          <p>Cheers,<br><strong>Shriyash Soni</strong><br>Founder, Apna Coding<br>shriyash.soni@apnacoding.com</p>
        `
      },
      creative: {
        subject: `Unlocking the next level: Apna Coding x ${companyName || "Partner"}`,
        content: `
          <p>Hi Team,</p>
          <p>What happens when you combine your innovative platform with Apna Coding's global developer community? Something spectacular.</p>
          <p>I'm Shriyash Soni, Founder of <strong>Apna Coding</strong>. I have a bold proposal to combine our forces to run high-impact developer campaigns, co-host custom build tracks, and accelerate Web3 ecosystem adoption.</p>
          <p>If you're ready to explore what's possible, let's connect! Simply hit reply to this email.</p>
          <p>Onwards,<br><strong>Shriyash Soni</strong><br>Founder, Apna Coding<br>shriyash.soni@apnacoding.com</p>
        `
      }
    };
    
    return res.status(200).json({ success: true, provider: "fallback", templates: fallbackTemplates });
  }
}
