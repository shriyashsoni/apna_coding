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

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }

  const { companyName, purpose, additionalContext, emailLength } = body || {};

  try {
    const groqApiKey = process.env.VITE_GROQ_API_KEY || process.env.GROK_API_KEY || "";
    const grokApiKey = process.env.VITE_GROK_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY || "";
    const geminiApiKey = process.env.VITE_GOOGLE_AI_KEY || process.env.GOOGLE_AI_KEY || "AIzaSyBoKnjf9OFEo4LZPymYFAXNjMJJvwPwPZM";

    const prompt = `
      You are the Apna Coding AI Email Partnership Agent.
      Please write three highly personalized partnership email drafts based on the following parameters:
      - Partner Company Name: "${companyName || "Partner"}"
      - Partnership Purpose/Category: "${purpose || "partnership"}"
      - Additional Context: "${additionalContext || "developer collaboration"}"
      - Desired Email Length: "${emailLength || "medium"}"

      For each template (formal, friendly, creative), write a complete, beautifully structured HTML email body.
      To ensure the email has gorgeous spacing and a highly professional appearance in ALL mailboxes (Gmail, Outlook, Apple Mail) and in our preview pane, you MUST strictly apply these exact inline styles to your HTML tags:
      
      - For every <p> tag, apply: style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;"
      - For every <ul> tag, apply: style="margin-top: 0; margin-bottom: 20px; padding-left: 24px; line-height: 1.6; font-family: system-ui, -apple-system, sans-serif;"
      - For every <li> tag, apply: style="margin-bottom: 8px; font-size: 16px; color: #2d3748;"
      - For <strong> tags, apply: style="color: #1a202c; font-weight: 600;"
      
      Start each email with a greeting paragraph:
      <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">Hi [Recipient Name],</p> (or "Hi Team," if name is empty).
      
      Integrate a highly professional mention of Apna Coding (https://apnacoding.com) and how partnering is mutually beneficial.
      
      For the call to action, wrap it in a beautiful, highlighted box:
      <p style="margin-top: 24px; margin-bottom: 24px; padding: 16px; background-color: #f7fafc; border-left: 4px solid #3182ce; border-radius: 4px; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2b6cb0; font-weight: 500;">
        If you are interested in discussing this further, please reply directly to this email and let me know your availability for a brief call next week.
      </p>

      For the sign-off, create a clean signature container:
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif; color: #4a5568;">
        <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1a202c;">Best regards,</p>
        <p style="margin: 0 0 4px 0; font-size: 17px; font-weight: 700; color: #3182ce;">Shriyash Soni</p>
        <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #4a5568;">Founder, Apna Coding</p>
        <p style="margin: 0; font-size: 14px; color: #718096;"><a href="mailto:shriyash.soni@apnacoding.com" style="color: #3182ce; text-decoration: none;">shriyash.soni@apnacoding.com</a> | <a href="https://apnacoding.com" style="color: #3182ce; text-decoration: none;">apnacoding.com</a></p>
      </div>

      Your response must be a single, strict JSON object matching this schema exactly:
      {
        "formal": {
          "subject": "Subject line...",
          "content": "HTML body..."
        },
        "friendly": {
          "subject": "Subject line...",
          "content": "HTML body..."
        },
        "creative": {
          "subject": "Subject line...",
          "content": "HTML body..."
        }
      }

      Do not include markdown code block fences (\`\`\`json). Return ONLY the raw JSON string.
    `;

    // 1. Try Groq first if Groq Key is configured (High priority, fast and structured)
    if (groqApiKey) {
      try {
        console.log("Attempting email generation with Groq...");
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
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
            return res.status(200).json({ success: true, provider: "groq", templates: parsed });
          }
        }
      } catch (e) {
        console.warn("Groq failed inside API, using fallback...", e);
      }
    }

    // 2. Try Grok-2 second if Grok Key is configured
    if (grokApiKey) {
      try {
        console.log("Attempting email generation with Grok-2...");
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

    // 3. Fallback to Gemini
    if (geminiApiKey) {
      try {
        console.log("Attempting email generation with Gemini...");
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
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">Hi Team,</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">I hope this email finds you well.</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">My name is Shriyash Soni, Founder of <strong style="color: #1a202c; font-weight: 600;">Apna Coding</strong> (https://apnacoding.com). We have been following your impressive work in the ecosystem and believe there is a unique opportunity for us to explore a strategic partnership.</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">Given your focus and our developer-centric platform, we could collaborate on developer advocacy, joint hackathons, or ecosystem resources that deliver incredible value to both our communities.</p>
          <p style="margin-top: 24px; margin-bottom: 24px; padding: 16px; background-color: #f7fafc; border-left: 4px solid #3182ce; border-radius: 4px; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2b6cb0; font-weight: 500;">
            If you are interested in discussing this further, please reply directly to this email and let me know your availability for a brief call next week.
          </p>
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif; color: #4a5568;">
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1a202c;">Best regards,</p>
            <p style="margin: 0 0 4px 0; font-size: 17px; font-weight: 700; color: #3182ce;">Shriyash Soni</p>
            <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #4a5568;">Founder, Apna Coding</p>
            <p style="margin: 0; font-size: 14px; color: #718096;"><a href="mailto:shriyash.soni@apnacoding.com" style="color: #3182ce; text-decoration: none;">shriyash.soni@apnacoding.com</a> | <a href="https://apnacoding.com" style="color: #3182ce; text-decoration: none;">apnacoding.com</a></p>
          </div>
        `
      },
      friendly: {
        subject: `Let's build together! 🚀 Apna Coding + ${companyName || "Partner"}`,
        content: `
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">Hi Team,</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">Hope you're having an awesome week!</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">I'm Shriyash Soni, and I run <strong style="color: #1a202c; font-weight: 600;">Apna Coding</strong>. I wanted to reach out because we're big fans of what you are building, and we'd love to partner up and co-create some cool projects together.</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">We are thinking about joint community events, cross-promotions, or hackathons that will get developers super excited.</p>
          <p style="margin-top: 24px; margin-bottom: 24px; padding: 16px; background-color: #f7fafc; border-left: 4px solid #3182ce; border-radius: 4px; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2b6cb0; font-weight: 500;">
            Let me know if you'd be open to a quick chat next week! Just reply directly here.
          </p>
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif; color: #4a5568;">
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1a202c;">Cheers,</p>
            <p style="margin: 0 0 4px 0; font-size: 17px; font-weight: 700; color: #3182ce;">Shriyash Soni</p>
            <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #4a5568;">Founder, Apna Coding</p>
            <p style="margin: 0; font-size: 14px; color: #718096;"><a href="mailto:shriyash.soni@apnacoding.com" style="color: #3182ce; text-decoration: none;">shriyash.soni@apnacoding.com</a> | <a href="https://apnacoding.com" style="color: #3182ce; text-decoration: none;">apnacoding.com</a></p>
          </div>
        `
      },
      creative: {
        subject: `Unlocking the next level: Apna Coding x ${companyName || "Partner"}`,
        content: `
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">Hi Team,</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">What happens when you combine your innovative platform with Apna Coding's global developer community? Something spectacular.</p>
          <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.65; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2d3748;">I'm Shriyash Soni, Founder of <strong style="color: #1a202c; font-weight: 600;">Apna Coding</strong>. I have a bold proposal to combine our forces to run high-impact developer campaigns, co-host custom build tracks, and accelerate Web3 ecosystem adoption.</p>
          <p style="margin-top: 24px; margin-bottom: 24px; padding: 16px; background-color: #f7fafc; border-left: 4px solid #3182ce; border-radius: 4px; font-size: 16px; font-family: system-ui, -apple-system, sans-serif; color: #2b6cb0; font-weight: 500;">
            If you're ready to explore what's possible, let's connect! Simply hit reply to this email.
          </p>
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif; color: #4a5568;">
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1a202c;">Onwards,</p>
            <p style="margin: 0 0 4px 0; font-size: 17px; font-weight: 700; color: #3182ce;">Shriyash Soni</p>
            <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #4a5568;">Founder, Apna Coding</p>
            <p style="margin: 0; font-size: 14px; color: #718096;"><a href="mailto:shriyash.soni@apnacoding.com" style="color: #3182ce; text-decoration: none;">shriyash.soni@apnacoding.com</a> | <a href="https://apnacoding.com" style="color: #3182ce; text-decoration: none;">apnacoding.com</a></p>
          </div>
        `
      }
    };
    
    return res.status(200).json({ success: true, provider: "fallback", templates: fallbackTemplates });
  }
}
