/**
 * AI Configuration (Shared)
 * Shared settings for SQL query generation across all database types
 */

/**
 * Optimal settings for deterministic SQL generation
 */
export const SQL_GENERATION_CONFIG = {
  temperature: 0.1, // Low temperature for consistent SQL output
  maxTokens: 500,
  maxRetries: 2,
} as const;
