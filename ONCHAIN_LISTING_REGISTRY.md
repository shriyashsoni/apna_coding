# On-chain Listing Registry (Sepolia testnet)

Every public listing on apnacoding.com — hackathons, jobs, news, events,
communities and products — is anchored on the **ApnaListingRegistry** smart
contract on the Ethereum **Sepolia testnet**, with **one transaction per
listing**. Each listing's detail page shows an "On-chain proof" badge linking
to its registration transaction and to the registry contract.

This is a testnet notarization feature. No real funds are involved and no
user data is ever written on-chain.

## What is stored on-chain

For each listing, exactly four public directory fields:

- `category` — hackathon / job / news / event / community / product
- `contentId` — the listing's public Supabase row ID (the same UUID that
  appears in the page URL)
- `title` — the public listing title
- `contentHash` — keccak256 of a canonical payload (below), so edits are
  detectable

No emails, wallet addresses, user accounts, drafts or admin-only fields are
read or stored. Registrations cover only records the public site renders:

| Table       | Public filter used                                  |
| ----------- | --------------------------------------------------- |
| hackathons  | all rows (list page applies no filter)              |
| jobs        | all rows (list page applies no filter)              |
| events      | all rows (list page applies no filter)              |
| news        | `is_published = true`                               |
| communities | `is_published = true`                               |
| products    | `status = approved` and `is_approved = true`        |

## Content hash canonicalization

The hash is reproducible by anyone:

```
keccak256( UTF8( [
  "apna-coding-listing-v1",
  category,     // e.g. "hackathon"
  contentId,    // Supabase row id (uuid)
  title,        // NFC-normalized, trimmed (title, falling back to name)
  slug,         // NFC-normalized, trimmed ("" when the row has no slug)
  pageUrl       // https://www.apnacoding.com/<section>/<slug-or-id>
].join("\n") ) )
```

Implemented once in `src/lib/onchain-proof.ts` (frontend) and mirrored in
`scripts/register-listings-onchain.mjs`. The badge recomputes the hash from
the live listing row and renders only when it matches the anchored hash, so
an edited listing never shows a stale proof — the badge hides until the
listing is re-registered.

## Contract

- Source: `contracts/ApnaListingRegistry.sol`
- Artifact: `contracts/ApnaListingRegistry.json`
- Network: Ethereum Sepolia (chain ID 11155111)
- `register(category, contentId, contentHash, title)` — one call per new
  listing
- `update(...)` — re-anchor after an edit
- `revoke(category, contentId)` — mark a removed listing
- Roles: `owner` can transfer ownership and change the `registrar`; only the
  registrar (or owner) can write records. Ownership starts with the deployer
  wallet and can be transferred to the platform owner's wallet with
  `transferOwnership(...)` once that address is confirmed.

The registrar key is a testnet-only wallet stored in the Instinct Vault. It
holds no real funds and its only power is writing/updating records on this
Sepolia contract.

## Registering listings

```bash
# from the repo root; key file must live OUTSIDE the repo
DEPLOYER_KEY_FILE=/secure/path/apna-sepolia-deployer.key \
  node scripts/register-listings-onchain.mjs
```

- First run deploys the contract, prints the address and updates
  `src/lib/onchain-proof.ts` + `src/data/onchain-proofs.json`.
- Re-runs are idempotent: unchanged listings are skipped, new listings are
  registered, edited listings are updated. Add `--prune` to revoke listings
  that are no longer public.
- Optional env: `SEPOLIA_RPC_URL`, `REGISTRY_ADDRESS` (reuse a deployment).

After the script runs, commit `src/data/onchain-proofs.json` and
`src/lib/onchain-proof.ts` so the badges ship with the site.

## Ongoing coverage

New or edited listings do not anchor themselves automatically: publishing
through the admin portal writes to the database only. To keep proofs
complete, re-run the script after each publishing session (it is
idempotent and only pays gas for new/changed rows). A listing that was
edited but not yet re-registered simply shows no badge — never a false one.
