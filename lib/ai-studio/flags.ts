/**
 * Feature flag checker for the AI Studio module.
 * Defaults to true unless explicitly disabled via NEXT_PUBLIC_ENABLE_AI_STUDIO="false".
 */
export function isAiStudioEnabled(): boolean {
  if (typeof process !== "undefined" && process.env) {
    const flag =
      process.env.NEXT_PUBLIC_ENABLE_AI_STUDIO ||
      process.env.ENABLE_AI_STUDIO;
    if (flag === "false" || flag === "0") {
      return false;
    }
  }
  return true;
}
