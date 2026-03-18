/**
 * Database Connection Form Component - PostgreSQL
 * Left sidebar for connecting to PostgreSQL database
 */

"use client";

import { useState } from "react";
import {
  Database,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { useDatabase } from "@/hooks/postgresql/useDatabase";
import {
  DATABASE_TYPES,
  DATABASE_CONFIGS,
  type DatabaseType,
} from "@/utils/db-icons";
import { DatabaseIcon } from "@/components/shared/database-icon";

interface ConnectionFormProps {
  onConnectionChange: (connected: boolean) => void;
  onReset: () => void;
}

export function ConnectionForm({
  onConnectionChange,
  onReset,
}: ConnectionFormProps) {
  const [selectedDatabase, setSelectedDatabase] =
    useState<DatabaseType>("postgresql");
  const [showDatabaseDropdown, setShowDatabaseDropdown] = useState(false);

  const {
    dbUrl,
    setDbUrl,
    isConnecting,
    isConnected,
    error,
    schema,
    handleConnect: dbHandleConnect,
    handleReset: dbHandleReset,
    handleKeyPress,
  } = useDatabase();

  const currentConfig = DATABASE_CONFIGS[selectedDatabase];

  /**
   * Connect and notify parent
   */
  const handleConnect = async () => {
    const success = await dbHandleConnect();
    if (success) {
      onConnectionChange(true);
    }
  };

  /**
   * Reset and notify parent
   */
  const handleReset = async () => {
    const success = await dbHandleReset();
    if (success) {
      onReset();
      onConnectionChange(false);
    }
  };

  return (
    <div className="h-full bg-card border-r border-border p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Database Connection
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentConfig.description}
        </p>
      </div>

      {/* Database Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Database Type
        </label>
        <div className="relative">
          <button
            onClick={() => setShowDatabaseDropdown(!showDatabaseDropdown)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground flex items-center justify-between hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <div className="flex items-center gap-2">
              <DatabaseIcon type={currentConfig.iconType} />
              <span className="text-sm">{currentConfig.displayName}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showDatabaseDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showDatabaseDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
              {DATABASE_TYPES.map((dbType) => (
                <button
                  key={dbType}
                  onClick={() => {
                    setSelectedDatabase(dbType);
                    setShowDatabaseDropdown(false);
                    setDbUrl(""); // Clear URL when changing database type
                  }}
                  className={`w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-primary/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedDatabase === dbType ? "bg-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DatabaseIcon type={DATABASE_CONFIGS[dbType].iconType} />
                    <span className="text-sm text-foreground">
                      {DATABASE_CONFIGS[dbType].displayName}
                    </span>
                  </div>
                  {selectedDatabase === dbType && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isConnected ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Connected
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Not Connected
            </>
          )}
        </div>
      </div>

      {/* Connection Form */}
      {!isConnected && (
        <>
          <div className="mb-4">
            <label
              htmlFor="dbUrl"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {currentConfig.displayName} URL
            </label>
            <input
              id="dbUrl"
              type="text"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentConfig.urlPlaceholder}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-background text-foreground placeholder:text-muted-foreground"
              disabled={isConnecting}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting || !dbUrl.trim()}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Database"
            )}
          </button>
        </>
      )}

      {/* Connected State */}
      {isConnected && (
        <>
          <div className="mb-4 p-4 bg-background border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Schema Overview
            </h3>
            <div className="text-xs text-muted-foreground font-mono max-h-60 overflow-y-auto whitespace-pre-wrap">
              {schema}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-destructive text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Connection
          </button>
        </>
      )}

      {/* Info Section */}
      <div className="mt-auto pt-6 border-t border-border">
        <h3 className="text-xs font-semibold text-foreground mb-2">
          Security Notice
        </h3>
        <p className="text-xs text-muted-foreground">
          Your database credentials are stored securely in server memory and are
          never exposed to the client.
        </p>
      </div>
    </div>
  );
}
