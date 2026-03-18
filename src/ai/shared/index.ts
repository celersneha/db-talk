/**
 * AI Query Generator (Shared)
 * Main orchestrator with automatic provider fallback
 * Works across all database types
 */

import type { GenerateQueryParams, GenerateQueryResult } from "./types";
import { generateWithGemini } from "./providers/gemini";
import { generateWithMistral } from "./providers/mistral";

/**
 * Generate SQL query with automatic fallback from Gemini to Mistral
 * This is the main entry point for AI-powered SQL generation
 */
export async function generateSqlQuery(
  params: GenerateQueryParams,
): Promise<GenerateQueryResult> {
  try {
    // Try Gemini first
    return await generateWithGemini(params);
  } catch (error: unknown) {
    // If rate limit error, fallback to Mistral
    if (error instanceof Error && error.message === "RATE_LIMIT") {
      console.log("Gemini rate limit hit, falling back to Mistral");

      try {
        return await generateWithMistral(params);
      } catch (mistralError) {
        return {
          sql: "",
          error:
            mistralError instanceof Error
              ? mistralError.message
              : "Failed to generate query with both providers",
        };
      }
    }

    // For other errors, return error message
    return {
      sql: "",
      error:
        error instanceof Error ? error.message : "Failed to generate query",
    };
  }
}

// Re-export types for convenience
export type { GenerateQueryParams, GenerateQueryResult } from "./types";
