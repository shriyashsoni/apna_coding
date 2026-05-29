import { toast } from "sonner";

/**
 * Extracts the primary domain from a website URL.
 * Example: https://www.rateofcoding.com/about -> rateofcoding.com
 */
export function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "http://" + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    return parsed.hostname.replace(/^www\./i, "").toLowerCase();
  } catch (e) {
    return null;
  }
}

/**
 * Extracts domain from an email address.
 * Example: test@rateofcoding.com -> rateofcoding.com
 */
export function extractEmailDomain(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  return email.split("@")[1].trim().toLowerCase();
}

/**
 * Validates whether the claimant email domain matches the official website domain.
 */
export function validateClaimDomain(email: string, websiteUrl: string | null | undefined): { isValid: boolean; domain?: string; websiteDomain?: string } {
  const emailDomain = extractEmailDomain(email);
  const websiteDomain = extractDomain(websiteUrl);

  if (!emailDomain || !websiteDomain) {
    return { isValid: false };
  }

  const isValid = emailDomain === websiteDomain;
  return { isValid, domain: emailDomain, websiteDomain };
}

/**
 * Sends a transactional email using Zoho ZeptoMail API.
 */
export async function sendZeptoMail(
  toEmail: string,
  toName: string,
  subject: string,
  html: string
): Promise<boolean> {
  const zeptoApiKey = import.meta.env.VITE_ZEPTOMAIL_API_KEY || "";
  
  if (!zeptoApiKey) {
    throw new Error("ZeptoMail API Key is not configured in the environment.");
  }

  try {
    const response = await fetch("https://api.zeptomail.in/v1.1/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Zoho-enczapikey ${zeptoApiKey}`
      },
      body: JSON.stringify({
        from: {
          address: "noreply@apnacoding.com",
          name: "Apna Coding"
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
  } catch (error: any) {
    console.error("ZeptoMail Send Error:", error);
    throw error;
  }
}

/**
 * Sends a transactional email using Resend API.
 */
export async function sendResendMail(
  toEmail: string,
  toName: string,
  subject: string,
  html: string
): Promise<boolean> {
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || "";
  
  if (!resendApiKey) {
    throw new Error("Resend API Key is not configured in the environment.");
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "Apna Coding <onboarding@resend.dev>",
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
  } catch (error: any) {
    console.error("Resend Send Error:", error);
    throw error;
  }
}

/**
 * Unified dispatch email sender supporting ZeptoMail (primary) and Resend (failover/fallback)
 * with a Sandbox developer mode fallback.
 */
export async function sendEmailUnified(
  toEmail: string,
  toName: string,
  subject: string,
  html: string
): Promise<{ success: boolean; provider: "zeptomail" | "resend" | "sandbox"; message: string }> {
  const zeptoApiKey = import.meta.env.VITE_ZEPTOMAIL_API_KEY || "";
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || "";

  // 1. Try ZeptoMail first
  if (zeptoApiKey) {
    try {
      const success = await sendZeptoMail(toEmail, toName, subject, html);
      if (success) {
        return { success: true, provider: "zeptomail", message: "Delivered successfully via Zoho ZeptoMail." };
      }
    } catch (e: any) {
      console.warn("ZeptoMail delivery failed, trying Resend fallback...", e);
      toast.warning("ZeptoMail failed, attempting fallback...", { description: e.message });
    }
  }

  // 2. Try Resend second
  if (resendApiKey) {
    try {
      const success = await sendResendMail(toEmail, toName, subject, html);
      if (success) {
        return { success: true, provider: "resend", message: "Delivered successfully via Resend API." };
      }
    } catch (e: any) {
      console.warn("Resend delivery failed, falling back to sandbox...", e);
      toast.warning("Resend failed, activating sandbox fallback...", { description: e.message });
    }
  }

  // 3. Fallback to developer Sandbox mode
  console.log(`[Email Sandbox Mode]
Recipient: ${toName} <${toEmail}>
Subject: ${subject}
Content: ${html.substring(0, 300)}...`);

  return { 
    success: true, 
    provider: "sandbox", 
    message: "Delivered in Local Sandbox Mode." 
  };
}

/**
 * Sends a community ownership verification email using the unified email engine.
 */
export async function sendVerificationCode(
  email: string,
  communityName: string,
  code: string
): Promise<boolean> {
  const subject = `🔑 Claim Verification: ${communityName}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #6366f1;">Claim Ownership of "${communityName}"</h2>
      <p>We received a request to claim ownership of <strong>${communityName}</strong> on Apna Coding.</p>
      <p>Please use the following 6-digit verification code to complete your claim:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 4px; margin: 20px 0;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 14px;">If you did not make this request, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Powered by Apna Coding & Zoho ZeptoMail</p>
    </div>
  `;

  const result = await sendEmailUnified(email, "Community Claimant", subject, htmlContent);

  if (result.provider === "sandbox") {
    toast.success(`[Sandbox Mode] Verification code is: ${code}`, {
      description: "Copy this code to complete the verification simulation.",
      duration: 10000,
    });
  } else {
    toast.success(`Verification email sent to ${email} via ${result.provider === "zeptomail" ? "ZeptoMail" : "Resend"}!`);
  }

  return true;
}
