# On-chain listing proofs (Sepolia)

Every public Apna Coding listing is anchored on the `ApnaListingRegistry`
contract on the Ethereum **Sepolia testnet** (not mainnet; no real funds):

- Contract: [`0x84D6aB007816f678FCa2C19e43268043B3323254`](https://sepolia.etherscan.io/address/0x84D6aB007816f678FCa2C19e43268043B3323254) (source verified via Sourcify)
- One transaction per listing (`register`, or `update` when content changes)
- Registry owner/registrar: agent-managed deployer `0x136b93D62C4c9A229BaafB8A5AE9595dC404Ec49` (testnet-only key)

## What a proof means - and does not mean

The "On-chain listing proof" badge on a detail page means: **this exact public
listing content was anchored on Sepolia at the recorded time.** It is a
listing record / content proof. It is **not** a verification of the
opportunity's legitimacy, the organizer or employer, or any partnership.

## Reproducing a hash (v2)

The content hash is keccak256 over a canonical payload built by
`src/lib/onchain-canonical.js` - the single implementation shared by the
frontend badge and the registrar script (`scripts/register-listings-onchain.mjs`).

Payload lines (joined with `\n`):

1. `apna-coding-listing-v2`
2. category (`hackathon|job|news|event|community|product`)
3. listing id (Supabase row id)
4. canonical page URL (`https://www.apnacoding.com<category-path><slug-or-id>`)
5. one `field=value` line per field in `PROOF_FIELDS[category]`, sorted by
   field name. Values are canonicalized: NFC-normalized and trimmed strings,
   numbers/booleans stringified, arrays order-preserving, object keys sorted
   recursively, null/missing as "".

The field lists live in `PROOF_FIELDS` in `src/lib/onchain-canonical.js` and
are copied into `src/data/onchain-proofs.json` (`proofFields`) on every run.
They cover substantive public content: title/name, slug, description/body,
dates, location, prize/salary, links, tags/categories and public media
references.

**Excluded:** volatile counters (`views`, `likes`, `member_count`) so routine
traffic never invalidates proofs, and private/admin fields (`wallet_address`,
`organizer_wallet`, approval metadata, SEO fields, calendar ids). Nothing
private or draft is ever anchored: the registrar queries only the same public
rows the site displays (jobs/hackathons/events: all rows shown publicly;
news/communities: `is_published=true`; products: `status=approved AND
is_approved=true`), selecting only the hashed public columns.

## Keeping proofs honest

- Badge self-hides when the live row no longer matches the anchored hash, so
  an edited listing never shows a stale proof.
- A GitHub Actions workflow (`.github/workflows/onchain-sync.yml`) runs the
  registrar daily and on manual dispatch: registers new listings, updates
  edited ones, revokes (`--prune`) ones no longer public, and commits the
  refreshed `src/data/onchain-proofs.json` only when something changed.
  The deployer key lives in the `APNA_REGISTRY_DEPLOYER_KEY` repo secret; the
  workflow never runs on pull requests.
- `src/data/onchain-proofs.json` records each listing's tx hash, content hash,
  block and time; the badge links both the transaction and the contract on
  Sepolia Etherscan.
