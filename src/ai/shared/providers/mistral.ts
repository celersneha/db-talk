/**
 * Mistral AI Provider (Shared)
 * SQL generation using Mistral via Vercel AI SDK
 * Supports all database types via passed-in system prompt
 */

import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";
import type { GenerateQueryParams, GenerateQueryResult } from "../types";
import { SQL_GENERATION_CONFIG } from "../config";
import { buildSystemPrompt, buildMessages } from "../../postgresql/prompts";
import { parseAiResponse } from "../parsers";

/**
 * Generate SQL query using Mistral AI
 */
export async function generateWithMistral(
  params: GenerateQueryParams,
): Promise<GenerateQueryResult> {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY environment variable is not set");
  }

  try {
    const result = await generateText({
      model: mistral("mistral-large-latest"),
      system: buildSystemPrompt(params.schema),
      messages: buildMessages(params.userMessage, params.chatHistory),
      ...SQL_GENERATION_CONFIG,
    });

    const parsed = parseAiResponse(result.text);

    if (parsed.sql === "NONE" || !parsed.sql) {
      return {
        sql: "",
        explanation:
          parsed.explanation ||
          "Could not generate a valid query for this question.",
        provider: "mistral",
      };
    }

    return {
      sql: parsed.sql,
      explanation: parsed.explanation,
      provider: "mistral",
    };
  } catch (error: unknown) {
    throw error;
  }
}
