import { createClient } from "@supabase/supabase-js";

// Initialize admin Supabase client using service key to safely log event webhook data
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Serverless handler for Zoho ZeptoMail Webhooks
 * Endpoint: https://apnacoding.com/api/zeptomail-webhook
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. Optional Custom Secret Token Header validation
  const webhookSecret = process.env.ZEPTOMAIL_WEBHOOK_SECRET || "";
  const requestSecret = req.headers["x-zeptomail-secret"] || req.headers["authorization"];
  
  if (webhookSecret && requestSecret !== webhookSecret) {
    console.warn("[Webhook Warning] Unauthorized webhook request blocked.");
    return res.status(401).json({ error: "Unauthorized Header Token" });
  }

  try {
    const payload = req.body;

    if (!payload) {
      return res.status(400).json({ error: "Empty request payload" });
    }

    // 2. Parse Zoho's array-nested webhook payload structure
    const eventNames = payload.event_name || [];
    const eventMessages = payload.event_message || [];
    let loggedCount = 0;

    if (eventMessages.length > 0) {
      for (const msg of eventMessages) {
        const emailInfo = msg.email_info || {};
        const eventData = msg.event_data || [];

        const eventType = eventNames[0] || payload.event_type || "unknown";
        const mailId = msg.request_id || emailInfo.email_reference || null;
        const sender = emailInfo.from?.address || "noreply@apnacoding.com";
        const subject = emailInfo.subject || "No Subject";

        // Collect all recipients
        const recipientsArray = emailInfo.to || [];
        const recipient = recipientsArray.map((r: any) => r.email_address?.address || r.address).join(", ") || "unknown@recipient.com";

        // Extra details for softbounces / hardbounces / delivery
        let bounceType = null;
        let bounceReason = null;
        let timestampStr = emailInfo.processed_time || new Date().toISOString();

        if (eventData.length > 0) {
          const firstEvent = eventData[0];
          const details = firstEvent.details || [];
          if (details.length > 0) {
            bounceType = firstEvent.object || null;
            bounceReason = details[0].reason || details[0].diagnostic_message || null;
            if (details[0].time) {
              timestampStr = details[0].time;
            }
          }
        }

        console.log(`[ZeptoMail Webhook] Event logged: "${eventType}" for ${recipient}`);

        // 3. Save log to public.zeptomail_logs inside Supabase
        const { error } = await supabase
          .from("zeptomail_logs")
          .insert({
            event_type: eventType,
            mail_id: mailId,
            recipient: recipient,
            sender: sender,
            subject: subject,
            bounce_type: bounceType,
            bounce_reason: bounceReason,
            timestamp: new Date(timestampStr).toISOString(),
            raw_payload: payload
          });

        if (error) {
          console.error("[Webhook Database Error] Failed to write log:", error);
        } else {
          loggedCount++;
        }
      }
    } else {
      // Fallback for simple flat formats
      const eventType = payload.event_type || payload.event || "unknown";
      const mailId = payload.mail_id || null;
      const recipient = payload.recipient || "unknown@recipient.com";
      const sender = payload.sender || "noreply@apnacoding.com";
      const subject = payload.subject || "No Subject";
      
      const { error } = await supabase
        .from("zeptomail_logs")
        .insert({
          event_type: eventType,
          mail_id: mailId,
          recipient: recipient,
          sender: sender,
          subject: subject,
          timestamp: new Date().toISOString(),
          raw_payload: payload
        });
        
      if (!error) loggedCount++;
    }

    return res.status(200).json({ success: true, processedEvents: loggedCount });
  } catch (error: any) {
    console.error("[Webhook Processing Error]:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
