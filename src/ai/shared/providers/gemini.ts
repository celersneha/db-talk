/**
 * Google Gemini Provider (Shared)
 * SQL generation using Google Gemini via Vercel AI SDK
 * Supports all database types via passed-in system prompt
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import type { GenerateQueryParams, GenerateQueryResult } from "../types";
import { SQL_GENERATION_CONFIG } from "../config";
import { buildSystemPrompt, buildMessages } from "../../postgresql/prompts";
import { parseAiResponse, isRateLimitError } from "../parsers";

/**
 * Generate SQL query using Google Gemini
 */
export async function generateWithGemini(
  params: GenerateQueryParams,
): Promise<GenerateQueryResult> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set",
    );
  }

  try {
    const result = await generateText({
      model: google("gemini-2.5-flash-lite"),
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
        provider: "gemini",
      };
    }

    return {
      sql: parsed.sql,
      explanation: parsed.explanation,
      provider: "gemini",
    };
  } catch (error: unknown) {
    if (isRateLimitError(error)) {
      throw new Error("RATE_LIMIT");
    }
    throw error;
  }
}
