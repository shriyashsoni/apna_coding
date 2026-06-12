import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Simple env parser
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envDefaultPath = path.resolve(process.cwd(), ".env");
  const activePath = fs.existsSync(envPath) ? envPath : envDefaultPath;
  
  if (!fs.existsSync(activePath)) {
    console.error("No .env or .env.local file found!");
    return {};
  }
  const content = fs.readFileSync(activePath, "utf-8");
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
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing in your environment configuration!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("=========================================================================");
  console.log("             APNA CODING - HOSTED EVENT PLATFORM INITIALIZER             ");
  console.log("=========================================================================");
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  // Create / verify storage bucket for event footages & images
  console.log("\n1. Verifying storage buckets...");
  const { data, error } = await supabase.storage.createBucket("event-footages", {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
  });

  if (error) {
    if (error.message && error.message.includes("already exists")) {
      console.log("✅ Bucket 'event-footages' is active and configured.");
    } else {
      console.error("❌ Error setting up storage bucket:", error.message);
    }
  } else {
    console.log("✅ Created 'event-footages' public storage bucket successfully.");
  }

  console.log("\n2. Database Migration Instructions:");
  console.log("-------------------------------------------------------------------------");
  console.log("Please copy the contents of the migration file:");
  console.log("👉 create_luma_event_platform.sql");
  console.log("\nAnd execute it inside the Supabase SQL Editor:");
  console.log(`🔗 https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql/new`);
  console.log("-------------------------------------------------------------------------");
  console.log("This will initialize the following tables:");
  console.log(" - registrations       (tracks attendees, custom answers, status gates)");
  console.log(" - registration_fields (tracks custom questions for RSVP forms)");
  console.log(" - calendars           (handles host organization branding)");
  console.log(" - calendar_follows    (tracks user subscriptions to organizer calendars)");
  console.log("=========================================================================\n");
}

run().catch(console.error);
