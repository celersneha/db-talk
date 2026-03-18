/**
 * Actions Index
 * Central export point for server actions
 * Re-exports database-specific actions for backward compatibility
 */

export {
  connectToDatabase,
  getSession,
  resetSession,
  type ConnectDatabaseResult,
} from "./postgresql/database";
