import { supabase } from "@/lib/supabase";

const PROXIES = [
  "https://corsproxy.io/?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
];

// images.weserv.nl is an image-only proxy: it fetches the target server-side
// and returns re-encoded image bytes with permissive CORS headers. It is the
// most reliable path for CDNs (e.g. cdn.ethglobal.com) that send
// Cross-Origin-Resource-Policy headers blocking direct browser fetches.
const weservUrl = (imageUrl: string) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl.replace(/^https?:\/\//, ""))}`;

// Mirror safety bounds: public http(s) image URLs only, no credentials ever
// leave the browser, and oversized/non-image payloads are refused.
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
const isImageBlob = (b: Blob | null): b is Blob =>
  !!b && b.size > 0 && b.size <= MAX_IMAGE_BYTES && b.type.startsWith("image/");

/**
 * Downloads a remote image (directly or via CORS proxies) and uploads it to the Supabase 'event-footages' storage bucket.
 * Returns the public URL of the uploaded image on success, or the original URL on failure.
 */
export async function uploadRemoteImageToSupabase(
  imageUrl: string,
  folder: "events" | "hackathons" | "jobs" | "news" | "communities" | "products" = "events"
): Promise<string> {
  if (!imageUrl) return "";

  // Only plain public http(s) URLs may be mirrored - never file:, data:, javascript:, etc.
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      console.warn(`[ImageUploader] Refusing to mirror non-http(s) URL: ${imageUrl}`);
      return imageUrl;
    }
  } catch {
    return imageUrl;
  }

  // If the image is already a Supabase Storage URL, don't download and re-upload it
  if (imageUrl.includes("supabase.co/storage")) {
    return imageUrl;
  }

  let blob: Blob | null = null;
  let lastError: any = null;

  // 1. Try direct fetch first. credentials:"omit" guarantees no cookies/auth
  // headers are attached, even if the URL ever points back at our own origin.
  try {
    const response = await fetch(imageUrl, { credentials: "omit" });
    if (response.ok) {
      const candidate = await response.blob();
      if (isImageBlob(candidate)) {
        blob = candidate;
      }
    }
  } catch (err) {
    lastError = err;
  }

  // 2. Try the image proxy first (purpose-built for images), then generic proxies.
  // The proxies receive only the encoded target URL - no request headers from us.
  if (!blob) {
    try {
      const response = await fetch(weservUrl(imageUrl), { credentials: "omit" });
      if (response.ok) {
        const candidate = await response.blob();
        if (isImageBlob(candidate)) {
          blob = candidate;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  // 3. Generic proxies if the image proxy failed
  if (!blob) {
    for (const proxy of PROXIES) {
      try {
        const targetUrl = `${proxy}${encodeURIComponent(imageUrl)}`;
        const response = await fetch(targetUrl, { credentials: "omit" });
        if (response.ok) {
          const candidate = await response.blob();
          if (isImageBlob(candidate)) {
            blob = candidate;
            break;
          }
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  // 4. Fallback to a third proxy (allorigins) which returns content in JSON
  if (!blob) {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(imageUrl)}`, { credentials: "omit" });
      if (response.ok) {
        const data = await response.json();
        if (data.contents) {
          // If allorigins successfully returned base64 or HTML contents
          const match = data.contents.match(/^data:(image\/[a-zA-Z+-\.]+);base64,(.+)$/);
          if (match) {
            const contentType = match[1];
            const base64Data = match[2];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: contentType });
          }
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!isImageBlob(blob)) {
    console.warn(`[ImageUploader] Failed to download remote image (${imageUrl}), using fallback. Error:`, lastError);
    return imageUrl; // Fallback to original URL
  }

  try {
    const fileExt = blob.type.split("/")[1] || "jpg";
    // Clean ext
    const cleanExt = fileExt.includes("+") ? fileExt.split("+")[0] : fileExt;
    const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from("event-footages")
      .upload(fileName, blob, {
        contentType: blob.type,
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("event-footages")
      .getPublicUrl(fileName);

    console.log(`[ImageUploader] Scraped image uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("[ImageUploader] Error uploading image to Supabase:", error);
    return imageUrl; // Fallback to original URL
  }
}
