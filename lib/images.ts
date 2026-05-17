export const PROFILE_PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

export function normalizeImageUrl(
  value?: string | null,
  fallback = ""
): string {
  if (!value) return fallback;

  const imageUrl = String(value)
    .trim()
    .replace(/\\\//g, "/")
    .replace(/^["']|["']$/g, "");

  if (!imageUrl || imageUrl.includes("via.placeholder.com")) {
    return fallback;
  }

  if (
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("//")) {
    return `https:${imageUrl}`;
  }

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

  if (imageUrl.startsWith("/storage/")) {
    return `${backendUrl}${imageUrl}`;
  }

  if (imageUrl.startsWith("storage/")) {
    return backendUrl ? `${backendUrl}/${imageUrl}` : `/${imageUrl}`;
  }

  if (imageUrl.startsWith("/")) {
    return backendUrl ? `${backendUrl}${imageUrl}` : imageUrl;
  }

  return backendUrl ? `${backendUrl}/storage/${imageUrl}` : `/storage/${imageUrl}`;
}

export function getBrowserImageSrc(value?: string | null): string {
  const imageUrl = normalizeImageUrl(value);

  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }

  return imageUrl;
}
