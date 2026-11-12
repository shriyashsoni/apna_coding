// Shared on-chain listing canonicalization (v2).
//
// SINGLE SOURCE OF TRUTH imported by BOTH the frontend
// (src/lib/onchain-proof.ts) and the registrar script
// (scripts/register-listings-onchain.mjs). Do not copy this logic elsewhere.
//
// The content hash covers the substantive PUBLIC content of a listing as
// shown on its detail page: identity (id, slug, page URL), title, body,
// dates, location, prize/salary, links, and public media references.
// Deliberately EXCLUDED:
//   - volatile counters (views, likes, member_count) so routine traffic does
//     not invalidate proofs;
//   - private/admin fields (wallets, approval metadata, SEO, calendar ids).
//
// Anyone can reproduce a hash: take the listing row's public fields listed in
// PROOF_FIELDS, canonicalize each value (deepCanonical), and keccak256 the
// payload built by canonicalPayload below.

import { keccak256, toUtf8Bytes } from "ethers";

export const ONCHAIN_PROOF_VERSION = "apna-coding-listing-v2";

export const CATEGORY_PATH = {
  hackathon: "/hackathons/",
  job: "/jobs/",
  news: "/news/",
  event: "/events/",
  community: "/community/",
  product: "/products/",
};

// Substantive public fields hashed per category (real table columns only).
export const PROOF_FIELDS = {
  hackathon: [
    "name", "title", "slug", "description",
    "start_date", "end_date", "registration_deadline", "timezone",
    "location", "location_type", "mode", "conducting_type",
    "difficulty", "eligibility", "organized_by", "organizer_name",
    "capacity", "max_team_size", "prize_pool", "prizes", "tags",
    "status", "is_cancelled",
    "image", "image_url", "banner_image",
    "external_url", "registration_link", "virtual_url",
  ],
  job: [
    "title", "slug", "company", "description", "location", "salary",
    "type", "link", "external_url", "registration_link", "image_url",
    "status",
  ],
  news: [
    "title", "slug", "content", "author", "category",
    "cover_image", "image_url", "website_url", "external_url",
    "registration_link", "status",
  ],
  event: [
    "title", "slug", "description", "date", "timezone",
    "location", "location_type", "conducting_type", "type",
    "organizer_name", "capacity",
    "registration_link", "external_url", "virtual_url", "website_url",
    "image", "image_url", "is_cancelled", "is_side_event",
  ],
  community: [
    "name", "slug", "tagline", "description", "about", "full_description",
    "mission", "vision", "values", "category", "founded", "features",
    "tags", "website", "twitter", "github", "discord", "telegram",
    "logo", "cover_image", "image_url", "partner_category",
    "partnership_type",
  ],
  product: [
    "name", "slug", "description", "category",
    "website_url", "github_url", "external_url", "image_url", "status",
  ],
};

/** NFC-normalize + trim a scalar; null/undefined become "". */
export function norm(value) {
  return String(value ?? "").normalize("NFC").trim();
}

/**
 * Canonical string for any JSON-ish value:
 * null/undefined -> "", strings NFC-trimmed, numbers/booleans stringified,
 * arrays order-preserving, object keys sorted recursively.
 */
export function deepCanonical(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return norm(value);
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(deepCanonical).join(",") + "]";
  }
  if (typeof value === "object") {
    const keys = Object.keys(value).sort();
    return (
      "{" +
      keys.map((k) => JSON.stringify(k) + ":" + deepCanonical(value[k])).join(",") +
      "}"
    );
  }
  return norm(value);
}

/** Slug the site's cards use for the detail link: slug when present, id otherwise. */
export function slugOf(row) {
  return norm(row?.slug) || norm(row?.id);
}

/** hackathons/communities/products use `name`; jobs/news/events use `title`. */
export function titleOf(row) {
  return norm(row?.title) || norm(row?.name);
}

export function pageUrlOf(category, row) {
  return `https://www.apnacoding.com${CATEGORY_PATH[category]}${slugOf(row)}`;
}

/**
 * Canonical payload: one "field=value" line per PROOF_FIELDS entry (sorted by
 * field name), under a version/category/id/pageUrl header. Missing fields
 * canonicalize to "" so the schema is stable across category shapes.
 */
export function canonicalPayload(category, row) {
  const fields = (PROOF_FIELDS[category] || [])
    .slice()
    .sort()
    .map((f) => `${f}=${deepCanonical(row?.[f])}`);
  return [
    ONCHAIN_PROOF_VERSION,
    category,
    norm(row?.id),
    pageUrlOf(category, row),
    ...fields,
  ].join("\n");
}

export function contentHashOf(category, row) {
  return keccak256(toUtf8Bytes(canonicalPayload(category, row)));
}
