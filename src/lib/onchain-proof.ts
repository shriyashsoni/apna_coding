import { keccak256, toUtf8Bytes } from "ethers";

/**
 * On-chain listing proofs (Sepolia testnet).
 *
 * Every public listing (hackathon, job, news, event, community, product) is
 * anchored on the ApnaListingRegistry contract with one transaction per
 * listing. The contract stores only public directory fields: the listing's
 * Supabase ID, its title and a keccak256 content hash.
 *
 * The content hash is computed over a canonical payload so anyone can
 * reproduce it:
 *
 *   keccak256( UTF8( [
 *     "apna-coding-listing-v1",
 *     category,            // "hackathon" | "job" | "news" | "event" | "community" | "product"
 *     contentId,           // Supabase row id (uuid)
 *     title,               // NFC-normalized, trimmed
 *     slug,                // NFC-normalized, trimmed, "" when the row has no slug
 *     pageUrl              // canonical public page URL
 *   ].join("\n") ) )
 *
 * The badge on each listing page recomputes this hash from the live listing
 * row and only renders when it matches the hash captured in the registration
 * transaction. If a listing is edited after anchoring, the badge hides itself
 * instead of attesting stale content, until the listing is re-registered.
 */

export type OnchainCategory =
  | "hackathon"
  | "job"
  | "news"
  | "event"
  | "community"
  | "product";

export const ONCHAIN_PROOF_VERSION = "apna-coding-listing-v1";

export const ONCHAIN_CHAIN_ID = 11155111; // Ethereum Sepolia testnet
export const ONCHAIN_CHAIN_NAME = "Sepolia testnet";
export const ONCHAIN_REGISTRY_ADDRESS =
  "0x84D6aB007816f678FCa2C19e43268043B3323254" as const; // set by scripts/register-listings-onchain.mjs
export const ONCHAIN_EXPLORER = "https://sepolia.etherscan.io";

const CATEGORY_PATH: Record<OnchainCategory, string> = {
  hackathon: "/hackathons/",
  job: "/jobs/",
  news: "/news/",
  event: "/events/",
  community: "/community/",
  product: "/products/",
};

export function normalizeField(value: unknown): string {
  return String(value ?? "")
    .normalize("NFC")
    .trim();
}

export function listingSlug(category: OnchainCategory, listing: any): string {
  // Mirrors how the site's cards build detail links: slug when present, id otherwise.
  return normalizeField(listing?.slug) || normalizeField(listing?.id);
}

export function listingTitle(category: OnchainCategory, listing: any): string {
  // hackathons/communities/products use `name`; jobs/news/events use `title`.
  return normalizeField(listing?.title) || normalizeField(listing?.name);
}

export function listingPageUrl(category: OnchainCategory, listing: any): string {
  return `https://www.apnacoding.com${CATEGORY_PATH[category]}${listingSlug(category, listing)}`;
}

export function canonicalProofPayload(category: OnchainCategory, listing: any): string {
  return [
    ONCHAIN_PROOF_VERSION,
    category,
    normalizeField(listing?.id),
    listingTitle(category, listing),
    normalizeField(listing?.slug),
    listingPageUrl(category, listing),
  ].join("\n");
}

export function contentHashOf(category: OnchainCategory, listing: any): string {
  return keccak256(toUtf8Bytes(canonicalProofPayload(category, listing)));
}

export interface OnchainProof {
  txHash: string;
  contentHash: string;
  title: string;
  pageUrl: string;
  registeredAt: string; // ISO time of the confirmed transaction
  blockNumber: number;
}

export type OnchainProofsFile = {
  contract: string;
  chainId: number;
  explorer: string;
  generatedAt: string;
  categories: {
    [category: string]: {
      [contentId: string]: OnchainProof;
    };
  };
};

export function proofFor(
  proofs: OnchainProofsFile | null | undefined,
  category: OnchainCategory,
  listing: any,
): OnchainProof | null {
  if (!proofs || !listing?.id) return null;
  const proof = proofs.categories?.[category]?.[normalizeField(listing.id)];
  if (!proof) return null;
  // Only attest when the live row still matches the anchored content.
  if (proof.contentHash.toLowerCase() !== contentHashOf(category, listing).toLowerCase()) return null;
  return proof;
}

export function txUrl(txHash: string): string {
  return `${ONCHAIN_EXPLORER}/tx/${txHash}`;
}

export function contractUrl(address: string): string {
  return `${ONCHAIN_EXPLORER}/address/${address}`;
}
