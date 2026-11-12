#!/usr/bin/env node
/**
 * register-listings-onchain.mjs
 *
 * Anchors every public Apna Coding listing on the ApnaListingRegistry
 * contract (Ethereum Sepolia testnet), one transaction per listing, and
 * writes src/data/onchain-proofs.json for the site badges.
 *
 * Visibility rules mirror the public site exactly:
 *   hackathons, jobs, events  -> every row (the list pages apply no filter)
 *   news, communities         -> is_published = true
 *   products                  -> status = approved AND is_approved = true
 *
 * Only public directory fields are used (id, slug, name/title). No user
 * data, emails, wallet addresses or admin-only fields are read or stored.
 *
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/register-listings-onchain.mjs
 *   or
 *   DEPLOYER_KEY_FILE=/path/outside/repo.key node scripts/register-listings-onchain.mjs
 *
 * Optional env:
 *   SEPOLIA_RPC_URL   (default https://ethereum-sepolia-rpc.publicnode.com)
 *   REGISTRY_ADDRESS  (skip deploy, reuse an existing deployment)
 *
 * Re-run after publishing new listings or editing existing ones: new
 * listings get register(), edited ones get update(), and the proofs JSON is
 * rewritten. Listings removed from the site are NOT auto-revoked; pass
 * --prune to revoke proofs for IDs no longer public.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifact = JSON.parse(
  fs.readFileSync(path.join(root, "contracts/ApnaListingRegistry.json"), "utf8"),
);

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://yjgjfurrvyvhncjxqcre.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2pmdXJydnl2aG5janhxY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjQsImV4cCI6MjA5NDI2NTM2NH0.6n15TfLnuAfWCRF8oT2P0F5TooeiLHi3P79XpLF3o1I";
const RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const CHAIN_ID = 11155111;
const EXPLORER = "https://sepolia.etherscan.io";
const VERSION = "apna-coding-listing-v1";
const PRUNE = process.argv.includes("--prune");

const CATEGORY_ENUM = {
  hackathon: 0,
  job: 1,
  news: 2,
  event: 3,
  community: 4,
  product: 5,
};
const CATEGORY_PATH = {
  hackathon: "/hackathons/",
  job: "/jobs/",
  news: "/news/",
  event: "/events/",
  community: "/community/",
  product: "/products/",
};
const TABLES = [
  { category: "hackathon", table: "hackathons", filter: "", select: "id,title,name,slug" },
  { category: "job", table: "jobs", filter: "", select: "id,title,slug" },
  { category: "news", table: "news", filter: "&is_published=eq.true", select: "id,title,slug" },
  { category: "event", table: "events", filter: "", select: "id,title,slug" },
  { category: "community", table: "communities", filter: "&is_published=eq.true", select: "id,name,slug" },
  { category: "product", table: "products", filter: "&status=eq.approved&is_approved=eq.true", select: "id,name,slug" },
];

// ---- canonicalization (MUST match src/lib/onchain-proof.ts) ----
const norm = (v) =>
  String(v ?? "")
    .normalize("NFC")
    .trim();
const slugOf = (row) => norm(row.slug) || norm(row.id);
const titleOf = (row) => norm(row.title) || norm(row.name);
const pageUrlOf = (category, row) =>
  `https://www.apnacoding.com${CATEGORY_PATH[category]}${slugOf(row)}`;
const canonicalPayload = (category, row) =>
  [VERSION, category, norm(row.id), titleOf(row), norm(row.slug), pageUrlOf(category, row)].join("\n");
const contentHashOf = (category, row) =>
  ethers.keccak256(ethers.toUtf8Bytes(canonicalPayload(category, row)));

async function fetchRows(table, filter, select) {
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) throw new Error(`Supabase ${table}: HTTP ${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
  }
}

function readKey() {
  if (process.env.PRIVATE_KEY) return process.env.PRIVATE_KEY.trim();
  if (process.env.DEPLOYER_KEY_FILE) {
    const raw = fs.readFileSync(process.env.DEPLOYER_KEY_FILE, "utf8").trim();
    return raw.startsWith("0x") ? raw : `0x${raw}`;
  }
  throw new Error("Set PRIVATE_KEY or DEPLOYER_KEY_FILE (key file must live outside the repo)");
}

async function main() {
  const key = readKey();
  const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
  const wallet = new ethers.Wallet(key, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} SepETH`);
  if (balance === 0n) throw new Error("Deployer has no Sepolia ETH - fund it from a faucet first");

  // Deploy or reuse the registry. Resolution order: explicit env var, then the
  // registry recorded in the proofs file, then (first run only) a fresh deploy.
  // Without this a scheduled run would redeploy and orphan existing records.
  const proofsPath = path.join(root, "src/data/onchain-proofs.json");
  const existingProofs = fs.existsSync(proofsPath)
    ? JSON.parse(fs.readFileSync(proofsPath, "utf8"))
    : null;
  let address =
    process.env.REGISTRY_ADDRESS || (existingProofs && existingProofs.contract) || "";
  if (address) {
    const code = await provider.getCode(address);
    if (code === "0x") throw new Error(`No contract code at registry address ${address}`);
  }
  if (!address) {
    console.log("Deploying ApnaListingRegistry...");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy();
    const deployTx = contract.deploymentTransaction();
    console.log(`Deploy tx: ${deployTx.hash}`);
    await contract.waitForDeployment();
    address = await contract.getAddress();
    const receipt = await deployTx.wait(1);
    console.log(`Deployed at: ${address} (block ${receipt.blockNumber})`);
  } else {
    console.log(`Using existing registry: ${address}`);
  }
  const contract = new ethers.Contract(address, artifact.abi, wallet);

  // Existing proofs file (for idempotent re-runs)
  const proofs = existingProofs || { categories: {} };
  const proofsOriginalBytes = fs.existsSync(proofsPath)
    ? fs.readFileSync(proofsPath, "utf8")
    : null;
  proofs.contract = address;
  proofs.chainId = CHAIN_ID;
  proofs.explorer = EXPLORER;
  proofs.categories = proofs.categories || {};

  function flush() {
    proofs.generatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(proofsPath), { recursive: true });
    const tmp = proofsPath + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(proofs, null, 2) + "\n");
    fs.renameSync(tmp, proofsPath);
  }
  flush();

  let registered = 0,
    updated = 0,
    skipped = 0,
    revoked = 0;

  // Phase 1: decide what needs a transaction.
  const work = [];
  const seen = {};
  for (const { category, table, filter, select } of TABLES) {
    const rows = await fetchRows(table, filter, select);
    console.log(`\n${category}: ${rows.length} public rows from ${table}`);
    proofs.categories[category] = proofs.categories[category] || {};
    seen[category] = new Set(rows.map((r) => norm(r.id)));

    for (const row of rows) {
      const contentId = norm(row.id);
      const title = titleOf(row);
      const hash = contentHashOf(category, row);
      const existing = proofs.categories[category][contentId];
      if (existing && existing.contentHash.toLowerCase() === hash.toLowerCase()) {
        skipped++;
        continue;
      }
      let onchainId = 0n;
      try {
        onchainId = await contract.recordIds(
          await contract.keyFor(CATEGORY_ENUM[category], contentId),
        );
      } catch {
        onchainId = 0n;
      }
      work.push({
        category,
        contentId,
        title,
        hash,
        pageUrl: pageUrlOf(category, row),
        mode: onchainId === 0n ? "register" : "update",
      });
    }
  }

  // Phase 2: send transactions in bounded chunks (public RPC mempools drop
  // large per-account backlogs), waiting for each chunk to confirm.
  const CHUNK = 30;
  for (let start = 0; start < work.length; start += CHUNK) {
    const chunk = work.slice(start, start + CHUNK);
    console.log(`\nSending chunk ${start / CHUNK + 1} (${chunk.length} of ${work.length} remaining txs)...`);
    let nonce = await provider.getTransactionCount(wallet.address, "pending");
    const pending = [];
    for (const item of chunk) {
      const args = [CATEGORY_ENUM[item.category], item.contentId, item.hash, item.title];
      const tx =
        item.mode === "register"
          ? await contract.register(...args, { nonce: nonce++ })
          : await contract.update(...args, { nonce: nonce++ });
      console.log(`  sent ${item.mode} [${item.category}] ${item.title.slice(0, 60)} -> ${tx.hash}`);
      pending.push({ item, tx });
    }
    console.log("  waiting for confirmations...");
    for (const { item, tx } of pending) {
      const receipt = await tx.wait(1);
      if (Number(receipt.status) !== 1) throw new Error(`tx failed: ${tx.hash} (${item.category} ${item.contentId})`);
      const block = await provider.getBlock(receipt.blockNumber);
      proofs.categories[item.category][item.contentId] = {
        txHash: tx.hash,
        contentHash: item.hash,
        title: item.title,
        pageUrl: item.pageUrl,
        registeredAt: new Date(Number(block.timestamp) * 1000).toISOString(),
        blockNumber: Number(receipt.blockNumber),
      };
      item.mode === "register" ? registered++ : updated++;
      console.log(`  confirmed ${tx.hash} (block ${receipt.blockNumber})`);
      flush(); // incremental, so a re-run after interruption skips confirmed rows
    }
  }

  if (PRUNE) {
    for (const [category, entries] of Object.entries(proofs.categories)) {
      for (const contentId of Object.keys(entries)) {
        if (seen[category] && !seen[category].has(contentId)) {
          console.log(`  revoke: [${category}] ${contentId}`);
          const tx = await contract.revoke(CATEGORY_ENUM[category], contentId);
          await tx.wait(1);
          delete proofs.categories[category][contentId];
          revoked++;
        }
      }
    }
  }

  flush();

  // Keep the frontend contract constant in sync after a fresh deploy.
  const libPath = path.join(root, "src/lib/onchain-proof.ts");
  const lib = fs.readFileSync(libPath, "utf8");
  const patched = lib.replace(
    /export const ONCHAIN_REGISTRY_ADDRESS =\s*\n?\s*"0x[0-9a-fA-F]{40}" as const;.*/,
    `export const ONCHAIN_REGISTRY_ADDRESS =\n  "${address}" as const; // set by scripts/register-listings-onchain.mjs`,
  );
  if (patched !== lib) fs.writeFileSync(libPath, patched);

  if (
    proofsOriginalBytes !== null &&
    registered === 0 && updated === 0 && revoked === 0 &&
    !process.argv.includes("--prune-deploy")
  ) {
    // No listing state changed: keep the proofs file byte-identical so the
    // caller's git diff stays empty and no commit/redeploy is triggered.
    fs.writeFileSync(proofsPath, proofsOriginalBytes);
  }
  console.log(
    `\nDone. registered=${registered} updated=${updated} skipped=${skipped} revoked=${revoked}`,
  );
  console.log(`Registry: ${EXPLORER}/address/${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
