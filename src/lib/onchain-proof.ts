import {
  ONCHAIN_PROOF_VERSION,
  PROOF_FIELDS,
  canonicalPayload,
  contentHashOf as sharedContentHashOf,
  deepCanonical,
  norm,
  pageUrlOf,
  slugOf,
  titleOf,
} from "./onchain-canonical.js";

/**
 * On-chain listing proofs (Sepolia testnet).
 *
 * Every public listing (hackathon, job, news, event, community, product) is
 * anchored on the ApnaListingRegistry contract with one transaction per
 * listing. The contract stores only public directory fields: the listing's
 * Supabase ID, its title and a keccak256 content hash.
 *
 * The content hash (v2) covers the substantive PUBLIC content shown on the
 * detail page - identity, title, body/description, dates, location,
 * prize/salary, links and public media references - canonicalized by
 * src/lib/onchain-canonical.js, the single implementation shared with the
 * registrar script. Volatile counters (views, likes, member_count) and
 * private/admin fields (wallets, approval metadata) are deliberately
 * excluded.
 *
 * The badge on each listing page recomputes this hash from the live listing
 * row and only renders when it matches the hash captured in the registration
 * transaction. It is a listing record/content proof: it attests that this
 * public listing content was anchored on Sepolia at a point in time. It is
 * NOT a verification of the opportunity's legitimacy, the organizer, or any
 * partnership. An edited listing loses its badge instead of showing a stale
 * proof, until it is re-registered on-chain.
 */

export type OnchainCategory =
  | "hackathon"
  | "job"
  | "news"
  | "event"
  | "community"
  | "product";

// Re-export the shared canonicalization so existing imports keep working.
export {
  ONCHAIN_PROOF_VERSION,
  PROOF_FIELDS,
  canonicalPayload as canonicalProofPayload,
  deepCanonical,
  norm as normalizeField,
  pageUrlOf as listingPageUrl,
  slugOf as listingSlug,
  titleOf as listingTitle,
};
export { canonicalPayload };

export const ONCHAIN_CHAIN_ID = 11155111; // Ethereum Sepolia testnet
export const ONCHAIN_CHAIN_NAME = "Sepolia testnet";
export const ONCHAIN_REGISTRY_ADDRESS =
  "0x84D6aB007816f678FCa2C19e43268043B3323254" as const; // set by scripts/register-listings-onchain.mjs
export const ONCHAIN_EXPLORER = "https://sepolia.etherscan.io";

export function contentHashOf(category: OnchainCategory, listing: any): string {
  return sharedContentHashOf(category, listing);
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
  version?: string;
  proofFields?: { [category: string]: string[] };
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
  const proof = proofs.categories?.[category]?.[norm(listing.id)];
  if (!proof) return null;
  // Only attest when the live row still matches the anchored content.
  if (
    proof.contentHash.toLowerCase() !==
    sharedContentHashOf(category, listing).toLowerCase()
  )
    return null;
  return proof;
}

export function txUrl(txHash: string): string {
  return `${ONCHAIN_EXPLORER}/tx/${txHash}`;
}

export function contractUrl(address: string): string {
  return `${ONCHAIN_EXPLORER}/address/${address}`;
}
