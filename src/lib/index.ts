/**
 * Lib Index
 * Central export point for library utilities
 */

// Shared utilities
export { schemaStoreUtils, type SchemaData } from "./shared/schema-store";
export { cn } from "./shared/utils";

// Database-specific exports
export * as postgresqlDbUtils from "./postgresql/db-utils";
export * as mysqlDbUtils from "./mysql/db-utils";

// Re-export PostgreSQL as default for backward compatibility
export {
  validateDatabaseUrl,
  testDatabaseConnection,
  extractDatabaseSchema,
  validateSqlQuery,
  executeSqlQuery,
} from "./postgresql/db-utils";
