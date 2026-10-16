/**
 * Securely retrieves the authentication secret for NextAuth and JWT verification.
 * Safe for both Edge Middleware and Node.js Server runtimes.
 */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: NEXTAUTH_SECRET or JWT_SECRET must be set in production environment!"
      );
    }
    return "dev-only-insecure-secret-key-32-chars-minimum-ubk-local";
  }
  return secret.trim();
}
