import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Simple env parser
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error("No .env file found at:", envPath);
    return {};
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      env[key] = value;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || "https://yjgjfurrvyvhncjxqcre.supabase.co";
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing in your .env file!");
  process.exit(1);
}

console.log("Connecting to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log("Creating/updating 'event-footages' storage bucket...");
  
  const { data, error } = await supabase.storage.createBucket("event-footages", {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/quicktime",
      "video/webm"
    ]
  });

  if (error) {
    if (error.message && error.message.includes("already exists")) {
      console.log("✅ Bucket 'event-footages' already exists.");
    } else {
      console.error("❌ Error creating bucket:", error);
    }
  } else {
    console.log("✅ Storage bucket 'event-footages' created successfully:", data);
  }
}

setup().catch(console.error);
