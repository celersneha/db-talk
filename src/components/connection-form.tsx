/**
 * Database Connection Form Component
 * Left sidebar for connecting to PostgreSQL database
 */

"use client";

import {
  Database,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useDatabase } from "@/hooks";

interface ConnectionFormProps {
  onConnectionChange: (connected: boolean) => void;
  onReset: () => void;
}

export function ConnectionForm({
  onConnectionChange,
  onReset,
}: ConnectionFormProps) {
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
    <div className="h-full bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Database Connection
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Connect to your PostgreSQL database
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-700"
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              PostgreSQL URL
            </label>
            <input
              id="dbUrl"
              type="text"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="postgresql://user:password@host:5432/dbname"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isConnecting}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting || !dbUrl.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
          <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Schema Overview
            </h3>
            <div className="text-xs text-gray-600 font-mono max-h-60 overflow-y-auto whitespace-pre-wrap">
              {schema}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Connection
          </button>
        </>
      )}

      {/* Info Section */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">
          Security Notice
        </h3>
        <p className="text-xs text-gray-500">
          Your database credentials are stored securely in server memory and are
          never exposed to the client.
        </p>
      </div>
    </div>
  );
}
