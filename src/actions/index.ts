/**
 * Actions Index
 * Central export point for server actions
 * Re-exports database-specific actions for backward compatibility
 */

// Database-specific exports
export * as postgresqlActions from "./postgresql/database";
export * as mysqlActions from "./mysql/database";

// Re-export PostgreSQL as default for backward compatibility
export {
  connectToDatabase,
  getSession,
  resetSession,
  type ConnectDatabaseResult,
} from "./postgresql/database";
