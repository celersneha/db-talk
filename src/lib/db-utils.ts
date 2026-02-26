/**
 * Database Utilities
 * Handles PostgreSQL connections, schema extraction, and query execution
 */

import { Client } from "pg";

/**
 * Validate PostgreSQL connection URL format
 */
export function validateDatabaseUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  if (!url || url.trim() === "") {
    return { valid: false, error: "Database URL is required" };
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    return {
      valid: false,
      error: 'Invalid URL format. Must start with "postgresql://"',
    };
  }

  return { valid: true };
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(
  dbUrl: string,
): Promise<{ success: boolean; error?: string }> {
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    return { success: true };
  } catch (error) {
    await client.end().catch(() => {}); // Ensure cleanup
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to connect to database",
    };
  }
}

interface TableColumn {
  table_name: string;
  column_name: string;
  data_type: string;
}

/**
 * Extract database schema from information_schema
 */
export async function extractDatabaseSchema(
  dbUrl: string,
): Promise<{ schema: string; error?: string }> {
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();

    // Query to get all tables and their columns from public schema
    const query = `
      SELECT 
        table_name,
        column_name,
        data_type
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, 
        ordinal_position;
    `;

    const result = await client.query<TableColumn>(query);
    await client.end();

    if (result.rows.length === 0) {
      return { schema: "", error: "No tables found in the public schema" };
    }

    // Group columns by table
    const tableMap = new Map<string, string[]>();

    for (const row of result.rows) {
      const columns = tableMap.get(row.table_name) || [];
      columns.push(`${row.column_name}: ${row.data_type}`);
      tableMap.set(row.table_name, columns);
    }

    // Convert to LLM-friendly format
    const schemaLines: string[] = [];
    for (const [tableName, columns] of tableMap.entries()) {
      schemaLines.push(`Table: ${tableName} (${columns.join(", ")})`);
    }

    return { schema: schemaLines.join("\n") };
  } catch (error) {
    await client.end().catch(() => {}); // Ensure cleanup
    return {
      schema: "",
      error:
        error instanceof Error ? error.message : "Failed to extract schema",
    };
  }
}

/**
 * Validate SQL query - only allow SELECT queries
 */
export function validateSqlQuery(sql: string): {
  valid: boolean;
  error?: string;
} {
  const trimmedSql = sql.trim().toUpperCase();

  // List of forbidden keywords
  const forbiddenKeywords = [
    "DROP",
    "DELETE",
    "UPDATE",
    "INSERT",
    "ALTER",
    "CREATE",
    "TRUNCATE",
    "GRANT",
    "REVOKE",
  ];

  for (const keyword of forbiddenKeywords) {
    if (trimmedSql.includes(keyword)) {
      return {
        valid: false,
        error: `Query contains forbidden keyword: ${keyword}. Only SELECT queries are allowed.`,
      };
    }
  }

  if (!trimmedSql.startsWith("SELECT")) {
    return {
      valid: false,
      error: "Only SELECT queries are allowed",
    };
  }

  return { valid: true };
}

/**
 * Execute SQL query on the database
 */
export async function executeSqlQuery(
  dbUrl: string,
  sql: string,
): Promise<{
  success: boolean;
  data?: Record<string, unknown>[];
  rowCount?: number;
  error?: string;
}> {
  // Validate query before execution
  const validation = validateSqlQuery(sql);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    const result = await client.query(sql);
    await client.end();

    return {
      success: true,
      data: result.rows,
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    await client.end().catch(() => {}); // Ensure cleanup
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute query",
    };
  }
}
