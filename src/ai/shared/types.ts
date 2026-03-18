/**
 * AI Type Definitions (Shared)
 * Shared TypeScript interfaces for AI operations across all database types
 */

export interface GenerateQueryParams {
  userMessage: string;
  schema: string;
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface GenerateQueryResult {
  sql: string;
  explanation?: string;
  error?: string;
  provider?: "gemini" | "mistral";
}

export interface ParsedResponse {
  sql: string;
  explanation: string;
}
