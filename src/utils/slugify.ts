/**
 * Utility to generate SEO-friendly slugs from strings
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, ''); // Trim - from ends
}
