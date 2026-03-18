/**
 * Chat API Route Handler
 * Streams AI responses with tool calling using Vercel AI SDK
 */

import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { cookies } from "next/headers";
import { z } from "zod";
import { schemaStoreUtils } from "@/lib/shared/schema-store";
import { buildSystemPrompt as buildPostgresPrompt } from "@/ai/postgresql/prompts";
import { buildSystemPrompt as buildMysqlPrompt } from "@/ai/mysql/prompts";
import { SQL_GENERATION_CONFIG } from "@/ai/shared/config";
import { executeSqlQuery as executePostgresQuery } from "@/lib/postgresql/db-utils";
import { executeSqlQuery as executeMysqlQuery } from "@/lib/mysql/db-utils";
import type { DatabaseType } from "@/utils/db-icons";

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

    // Detect database type from URL
    const dbType: DatabaseType =
      sessionData.dbUrl.includes("mysql") || sessionData.dbUrl.includes("3306")
        ? "mysql"
        : "postgresql";

    console.log(`[CHAT API] Session: ${sessionId}`);
    console.log(`[CHAT API] Database Type: ${dbType}`);
    console.log(`[CHAT API] Schema Length: ${sessionData.schema.length} chars`);

    // Build system prompt with schema context using correct database type
    const buildPrompt =
      dbType === "mysql" ? buildMysqlPrompt : buildPostgresPrompt;
    const systemPrompt = buildPrompt(sessionData.schema);
    console.log(
      `[CHAT API] System Prompt Length: ${systemPrompt.length} chars`,
    );

    // Select correct query executor based on database type
    const executeQuery =
      dbType === "mysql" ? executeMysqlQuery : executePostgresQuery;

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
          console.log(`[EXECUTE QUERY] SQL: ${sql}`);
          console.log(`[EXECUTE QUERY] Explanation: ${explanation}`);

          const result = await executeQuery(sessionData.dbUrl, sql);

          if (result.success) {
            console.log(`[EXECUTE QUERY] Success - ${result.rowCount} rows`);
            return {
              success: true,
              explanation,
              data: result.data,
              rowCount: result.rowCount,
            };
          }

          console.log(`[EXECUTE QUERY] Error: ${result.error}`);
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
      console.log(`[STREAM START] Using Model: Gemini 2.5 Flash Lite`);

      const result = streamText({
        model: google("gemini-2.5-flash-lite"),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(3), // Allow model to continue after tool execution
        temperature: SQL_GENERATION_CONFIG.temperature,
      });

      console.log(`[STREAM] Converting to UI message stream response`);
      const response = result.toUIMessageStreamResponse();
      console.log(`[STREAM] Response created successfully`);

      return response;
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
    console.error("[CHAT API ERROR] Detailed Error Info:");
    console.error(
      "  Error Type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "  Error Message:",
      error instanceof Error ? error.message : String(error),
    );
    if (error instanceof Error && error.stack) {
      console.error(
        "  Stack Trace:",
        error.stack.split("\n").slice(0, 5).join("\n"),
      );
    }

    // Log full error object
    console.error("  Full Error:", JSON.stringify(error, null, 2));

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? `${error.message} (Check server logs for details)`
            : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
