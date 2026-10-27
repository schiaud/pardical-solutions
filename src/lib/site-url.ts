/** Canonical public URL of pardical.com (SITE_URL in production; defaults to https://pardical.com). */
export function siteUrl(): string {
  return (process.env.SITE_URL || "https://pardical.com").replace(/\/$/, "");
}
