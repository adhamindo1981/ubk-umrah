/**
 * In-memory sliding window Rate Limiter for Node.js / Next.js Server Route Handlers
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks if a specific key has exceeded the allowed limit within windowSec seconds.
 * @param key Unique identifier (e.g. IP + action)
 * @param limit Maximum allowed requests
 * @param windowSec Window duration in seconds
 * @returns true if rate limited (rejected), false if allowed
 */
export function isRateLimited(
  key: string,
  limit: number = 10,
  windowSec: number = 300
): boolean {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const record = rateLimitStore.get(key);

  // Evict stale entries if map gets too large
  if (rateLimitStore.size > 2000) {
    rateLimitStore.forEach((v, k) => {
      if (now > v.resetTime) rateLimitStore.delete(k);
    });
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}
