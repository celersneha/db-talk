/**
 * AI Index
 * Central export point for AI functionality
 * Re-exports shared AI utilities and database-specific features
 */

// Shared AI exports
export {
  generateSqlQuery,
  type GenerateQueryParams,
  type GenerateQueryResult,
} from "./shared/index";

export type { ParsedResponse } from "./shared/types";

export { parseAiResponse, isRateLimitError } from "./shared/parsers";

export { SQL_GENERATION_CONFIG } from "./shared/config";

// PostgreSQL-specific exports
export { buildSystemPrompt, buildMessages } from "./postgresql/prompts";
