/**
 * Response Parsers
 * Parse and clean AI responses
 */

import type { ParsedResponse } from "./types";

/**
 * Parse AI response to extract SQL and explanation
 */
export function parseAiResponse(response: string): ParsedResponse {
  const sqlMatch = response.match(/SQL:\s*([\s\S]+?)(?=EXPLANATION:|$)/i);
  const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]+?)$/i);

  let sql = sqlMatch ? sqlMatch[1].trim() : response.trim();
  const explanation = explanationMatch ? explanationMatch[1].trim() : "";

  // Clean up SQL - remove markdown code blocks and trailing semicolon
  sql = sql
    .replace(/```sql\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/;$/, "")
    .trim();

  return { sql, explanation };
}

/**
 * Check if error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : "";
  const hasStatus429 =
    typeof error === "object" && "status" in error && error.status === 429;

  return (
    hasStatus429 ||
    errorMessage.includes("429") ||
    errorMessage.includes("rate limit") ||
    errorMessage.includes("quota")
  );
}
