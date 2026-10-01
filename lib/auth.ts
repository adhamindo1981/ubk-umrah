import bcrypt from "bcryptjs";

/**
 * Hash a plain‑text password.
 * Uses bcrypt with a cost factor of 12 (secure yet performant).
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain‑text password with a stored bcrypt hash.
 * Returns true when the password matches, false otherwise.
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
