import { useMemo } from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import {
  ONCHAIN_CHAIN_NAME,
  ONCHAIN_REGISTRY_ADDRESS,
  OnchainCategory,
  OnchainProofsFile,
  contractUrl,
  proofFor,
  txUrl,
} from "@/lib/onchain-proof";
import proofsData from "@/data/onchain-proofs.json";

/**
 * Shows the Sepolia on-chain listing proof for a public listing: the listing's
 * public content was anchored on Sepolia at registration time. This is a
 * record/content proof only - not a verification of the opportunity's
 * legitimacy, its organizer, or any partnership.
 *
 * Renders nothing unless the listing has a registration transaction whose
 * stored content hash still matches the live listing row (see
 * src/lib/onchain-proof.ts). An edited listing loses its badge instead of
 * showing a stale proof, until it is re-registered on-chain.
 */
export function OnchainProofBadge({
  category,
  listing,
  className = "",
}: {
  category: OnchainCategory;
  listing: any;
  className?: string;
}) {
  const proof = useMemo(
    () => proofFor(proofsData as OnchainProofsFile, category, listing),
    [category, listing],
  );

  if (!proof) return null;

  const contractAddress =
    (proofsData as OnchainProofsFile).contract || ONCHAIN_REGISTRY_ADDRESS;

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm ${className}`}
      data-testid="onchain-proof-badge"
    >
      <ShieldCheck className="h-4 w-4 text-emerald-400" />
      <span className="text-emerald-300 font-medium">On-chain listing proof</span>
      <a
        href={txUrl(proof.txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/40 underline-offset-2"
      >
        Transaction
        <ExternalLink className="h-3 w-3" />
      </a>
      <span className="text-muted-foreground">·</span>
      <a
        href={contractUrl(contractAddress)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/40 underline-offset-2"
      >
        Contract
        <ExternalLink className="h-3 w-3" />
      </a>
      <span className="text-muted-foreground text-xs">({ONCHAIN_CHAIN_NAME})</span>
    </div>
  );
}
