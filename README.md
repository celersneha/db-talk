# DB-Talk MVP

A Next.js application that lets you chat with your PostgreSQL database using natural language. Ask questions in plain English and get instant SQL queries and results.

## Features

- 🗣️ **Natural Language to SQL**: Ask questions in plain English
- 🤖 **AI-Powered**: Uses Google Gemini API with Mistral AI as fallback
- 🔒 **Read-Only Queries**: Only SELECT queries allowed for data safety
- 🔐 **Secure**: Database credentials stored in server memory only
- ⚡ **Stateless**: No internal database required
- 🎨 **Modern UI**: Clean, responsive interface with real-time results

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Language**: TypeScript
- **Database**: PostgreSQL (pg driver)
- **AI SDKs**: Google Generative AI, Mistral AI
- **UI**: Tailwind CSS, Lucide Icons
- **Session**: Server-side cookies + in-memory storage

## Getting Started

### 1. Clone and Install

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
```

**Get API Keys:**

- Gemini: https://ai.google.dev/
- Mistral: https://console.mistral.ai/

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Landing Page**: Click "Connect Database" button
2. **Connect**: Enter your PostgreSQL connection URL:
   ```
   postgresql://user:password@host:5432/database
   ```
3. **Chat**: Ask questions in natural language:
   - "Show me all users"
   - "How many orders were placed last month?"
   - "Find the top 10 customers by revenue"

4. **Reset**: Click "Reset Connection" to disconnect and clear session

## Database Setup (Optional)

For testing purposes, you can set up a local PostgreSQL database with sample healthcare data.

### 1. Generate Database Files

Run the setup script to generate `docker-compose.yml` and `init.sql`:

```bash
npm run setup-db
# or
tsx scripts/setup_docker.ts
```

This will create:

- `docker-compose.yml` - Docker Compose configuration with Postgres 15 and Adminer
- `scripts/init.sql` - SQL file with 50 entries for each table (patients, doctors, appointments, medical_records, prescriptions)

### 2. Start Docker Containers

```bash
docker compose up -d
```

This starts:

- **PostgreSQL 15** on port 5432
- **Adminer** (database management UI) on port 8080

### 3. Seed the Database

```bash
npm run seed
# or
tsx scripts/seed_data.ts
```

### 4. Access the Database

**Connection URL:**

```
postgresql://dbuser:dbpassword@localhost:5432/healthcare
```

**Adminer UI:**

- URL: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: dbuser
- Password: dbpassword
- Database: healthcare

### 5. Stop Docker Containers

```bash
docker compose down
```

### Database Schema

The sample database includes 5 tables with 50 entries each:

- **patients** - Patient information (name, email, phone, DOB, gender, address)
- **doctors** - Doctor information (name, email, specialization, license, experience)
- **appointments** - Scheduled appointments between patients and doctors
- **medical_records** - Medical visit records with diagnoses and treatments
- **prescriptions** - Medication prescriptions linked to medical records

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── chat/
│   │   └── page.tsx          # Chat interface (two-column layout)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── actions/
│   ├── database.ts           # Database connection server actions
│   └── chat.ts               # Chat/query server actions
├── lib/
│   ├── schema-store.ts       # In-memory session storage
│   ├── db-utils.ts           # PostgreSQL utilities
│   └── ai-utils.ts           # AI query generation (Gemini + Mistral)
└── components/
    ├── connection-form.tsx   # Database connection UI
    ├── chat-interface.tsx    # Chat UI
    ├── message-bubble.tsx    # Message display
    └── data-table.tsx        # Query results table
```

## Architecture

### Server Components & Server Actions

- No API routes - uses Next.js Server Actions
- Server Components for optimal performance
- Client Components only where interactivity is needed

### Session Management

- Session ID stored in HTTP-only cookie
- Schema + DB URL stored in global Map (server memory)
- Automatic cleanup on reset

### AI Fallback Strategy

1. Primary: Google Gemini API (`gemini-1.5-flash`)
2. Fallback: Mistral AI (on 429 rate limit errors)

### Security

- ✅ Only SELECT queries allowed
- ✅ Database URL never exposed to client
- ✅ Credentials not logged
- ✅ SQL injection prevention via parameterized queries
- ✅ Read-only access

## Environment Variables

| Variable                       | Description                  | Required |
| ------------------------------ | ---------------------------- | -------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API key | Yes      |
| `MISTRAL_API_KEY`              | Mistral AI API key           | Yes      |

## Development

```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The app is stateless and suitable for serverless deployment.

## Limitations (MVP)

- In-memory storage (sessions lost on server restart)
- No authentication
- No query history persistence
- Single database connection per session
- SELECT-only queries

## Future Enhancements (SaaS Version)

- User authentication
- Persistent query history
- Multiple saved connections
- Query templates
- Data visualization
- Export results (CSV, JSON)
- Team collaboration
- Query scheduling

## License

MIT

## Contributing

Pull requests welcome! For major changes, please open an issue first.

---

Built with ❤️ using Next.js, TypeScript, and AI
