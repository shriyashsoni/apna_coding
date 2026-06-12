import { supabase } from "@/lib/supabase";

const PROXIES = [
  "https://corsproxy.io/?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
];

/**
 * Downloads a remote image (directly or via CORS proxies) and uploads it to the Supabase 'event-footages' storage bucket.
 * Returns the public URL of the uploaded image on success, or the original URL on failure.
 */
export async function uploadRemoteImageToSupabase(
  imageUrl: string,
  folder: "events" | "hackathons" | "jobs" | "news" | "communities" | "products" = "events"
): Promise<string> {
  if (!imageUrl) return "";

  // If the image is already a Supabase Storage URL, don't download and re-upload it
  if (imageUrl.includes("supabase.co/storage")) {
    return imageUrl;
  }

  let blob: Blob | null = null;
  let lastError: any = null;

  // 1. Try direct fetch first
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      blob = await response.blob();
    }
  } catch (err) {
    lastError = err;
  }

  // 2. Try proxies if direct fetch failed
  if (!blob) {
    for (const proxy of PROXIES) {
      try {
        const targetUrl = `${proxy}${encodeURIComponent(imageUrl)}`;
        const response = await fetch(targetUrl);
        if (response.ok) {
          blob = await response.blob();
          if (blob && blob.size > 0 && blob.type.startsWith("image/")) {
            break;
          }
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  // 3. Fallback to a third proxy (allorigins) which returns content in JSON
  if (!blob) {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(imageUrl)}`);
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

  if (!blob || blob.size === 0) {
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
