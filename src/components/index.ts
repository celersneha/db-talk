/**
 * Components Index
 * Central export point for all UI components
 */

// Shared components
export { ChatInterface } from "./shared/chat-interface";

// PostgreSQL-specific components
export { ConnectionForm } from "./postgresql/connection-form";

// Re-export UI components for easier access
export * from "./shared/ui/button";
export * from "./shared/ui/input";
export * from "./shared/ui/dialog";
export * from "./shared/ui/dropdown-menu";
export * from "./shared/ui/command";
export * from "./shared/ui/select";
export * from "./shared/ui/separator";
export * from "./shared/ui/spinner";
export * from "./shared/ui/textarea";
export * from "./shared/ui/input-group";
export * from "./shared/ui/button-group";
export * from "./shared/ui/hover-card";
