/**
 * Normalizes external image URLs, especially Google Drive and Dropbox links,
 * into direct, hotlinkable image stream URLs that can be rendered directly by <img> and CSS.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();

  // 1. Check for Google Drive URLs
  // Patterns:
  // - https://drive.google.com/file/d/{FILE_ID}/view...
  // - https://drive.google.com/open?id={FILE_ID}
  // - https://drive.google.com/uc?id={FILE_ID}
  // - https://docs.google.com/file/d/{FILE_ID}/...
  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    // Try matching /file/d/{ID}
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }

    // Try matching id={ID} query parameter
    const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (queryIdMatch && queryIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${queryIdMatch[1]}`;
    }
  }

  // 2. Check for Dropbox URLs (replace dl=0 with raw=1)
  if (trimmed.includes("dropbox.com")) {
    if (trimmed.includes("dl=0")) {
      return trimmed.replace("dl=0", "raw=1");
    }
    if (!trimmed.includes("raw=1")) {
      const separator = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${separator}raw=1`;
    }
  }

  return trimmed;
}
