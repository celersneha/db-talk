/**
 * Database Utilities - MySQL
 * Handles MySQL connections, schema extraction, and query execution
 */

import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";

/**
 * Validate MySQL connection URL format
 */
export function validateDatabaseUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  if (!url || url.trim() === "") {
    return { valid: false, error: "Database URL is required" };
  }

  if (!url.startsWith("mysql://") && !url.startsWith("mysql2://")) {
    return {
      valid: false,
      error: 'Invalid URL format. Must start with "mysql://" or "mysql2://"',
    };
  }

  return { valid: true };
}

/**
 * Parse MySQL connection URL to connection config
 */
function parseConnectionUrl(url: string): mysql.ConnectionOptions {
  const urlObj = new URL(url.replace(/^mysql2?:\/\//, "mysql://"));

  return {
    host: urlObj.hostname || "localhost",
    user: urlObj.username,
    password: urlObj.password,
    database: urlObj.pathname?.slice(1),
    port: urlObj.port ? parseInt(urlObj.port) : 3306,
  };
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(
  dbUrl: string,
): Promise<{ success: boolean; error?: string }> {
  let connection: mysql.Connection | null = null;

  try {
    const config = parseConnectionUrl(dbUrl);
    connection = await mysql.createConnection(config);

    await connection.ping();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to connect to database",
    };
  } finally {
    if (connection) {
      await connection.end().catch(() => {});
    }
  }
}

interface TableColumn extends RowDataPacket {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
}

interface PrimaryKey extends RowDataPacket {
  TABLE_NAME: string;
  COLUMN_NAME: string;
}

interface ForeignKey extends RowDataPacket {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
}

/**
 * Extract database schema with relationships (foreign keys, primary keys)
 * Supports: JOINs, subqueries, window functions, CTEs, aggregations
 */
export async function extractDatabaseSchema(
  dbUrl: string,
): Promise<{ schema: string; error?: string }> {
  let connection: mysql.Connection | null = null;

  try {
    const config = parseConnectionUrl(dbUrl);
    const database = config.database;

    if (!database) {
      return { schema: "", error: "Database name is required in the URL" };
    }

    connection = await mysql.createConnection(config);

    // Get all columns
    const columnsQuery = `
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;
    const [columnsRows] = await connection.execute<TableColumn[]>(
      columnsQuery,
      [database],
    );

    // Get primary keys
    const pkQuery = `
      SELECT TABLE_NAME, COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND CONSTRAINT_NAME = 'PRIMARY'
    `;
    const [pkRows] = await connection.execute<PrimaryKey[]>(pkQuery, [
      database,
    ]);

    // Get foreign keys
    const fkQuery = `
      SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
    `;
    const [fkRows] = await connection.execute<ForeignKey[]>(fkQuery, [
      database,
    ]);

    if (!columnsRows || columnsRows.length === 0) {
      return { schema: "", error: "No tables found in the database" };
    }

    // Build lookup maps
    const pkMap = new Map<string, Set<string>>();
    const fkMap = new Map<string, Map<string, string>>();

    pkRows?.forEach((pk) => {
      const key = pk.TABLE_NAME;
      if (!pkMap.has(key)) pkMap.set(key, new Set());
      pkMap.get(key)!.add(pk.COLUMN_NAME);
    });

    fkRows?.forEach((fk) => {
      const key = fk.TABLE_NAME;
      if (!fkMap.has(key)) fkMap.set(key, new Map());
      fkMap
        .get(key)!
        .set(
          fk.COLUMN_NAME,
          `${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`,
        );
    });

    // Group columns by table with constraint annotations
    const tableMap = new Map<string, string[]>();
    for (const row of columnsRows) {
      const isPK = pkMap.get(row.TABLE_NAME)?.has(row.COLUMN_NAME);
      const fkRef = fkMap.get(row.TABLE_NAME)?.get(row.COLUMN_NAME);

      let columnStr = `${row.COLUMN_NAME}: ${row.COLUMN_TYPE}`;
      if (isPK) columnStr += " [PK]";
      if (fkRef) columnStr += ` [FK→${fkRef}]`;

      const columns = tableMap.get(row.TABLE_NAME) || [];
      columns.push(columnStr);
      tableMap.set(row.TABLE_NAME, columns);
    }

    // Format LLM-friendly output with relationships
    const schemaLines: string[] = [];
    for (const [tableName, columns] of tableMap.entries()) {
      schemaLines.push(`Table: ${tableName}\n  ${columns.join(", ")}`);
    }

    return { schema: schemaLines.join("\n") };
  } catch (error) {
    return {
      schema: "",
      error:
        error instanceof Error ? error.message : "Failed to extract schema",
    };
  } finally {
    if (connection) {
      await connection.end().catch(() => {});
    }
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

  let connection: mysql.Connection | null = null;

  try {
    const config = parseConnectionUrl(dbUrl);
    connection = await mysql.createConnection(config);

    const [results] = await connection.execute(sql);

    // Convert results to Record<string, unknown>[]
    const data: Record<string, unknown>[] = Array.isArray(results)
      ? (results as RowDataPacket[]).map((row) => {
          const record: Record<string, unknown> = {};
          for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              record[key] = (row as Record<string, unknown>)[key];
            }
          }
          return record;
        })
      : [];

    return {
      success: true,
      data,
      rowCount: data.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute query",
    };
  } finally {
    if (connection) {
      await connection.end().catch(() => {});
    }
  }
}
