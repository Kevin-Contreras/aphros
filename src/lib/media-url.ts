/** True when the URL points at a Vercel Blob private/public store. */
export function isVercelBlobUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/**
 * Convert a stored image URL into something the browser/email can load.
 * Private Blob URLs are served through /api/media.
 */
export function toPublicImageUrl(
  imageUrl: string | null | undefined,
  siteOrigin?: string,
): string | null {
  if (!imageUrl) return null;

  if (isVercelBlobUrl(imageUrl)) {
    const path = `/api/media?u=${encodeURIComponent(imageUrl)}`;
    if (!siteOrigin) return path;
    const base = siteOrigin.replace(/\/$/, "");
    return `${base}${path}`;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (!siteOrigin) return imageUrl;
  const base = siteOrigin.replace(/\/$/, "");
  return imageUrl.startsWith("/") ? `${base}${imageUrl}` : `${base}/${imageUrl}`;
}

export function getSiteOrigin() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";
  if (!raw) return "";
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw.replace(/\/$/, "")}`;
}
