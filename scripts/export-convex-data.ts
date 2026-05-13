import { ConvexHttpClient } from "convex/browser";
import { api } from "../src/convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../convex-export");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR);
}

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("VITE_CONVEX_URL not found in env");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function exportTable(tableName: string, query: any) {
  console.log(`Exporting ${tableName}...`);
  try {
    const data = await client.query(query);
    fs.writeFileSync(
      path.join(OUT_DIR, `${tableName}.json`),
      JSON.stringify(data, null, 2)
    );
    console.log(`Done exporting ${tableName}.`);
  } catch (err) {
    console.error(`Failed to export ${tableName}:`, err);
  }
}

async function main() {
  // We need to know which queries to call. 
  // This is tricky because Convex usually doesn't have a "get all" query for every table by default.
  // I'll check src/convex/ for existing queries.
  
  // For now, I'll just list the files in convex-export to see if any are exported.
  console.log("Starting export...");
  
  // Tables identified from schema:
  const tables = [
    "users", "aiJobs", "hackathons", "eventGroups", "events", 
    "hackathonTeams", "hackathonAnnouncements", "hackathonQuestions", 
    "hackathonSubmissions", "certificates", "jobs", "registrations", 
    "leaderboard", "communities", "communityPages", "referrals", 
    "products", "news"
  ];

  // This script assumes there are internal or public queries to get all data.
  // Since I don't know them yet, I'll have to find them or create them.
}

main();
