/**
 * Hooks Index
 * Central export for all custom hooks
 * Re-exports database-specific hooks for backward compatibility
 */

// Database-specific exports
export { useDatabase as useDatabasePostgreSQL } from "./postgresql/useDatabase";
export { useDatabase as useDatabaseMySQL } from "./mysql/useDatabase";

// Re-export PostgreSQL as default for backward compatibility
export { useDatabase } from "./postgresql/useDatabase";
