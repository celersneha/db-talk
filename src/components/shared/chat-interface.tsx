/**
 * Chat Interface Component (Shared)
 * Right panel for interacting with the database via natural language
 * Uses Vercel AI SDK useChat hook with AI Elements components
 * Database-agnostic
 */

"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Database, Send, Loader2, Bot, User, Table } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/shared/ai-elements/conversation";
import {
  Message,
  MessageContent,
} from "@/components/shared/ai-elements/message";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";

interface ChatInterfaceProps {
  isConnected: boolean;
}

export function ChatInterface({ isConnected }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">
          Chat with Your Database
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions in natural language and I&apos;ll query your database
        </p>
      </div>

      {/* Messages Area */}
      <Conversation className="flex-1 px-6 overflow-y-auto">
        {messages.length === 0 ? (
          <ConversationEmptyState className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              {isConnected ? (
                <>
                  <Database className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Ready to chat!
                  </h2>
                  <p className="text-muted-foreground">
                    Ask me anything about your database. I can help you:
                  </p>
                  <ul className="text-left mt-4 space-y-2 text-sm text-foreground">
                    <li>• Find specific records</li>
                    <li>• Count and aggregate data</li>
                    <li>• Join related tables</li>
                    <li>• Filter and search data</li>
                  </ul>
                </>
              ) : (
                <>
                  <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    No database connected
                  </h2>
                  <p className="text-muted-foreground">
                    Connect to your PostgreSQL database using the form on the
                    left to start chatting.
                  </p>
                </>
              )}
            </div>
          </ConversationEmptyState>
        ) : (
          <ConversationContent className="py-4">
            {messages.map((message) => (
              <Message key={message.id} from={message.role} className="mb-6">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {message.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-foreground" />
                    </div>
                  )}

                  <div className="flex-1 space-y-3">
                    {/* Render message parts */}
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <MessageContent key={index}>
                            <div
                              className={`rounded-lg px-4 py-3 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card text-foreground"
                              }`}
                            >
                              {message.role === "assistant" ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown>{part.text}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">
                                  {part.text}
                                </p>
                              )}
                            </div>
                          </MessageContent>
                        );
                      }

                      // Handle executeQuery tool
                      if (part.type === "tool-executeQuery") {
                        const callId = part.toolCallId;
                        const toolInput = part.input as {
                          sql: string;
                          explanation: string;
                        };

                        return (
                          <div
                            key={callId}
                            className="bg-secondary text-foreground rounded-lg p-4 text-sm font-mono overflow-x-auto border border-border"
                          >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Table className="w-4 h-4" />
                              <span>SQL Query</span>
                              {(part.state === "input-streaming" ||
                                part.state === "input-available") && (
                                <Loader2 className="w-3 h-3 animate-spin ml-auto" />
                              )}
                            </div>
                            {toolInput?.sql && (
                              <code className="block mb-3">
                                {toolInput.sql}
                              </code>
                            )}
                            {part.state === "output-available" &&
                              (() => {
                                const output = part.output as
                                  | {
                                      success: boolean;
                                      data?: unknown[];
                                      rowCount?: number;
                                      error?: string;
                                    }
                                  | undefined;
                                if (!output) return null;
                                return (
                                  <div className="mt-3 pt-3 border-t border-border">
                                    <div className="text-xs text-muted-foreground mb-2">
                                      Result:
                                    </div>
                                    {output.success ? (
                                      <div className="text-primary">
                                        <pre className="overflow-x-auto text-xs">
                                          {JSON.stringify(
                                            output.data,
                                            null,
                                            2,
                                          ).slice(0, 1000)}
                                          {JSON.stringify(output.data, null, 2)
                                            .length > 1000 && "..."}
                                        </pre>
                                        <p className="text-xs text-muted-foreground mt-2">
                                          {output.rowCount} row(s) returned
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-destructive">
                                        Error: {output.error}
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            {part.state === "output-error" && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-destructive">
                                  Error: {part.errorText}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              </Message>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="bg-card rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </ConversationContent>
        )}
      </Conversation>

      {/* Error Display */}
      {error &&
        (() => {
          // Parse error message if it's JSON
          let errorMessage = error.message;
          try {
            const parsed = JSON.parse(error.message);
            errorMessage = parsed.error || parsed.message || error.message;
          } catch {
            // Not JSON, use as-is
          }

          const isSessionExpired =
            errorMessage.toLowerCase().includes("session expired") ||
            errorMessage.toLowerCase().includes("reconnect");

          return (
            <div className="px-6 py-3 bg-destructive/10 border-t border-destructive">
              <p className="text-sm text-destructive">{errorMessage}</p>
              {isSessionExpired && (
                <p className="text-xs text-destructive mt-1">
                  Please use the &quot;Reset Connection&quot; button on the left
                  and reconnect.
                </p>
              )}
            </div>
          );
        })()}

      {/* Input Area */}
      <div className="border-t border-border px-6 py-4 bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && isConnected && !isLoading) {
              sendMessage({ text: input });
              setInput("");
            }
          }}
          className="flex gap-3"
        >
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isConnected
                ? "Ask a question about your database..."
                : "Connect to a database first..."
            }
            disabled={!isConnected || isLoading}
            className="flex-1 px-4 py-3 h-12"
          />
          <Button
            type="submit"
            disabled={!isConnected || !input.trim() || isLoading}
            className="h-12 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="ml-2">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
