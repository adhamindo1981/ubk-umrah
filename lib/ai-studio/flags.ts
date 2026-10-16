/**
 * Feature flag checker for the AI Studio module.
 * Defaults to true unless explicitly disabled via NEXT_PUBLIC_ENABLE_AI_STUDIO="false".
 */
export function isAiStudioEnabled(): boolean {
  // If explicitly set to "false" or "0", disable it. Otherwise it is enabled by default.
  if (process.env.NEXT_PUBLIC_ENABLE_AI_STUDIO === "false" || process.env.NEXT_PUBLIC_ENABLE_AI_STUDIO === "0") {
    return false;
  }
  return true;
}
