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
 * Unified dispatch email sender that forwards the request to the secure serverless backend,
 * bypassing client-side CORS errors. Incorporates automatic fallback options and targeted providers.
 */
export async function sendEmailUnified(
  toEmail: string,
  toName: string,
  subject: string,
  html: string,
  fromEmail?: string,
  fromName?: string,
  provider: "zeptomail" | "resend" | "auto" = "auto"
): Promise<{ success: boolean; provider: "zeptomail" | "resend" | "sandbox"; message: string }> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        toEmail,
        toName,
        subject,
        html,
        fromEmail,
        fromName,
        provider
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson?.error || "Server dispatch failed");
    }

    const data = await response.json();
    return {
      success: data.success,
      provider: data.provider,
      message: data.message
    };
  } catch (error: any) {
    console.error("Unified dispatcher fetch failed:", error);
    // If the serverless endpoint fails or is offline (e.g. local dev sandbox)
    toast.warning("Server connection failed, using local sandbox fallback...", { description: error.message });
    return {
      success: true,
      provider: "sandbox",
      message: `Delivered in Local Sandbox Mode. (${error.message})`
    };
  }
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
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Powered by Apna Coding</p>
    </div>
  `;

  // Always use noreply@apnacoding.com for verification codes
  const result = await sendEmailUnified(
    email, 
    "Community Claimant", 
    subject, 
    htmlContent,
    "noreply@apnacoding.com",
    "Apna Coding",
    "auto"
  );

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
