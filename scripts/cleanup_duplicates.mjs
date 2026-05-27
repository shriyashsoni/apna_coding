import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================================================================
// ENVIRONMENT CONFIG LOADER
// ====================================================================
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  });
  return env;
}

const env = {
  ...loadEnv(path.resolve('.env')),
  ...loadEnv(path.resolve('.env.local'))
};
Object.assign(process.env, env);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERROR: Missing Supabase URL or credentials. Check your .env file.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanDuplicates() {
  console.log("==========================================================");
  console.log("🧹 DEDUPLICATING HACKATHONS & EVENTS DATABASE 🧹");
  console.log("==========================================================");

  // 1. DEDUPLICATE HACKATHONS
  console.log("\n🔍 Analyzing Hackathons...");
  try {
    const { data: hackathons, error: hErr } = await supabase
      .from('hackathons')
      .select('id, name, registration_link, created_at')
      .order('created_at', { ascending: true }); // keep oldest

    if (hErr) throw hErr;

    const seenNames = new Set();
    const seenLinks = new Set();
    const duplicateIds = [];

    for (const h of hackathons) {
      const cleanName = h.name.trim().toLowerCase();
      const cleanLink = h.registration_link ? h.registration_link.trim().toLowerCase().replace(/\/$/, "") : null;

      let isDuplicate = false;

      // Check name match
      if (seenNames.has(cleanName)) {
        isDuplicate = true;
      }
      
      // Check link match
      if (cleanLink && seenLinks.has(cleanLink)) {
        isDuplicate = true;
      }

      if (isDuplicate) {
        duplicateIds.push(h.id);
        console.log(`❌ Found duplicate Hackathon: "${h.name}" (ID: ${h.id})`);
      } else {
        seenNames.add(cleanName);
        if (cleanLink) seenLinks.add(cleanLink);
      }
    }

    if (duplicateIds.length > 0) {
      console.log(`\n🗑️ Deleting ${duplicateIds.length} duplicate hackathons...`);
      const { error: delErr } = await supabase
        .from('hackathons')
        .delete()
        .in('id', duplicateIds);

      if (delErr) throw delErr;
      console.log(`✅ Successfully deleted ${duplicateIds.length} duplicate hackathons!`);
    } else {
      console.log("✨ No duplicate hackathons found.");
    }

  } catch (err) {
    console.error(`⚠️ Error deduplicating hackathons: ${err.message}`);
  }

  // 2. DEDUPLICATE EVENTS
  console.log("\n🔍 Analyzing Events...");
  try {
    const { data: events, error: eErr } = await supabase
      .from('events')
      .select('id, title, registration_link, created_at')
      .order('created_at', { ascending: true });

    if (eErr) throw eErr;

    const seenTitles = new Set();
    const seenLinks = new Set();
    const duplicateIds = [];

    for (const e of events) {
      const cleanTitle = e.title.trim().toLowerCase();
      const cleanLink = e.registration_link ? e.registration_link.trim().toLowerCase().replace(/\/$/, "") : null;

      let isDuplicate = false;

      if (seenTitles.has(cleanTitle)) {
        isDuplicate = true;
      }

      if (cleanLink && seenLinks.has(cleanLink)) {
        isDuplicate = true;
      }

      if (isDuplicate) {
        duplicateIds.push(e.id);
        console.log(`❌ Found duplicate Event: "${e.title}" (ID: ${e.id})`);
      } else {
        seenTitles.add(cleanTitle);
        if (cleanLink) seenLinks.add(cleanLink);
      }
    }

    if (duplicateIds.length > 0) {
      console.log(`\n🗑️ Deleting ${duplicateIds.length} duplicate events...`);
      const { error: delErr } = await supabase
        .from('events')
        .delete()
        .in('id', duplicateIds);

      if (delErr) throw delErr;
      console.log(`✅ Successfully deleted ${duplicateIds.length} duplicate events!`);
    } else {
      console.log("✨ No duplicate events found.");
    }

  } catch (err) {
    console.error(`⚠️ Error deduplicating events: ${err.message}`);
  }

  // 3. DEDUPLICATE JOBS
  console.log("\n🔍 Analyzing Jobs...");
  try {
    const { data: jobs, error: jErr } = await supabase
      .from('jobs')
      .select('id, title, link, created_at')
      .order('created_at', { ascending: true });

    if (jErr) throw jErr;

    const seenJobTitles = new Set();
    const seenJobLinks = new Set();
    const duplicateIds = [];

    for (const j of jobs) {
      const cleanTitle = j.title.trim().toLowerCase();
      const cleanLink = j.link ? j.link.trim().toLowerCase().replace(/\/$/, "") : null;

      let isDuplicate = false;

      if (seenJobTitles.has(cleanTitle)) {
        isDuplicate = true;
      }

      if (cleanLink && seenJobLinks.has(cleanLink)) {
        isDuplicate = true;
      }

      if (isDuplicate) {
        duplicateIds.push(j.id);
        console.log(`❌ Found duplicate Job: "${j.title}" (ID: ${j.id})`);
      } else {
        seenJobTitles.add(cleanTitle);
        if (cleanLink) seenJobLinks.add(cleanLink);
      }
    }

    if (duplicateIds.length > 0) {
      console.log(`\n🗑️ Deleting ${duplicateIds.length} duplicate jobs...`);
      const { error: delErr } = await supabase
        .from('jobs')
        .delete()
        .in('id', duplicateIds);

      if (delErr) throw delErr;
      console.log(`✅ Successfully deleted ${duplicateIds.length} duplicate jobs!`);
    } else {
      console.log("✨ No duplicate jobs found.");
    }

  } catch (err) {
    console.error(`⚠️ Error deduplicating jobs: ${err.message}`);
  }

  console.log("\n==========================================================");
  console.log("🎉 DATABASE DEDUPLICATION PROCESS COMPLETE! 🎉");
  console.log("==========================================================");
}

cleanDuplicates();
