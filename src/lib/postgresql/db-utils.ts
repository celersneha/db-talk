/**
 * Database Utilities - PostgreSQL
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

interface PrimaryKey {
  table_name: string;
  column_name: string;
}

interface ForeignKey {
  table_name: string;
  column_name: string;
  referenced_table: string;
  referenced_column: string;
}

/**
 * Extract database schema with relationships (foreign keys, primary keys)
 * Supports: JOINs, subqueries, window functions, CTEs, aggregations
 */
export async function extractDatabaseSchema(
  dbUrl: string,
): Promise<{ schema: string; error?: string }> {
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();

    // Get all columns
    const columnsResult = await client.query<TableColumn>(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Get primary keys
    const pkResult = await client.query<PrimaryKey>(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    `);

    // Get foreign keys
    const fkResult = await client.query<ForeignKey>(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);

    await client.end();

    if (columnsResult.rows.length === 0) {
      return { schema: "", error: "No tables found in the public schema" };
    }

    // Build lookup maps
    const pkMap = new Map<string, Set<string>>();
    const fkMap = new Map<string, Map<string, string>>();

    pkResult.rows.forEach((pk) => {
      const key = pk.table_name;
      if (!pkMap.has(key)) pkMap.set(key, new Set());
      pkMap.get(key)!.add(pk.column_name);
    });

    fkResult.rows.forEach((fk) => {
      const key = fk.table_name;
      if (!fkMap.has(key)) fkMap.set(key, new Map());
      fkMap
        .get(key)!
        .set(fk.column_name, `${fk.referenced_table}.${fk.referenced_column}`);
    });

    // Group columns by table with constraint annotations
    const tableMap = new Map<string, string[]>();
    for (const row of columnsResult.rows) {
      const isPK = pkMap.get(row.table_name)?.has(row.column_name);
      const fkRef = fkMap.get(row.table_name)?.get(row.column_name);

      let columnStr = `${row.column_name}: ${row.data_type}`;
      if (isPK) columnStr += " [PK]";
      if (fkRef) columnStr += ` [FK→${fkRef}]`;

      const columns = tableMap.get(row.table_name) || [];
      columns.push(columnStr);
      tableMap.set(row.table_name, columns);
    }

    // Format LLM-friendly output with relationships
    const schemaLines: string[] = [];
    for (const [tableName, columns] of tableMap.entries()) {
      schemaLines.push(`Table: ${tableName}\n  ${columns.join(", ")}`);
    }

    return { schema: schemaLines.join("\n") };
  } catch (error) {
    await client.end().catch(() => {});
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

  // Use word boundary regex to match whole keywords only
  for (const keyword of forbiddenKeywords) {
    const keywordPattern = new RegExp(`\\b${keyword}\\b`);
    if (keywordPattern.test(trimmedSql)) {
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
