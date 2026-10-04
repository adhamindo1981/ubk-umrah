/**
 * Normalizes and resolves the clean, official public domain for marketing and login links.
 * Automatically sanitizes Vercel preview deployment URLs (*-projects.vercel.app) to prevent
 * prompting external users/pilgrims/marketers with Vercel's "Deployment Protection / Log in to Vercel" screen.
 */
export function getPublicBaseUrl(reqOrOrigin?: string): string {
  // 1. Explicitly configured public URL environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
  }

  // 2. Vercel Project Production URL (set automatically by Vercel for production deployments)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL.trim() !== "") {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, "")}`;
  }

  // 3. Fallback inspection of the incoming origin/host
  if (reqOrOrigin) {
    const raw = reqOrOrigin.trim();
    const host = raw.replace(/^https?:\/\//, "").replace(/\/$/, "");

    // Local development preservation
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return raw.startsWith("http") ? raw.replace(/\/$/, "") : `http://${host}`;
    }

    // If host is a Vercel preview deployment hash, force the official clean production domain
    if (host.includes("-projects.vercel.app") || (host.includes(".vercel.app") && host !== "ubk-umrah.vercel.app")) {
      return "https://ubk-umrah.vercel.app";
    }

    // Custom custom domain (e.g. ubkumrah.com)
    return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${host}`;
  }

  // Default official production domain
  return "https://ubk-umrah.vercel.app";
}
