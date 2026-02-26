# AGENTS.md — DB-Talk (Next.js + Vercel AI SDK) Engineering Guidelines

## 1. Project Overview

DB-Talk is a stateless AI-powered application that allows users to chat with their PostgreSQL database using natural language.
The system dynamically connects to a user-provided database URL, extracts schema at runtime, and uses the Vercel AI SDK to generate safe, read-only SQL queries.

Core Principles:

- Stateless MVP (no internal database)
- Server Actions over API routes
- Type-safe architecture (TypeScript-first)
- Modular and DRY codebase
- Secure handling of database credentials
- LLM-driven query generation with strict safety guards

---

## 2. Tech Stack & Standards

- Framework: Next.js (App Router, Server Components + Server Actions)
- Language: TypeScript (strict mode enabled)
- AI: Vercel AI SDK (`ai`, `@ai-sdk/openai` or compatible provider)
- Database Driver: `pg` (dynamic PostgreSQL connections)
- UI: Component-driven (shadcn/ui or equivalent)
- State Model: Server memory + cookies (no persistent DB)

Strict Requirements:

- No REST API routes unless absolutely necessary
- Prefer Server Actions for all mutations and LLM calls
- Fully typed inputs, outputs, and internal utilities

---

## 3. Architectural Principles

### 3.1 Modular Architecture

Code must be split by responsibility:

```
src/
  app/            → Routes & Server Components
  ai/             → Configurations and utilties of AI.
  actions/        → Server Actions (business logic)
  components/     → Reusable UI components
  lib/            → Core utilities (AI, DB, schema store)
  types/          → Shared TypeScript types
  utils/          → Pure helper functions (no side effects)
```

Rules:

- No business logic inside UI components
- No database logic inside components
- No AI logic inside pages
- All side-effects must live in `actions/` or `lib/`

---

## 4. Type Safety Guidelines (MANDATORY)

### 4.1 Strict TypeScript Config

Ensure:

- `"strict": true`
- No `any` usage unless absolutely unavoidable
- Prefer `unknown` over `any`
- Use explicit return types for all functions

Example:

```ts
export async function connectToDatabase(
  dbUrl: string,
): Promise<ConnectionResult>;
```

### 4.2 Shared Types

Define reusable types in `src/types`:

- SchemaMetadata
- ChatMessage
- SessionData
- QueryResult
- LLMResponse

Never duplicate type definitions across files (DRY enforcement).

---

## 5. DRY (Don’t Repeat Yourself) Enforcement

### 5.1 Reusable Utilities

Centralize:

- Schema formatting logic
- SQL validation logic
- LLM prompt builders
- Database connection factory

Bad:
Duplicating schema formatting in multiple actions.

Good:

```ts
lib / schema - formatter.ts;
lib / sql - guard.ts;
lib / ai - prompt.ts;
```

### 5.2 Single Source of Truth

- Schema store → `lib/schema-store.ts`
- DB connection logic → `lib/db-client.ts`
- AI config → `lib/ai.ts`

Never reimplement these in multiple places.

---

## 6. Vercel AI SDK Best Practices (Aligned with Official Docs)

### 6.1 Use Server-Side AI Calls Only

All `streamText` or `generateText` calls must run in:

- Server Actions
- Server-only modules

Never call AI SDK directly from Client Components.

### 6.2 Structured Prompting

Always include:

- System prompt
- Schema context
- Safety instructions
- User message

Example system prompt pattern:

```
You are a SQL assistant.
Only generate safe SELECT queries.
Use the provided schema strictly.
Do not hallucinate tables or columns.
```

### 6.3 Streaming (Preferred)

Use `streamText()` instead of blocking responses when possible for better UX.

### 6.4 Deterministic Output

- Use low temperature (0–0.3) for SQL generation
- Avoid creative hallucinations
- Prefer structured responses (SQL + explanation)

---

## 7. Server Actions Guidelines

### 7.1 Action Responsibilities

Actions should be atomic and focused:

- `connectToDatabase()` → connection + schema extraction
- `chatWithDatabase()` → LLM + SQL execution
- `resetSession()` → memory + cookie cleanup

Do NOT mix multiple responsibilities in a single action.

### 7.2 Input Validation

Always validate:

- Database URL format
- Empty inputs
- Message length
- Session existence

Use runtime guards before executing logic.

---

## 8. In-Memory Schema Store Design

### 8.1 Storage Strategy

Location: `src/lib/schema-store.ts`
Implementation: Global `Map<string, SessionData>`

Rules:

- Key: sessionId (UUID)
- Value: { schema: string, dbUrl: string }
- Never store actual user data
- Only store metadata (schema + connection string)

### 8.2 Access Pattern

- Write on DB connect
- Read on chat action
- Delete on reset action

---

## 9. Database Layer Best Practices

### 9.1 No ORM Usage

Do NOT use Prisma or ORM because:

- Schema is dynamic
- Models are unknown at compile time
- Raw SQL execution is required

Use:

- `pg` client with dynamic connection strings

### 9.2 Connection Lifecycle

- Create short-lived connections
- Avoid global persistent DB pools per unknown URL
- Always close client after queries when possible

---

## 10. SQL Safety Guard (CRITICAL)

Before executing any AI-generated SQL:

- Allow only `SELECT`
- Block:
  - DROP
  - DELETE
  - UPDATE
  - ALTER
  - TRUNCATE
  - INSERT

Implement a centralized validator:

```
lib/sql-guard.ts
```

Never execute raw AI SQL without validation.

---

## 11. Security Best Practices

### 11.1 Credential Safety

- Never log DB URLs
- Never expose DB URL to client after submission
- Store DB URL only in server memory
- Do not persist credentials to disk or localStorage

### 11.2 Cookie Handling

- Use HTTP-only cookies for sessionId
- No sensitive data in client storage
- Clear cookies on reset

---

## 12. UI & Component Standards

### 12.1 Component Design

- Presentational components → `components/`
- No server logic inside client UI components
- Use props with strict typing
- Reusable layout components (Sidebar, ChatPanel)

### 12.2 State Separation

- Server state: schema, session, DB connection
- Client state: chat messages, input field, loading state

---

## 13. Error Handling Strategy

Must gracefully handle:

- Invalid PostgreSQL URL
- Connection failures
- Empty schema extraction
- LLM failures
- SQL execution errors

All errors should:

- Be typed
- Be user-friendly
- Not leak internal stack traces

---

## 14. Performance Guidelines

- Cache schema in memory to avoid repeated extraction
- Avoid re-calling schema queries per chat message
- Keep schema prompts concise to reduce token usage
- Prefer streaming AI responses for responsiveness

---

## 15. Future Scalability Considerations

Design code so it can later support:

- Multi-user sessions
- Redis/Edge KV schema caching
- Multi-database support (MySQL, SQLite)
- Auth integration
- Persistent chat history (optional)

Avoid hardcoding assumptions that block scalability.

---

## 16. Code Quality Checklist (Before Any Commit)

- No `any` types
- No duplicated logic
- All server actions typed
- SQL guard implemented
- Sensitive data not exposed
- Modular imports (no circular dependencies)
- Clean separation of concerns
- Lint + typecheck passing

---

## 17. Documentation Standard

Every core module must include:

- Purpose comment
- Input/output types
- Security considerations
- Usage example (if complex)

This ensures long-term maintainability and team scalability.
