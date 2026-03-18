/**
 * Database Server Actions - MySQL
 * Handles MySQL connection, schema extraction, and session management
 */

"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import {
  validateDatabaseUrl,
  testDatabaseConnection,
  extractDatabaseSchema,
} from "@/lib/mysql/db-utils";
import { schemaStoreUtils } from "@/lib";

export interface ConnectDatabaseResult {
  success: boolean;
  sessionId?: string;
  schema?: string;
  error?: string;
}

/**
 * Connect to database, extract schema, and create session
 */
export async function connectToDatabase(
  dbUrl: string,
): Promise<ConnectDatabaseResult> {
  try {
    // Validate URL format
    const validation = validateDatabaseUrl(dbUrl);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Test connection
    const connectionTest = await testDatabaseConnection(dbUrl);
    if (!connectionTest.success) {
      return { success: false, error: connectionTest.error };
    }

    // Extract schema
    const schemaResult = await extractDatabaseSchema(dbUrl);
    if (schemaResult.error || !schemaResult.schema) {
      return {
        success: false,
        error: schemaResult.error || "Failed to extract schema",
      };
    }

    // Generate session ID
    const sessionId = uuidv4();

    // Store in memory
    schemaStoreUtils.set(sessionId, {
      schema: schemaResult.schema,
      dbUrl: dbUrl,
      connectedAt: new Date(),
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("db-session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return {
      success: true,
      sessionId,
      schema: schemaResult.schema,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Get current session data
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("db-session-id")?.value;

    if (!sessionId) {
      return { success: false, error: "No active session" };
    }

    const sessionData = schemaStoreUtils.get(sessionId);
    if (!sessionData) {
      return { success: false, error: "Session not found" };
    }

    return {
      success: true,
      sessionId,
      schema: sessionData.schema,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get session",
    };
  }
}

/**
 * Reset session - clear cookie and remove from store
 */
export async function resetSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("db-session-id")?.value;

    // Remove from store if exists
    if (sessionId) {
      schemaStoreUtils.delete(sessionId);
    }

    // Clear cookie
    cookieStore.delete("db-session-id");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset session",
    };
  }
}
