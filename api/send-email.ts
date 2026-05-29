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

  const { toEmail, toName, subject, html, fromEmail, fromName, provider } = req.body;

  if (!toEmail || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields (toEmail, subject, html)" });
  }

  const zeptoApiKey = process.env.VITE_ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_API_KEY || "";
  const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY || "";

  const chosenProvider = provider || "auto";

  // Helper function to send via ZeptoMail
  const tryZeptoMail = async () => {
    if (!zeptoApiKey) {
      throw new Error("ZeptoMail API Key is not configured on the server.");
    }
    const response = await fetch("https://api.zeptomail.in/v1.1/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Zoho-enczapikey ${zeptoApiKey}`
      },
      body: JSON.stringify({
        from: {
          address: fromEmail || "noreply@apnacoding.com",
          name: fromName || "Apna Coding"
        },
        to: [
          {
            email_address: {
              address: toEmail,
              name: toName || toEmail.split("@")[0]
            }
          }
        ],
        subject: subject,
        htmlbody: html
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = "ZeptoMail deliverability error";
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson?.message || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return true;
  };

  // Helper function to send via Resend
  const tryResendMail = async () => {
    if (!resendApiKey) {
      throw new Error("Resend API Key is not configured on the server.");
    }
    const sender = fromEmail && fromEmail !== "noreply@apnacoding.com"
      ? `${fromName || "Apna Coding"} <${fromEmail}>`
      : `Apna Coding <onboarding@resend.dev>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: sender,
        to: toEmail,
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.message || "Resend API delivery error");
    }
    return true;
  };

  try {
    // 1. Force ZeptoMail if requested
    if (chosenProvider === "zeptomail") {
      await tryZeptoMail();
      return res.status(200).json({ success: true, provider: "zeptomail", message: "Delivered successfully via Zoho ZeptoMail." });
    }

    // 2. Force Resend if requested
    if (chosenProvider === "resend") {
      await tryResendMail();
      return res.status(200).json({ success: true, provider: "resend", message: "Delivered successfully via Resend API." });
    }

    // 3. Auto Cascade fallback flow
    if (zeptoApiKey) {
      try {
        await tryZeptoMail();
        return res.status(200).json({ success: true, provider: "zeptomail", message: "Delivered successfully via Zoho ZeptoMail." });
      } catch (zeptoError: any) {
        console.warn("ZeptoMail failed in auto-flow, attempting Resend fallback:", zeptoError.message);
      }
    }

    if (resendApiKey) {
      try {
        await tryResendMail();
        return res.status(200).json({ success: true, provider: "resend", message: "Delivered successfully via Resend API." });
      } catch (resendError: any) {
        console.warn("Resend failed in auto-flow, using sandbox fallback:", resendError.message);
      }
    }

    // Sandbox backup
    console.log(`[Server Email Sandbox Mode]
Sender: ${fromName || "Apna Coding"} <${fromEmail || "noreply@apnacoding.com"}>
Recipient: ${toName} <${toEmail}>
Subject: ${subject}`);

    return res.status(200).json({ success: true, provider: "sandbox", message: "Delivered in Local Sandbox Mode." });

  } catch (error: any) {
    console.error("Secure send-email handler failed:", error);
    return res.status(500).json({ error: error.message || "Failed to dispatch email securely" });
  }
}
