"use client";

import { useState } from "react";
import { ConnectionForm } from "@/components/connection-form";
import { ChatInterface } from "@/components/chat-interface";

export default function ChatPage() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  const handleReset = () => {
    setIsConnected(false);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar - Database Connection */}
      <div className="w-80 flex-shrink-0">
        <ConnectionForm
          onConnectionChange={handleConnectionChange}
          onReset={handleReset}
        />
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1">
        <ChatInterface isConnected={isConnected} />
      </div>
    </div>
  );
}
