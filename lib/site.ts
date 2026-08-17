const RAW =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.DOMAIN ? `https://${process.env.DOMAIN}` : null);

if (!RAW) {
  throw new Error("Missing NEXT_PUBLIC_SITE_URL or DOMAIN env var");
}

// Normalize: force https and strip any trailing slash.
let normalized = RAW;
if (normalized.startsWith("http://")) {
  normalized = `https://${normalized.slice("http://".length)}`;
}
normalized = normalized.replace(/\/+$/, "");

export const SITE_URL: string = normalized;
