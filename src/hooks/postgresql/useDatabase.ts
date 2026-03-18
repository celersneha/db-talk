/**
 * useDatabase Hook - PostgreSQL
 * Manages PostgreSQL database connection, session state, and reset
 */

import { useState } from "react";
import { connectToDatabase, resetSession } from "@/actions/postgresql/database";

export function useDatabase() {
  const [dbUrl, setDbUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [schema, setSchema] = useState("");

  /**
   * Connect to a PostgreSQL database
   */
  const handleConnect = async (): Promise<boolean> => {
    if (!dbUrl.trim()) {
      setError("Please enter a database URL");
      return false;
    }

    setIsConnecting(true);
    setError("");

    try {
      const result = await connectToDatabase(dbUrl);

      if (result.success && result.schema) {
        setIsConnected(true);
        setSchema(result.schema);
        setError("");
        return true;
      } else {
        setError(result.error || "Failed to connect to database");
        setIsConnected(false);
        return false;
      }
    } catch {
      setError("An unexpected error occurred");
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Reset database connection and clear state
   */
  const handleReset = async (): Promise<boolean> => {
    try {
      await resetSession();
      setDbUrl("");
      setIsConnected(false);
      setSchema("");
      setError("");
      return true;
    } catch {
      setError("Failed to reset connection");
      return false;
    }
  };

  /**
   * Handle Enter key to connect
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isConnecting && !isConnected) {
      handleConnect();
    }
  };

  return {
    dbUrl,
    setDbUrl,
    isConnecting,
    isConnected,
    error,
    setError,
    schema,
    handleConnect,
    handleReset,
    handleKeyPress,
  };
}
