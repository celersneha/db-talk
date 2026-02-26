/**
 * In-Memory Schema Store
 * Stores database schemas and connection info keyed by sessionId
 * Uses globalThis to survive HMR (Hot Module Reload) in development
 */

export interface SchemaData {
  schema: string;
  dbUrl: string;
  connectedAt: Date;
}

// Extend global namespace for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var __dbTalkSchemaStore: Map<string, SchemaData> | undefined;
}

// Use globalThis to persist across HMR reloads in development
const schemaStore: Map<string, SchemaData> =
  global.__dbTalkSchemaStore ?? new Map<string, SchemaData>();

// Attach to global in development mode to survive HMR
if (process.env.NODE_ENV !== "production") {
  global.__dbTalkSchemaStore = schemaStore;
}

export const schemaStoreUtils = {
  /**
   * Store schema data for a session
   */
  set(sessionId: string, data: SchemaData): void {
    schemaStore.set(sessionId, data);
  },

  /**
   * Get schema data for a session
   */
  get(sessionId: string): SchemaData | undefined {
    return schemaStore.get(sessionId);
  },

  /**
   * Remove schema data for a session
   */
  delete(sessionId: string): boolean {
    return schemaStore.delete(sessionId);
  },

  /**
   * Check if a session exists
   */
  has(sessionId: string): boolean {
    return schemaStore.has(sessionId);
  },

  /**
   * Get the size of the store
   */
  size(): number {
    return schemaStore.size;
  },

  /**
   * Clear all stored schemas (useful for testing)
   */
  clear(): void {
    schemaStore.clear();
  },
};
