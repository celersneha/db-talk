/**
 * Chat API Route Handler
 * Streams AI responses with tool calling using Vercel AI SDK
 */

import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { cookies } from "next/headers";
import { z } from "zod";
import { schemaStoreUtils } from "@/lib/schema-store";
import { buildSystemPrompt } from "@/ai/prompts";
import { SQL_GENERATION_CONFIG } from "@/ai/config";
import { executeSqlQuery } from "@/lib/db-utils";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Get session data
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("db-session-id")?.value;

    if (!sessionId) {
      return new Response(
        JSON.stringify({
          error: "No active database connection. Please connect first.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const sessionData = schemaStoreUtils.get(sessionId);
    if (!sessionData) {
      return new Response(
        JSON.stringify({
          error: "Session expired. Please reconnect to your database.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build system prompt with schema context
    const systemPrompt = buildSystemPrompt(sessionData.schema);

    // Define tools for database operations
    const tools = {
      executeQuery: {
        description:
          "Execute a SELECT SQL query on the database and return the results. Only SELECT queries are allowed.",
        inputSchema: z.object({
          sql: z.string().describe("The SQL SELECT query to execute"),
          explanation: z
            .string()
            .describe("Brief explanation of what this query does"),
        }),
        execute: async ({
          sql,
          explanation,
        }: {
          sql: string;
          explanation: string;
        }) => {
          const result = await executeSqlQuery(sessionData.dbUrl, sql);
          if (result.success) {
            return {
              success: true,
              explanation,
              data: result.data,
              rowCount: result.rowCount,
            };
          }
          return {
            success: false,
            explanation,
            error: result.error,
          };
        },
      },
    };

    try {
      // Stream AI response with Gemini and tools
      const result = streamText({
        model: google("gemini-2.5-flash-lite"),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(3), // Allow model to continue after tool execution
        temperature: SQL_GENERATION_CONFIG.temperature,
      });

      return result.toUIMessageStreamResponse();
    } catch (error) {
      // Fallback to Mistral on rate limit
      if (
        error instanceof Error &&
        (error.message.includes("429") || error.message.includes("rate limit"))
      ) {
        console.log("Gemini rate limited, falling back to Mistral...");

        const result = streamText({
          model: mistral("mistral-large-latest"),
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(3), // Allow model to continue after tool execution
          temperature: SQL_GENERATION_CONFIG.temperature,
        });

        return result.toUIMessageStreamResponse();
      }

      throw error;
    }
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
