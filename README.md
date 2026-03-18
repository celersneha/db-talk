# DB-Talk MVP

A Next.js application that lets you chat with your **PostgreSQL** or **MySQL** database using natural language. Ask questions in plain English and get instant SQL queries and results.

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
- **Databases**: PostgreSQL (pg driver) / MySQL (mysql2 driver)
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
2. **Connect**: Select your database type and enter the connection URL:
   - **PostgreSQL**: `postgresql://user:password@host:5432/database`
   - **MySQL**: `mysql://user:password@host:3306/database`
3. **Chat**: Ask questions in natural language:
   - "Show me all users"
   - "How many patients are there?"
   - "Find the top 10 doctors by experience"

4. **Reset**: Click "Reset Connection" to disconnect and clear session

## Database Setup (Optional)

For testing purposes, you can set up a local PostgreSQL or MySQL database with sample healthcare data using Docker.

### PostgreSQL Setup

#### 1. Generate PostgreSQL Docker Files

Run the PostgreSQL setup script:

```bash
npm run setup-db:postgres
# or
tsx scripts/setup/postgresql.ts
```

This creates:

- `docker-compose.yml` - Docker Compose configuration with Postgres 15 and Adminer
- `scripts/seed/init-postgres.sql` - SQL file with 50 entries for each table

#### 2. Start PostgreSQL Container

```bash
docker compose up -d
```

This starts:

- **PostgreSQL 15** on port 5432
- **Adminer** on port 8080

#### 3. Seed PostgreSQL Database

```bash
npm run seed:postgres
# or
tsx scripts/seed/postgresql.ts
```

#### 4. Access PostgreSQL Database

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

#### 5. Stop PostgreSQL Container

```bash
docker compose down
```

---

### MySQL Setup

#### 1. Generate MySQL Docker Files

Run the MySQL setup script:

```bash
npm run setup-db:mysql
# or
tsx scripts/setup/mysql.ts
```

This creates:

- `docker-compose-mysql.yml` - Docker Compose configuration with MySQL 8.0 and Adminer
- `scripts/seed/init-mysql.sql` - SQL file with 50 entries for each table

#### 2. Start MySQL Container

```bash
docker compose -f docker-compose-mysql.yml up -d
```

This starts:

- **MySQL 8.0** on port 3306
- **Adminer** on port 8081

#### 3. Seed MySQL Database

```bash
npm run seed:mysql
# or
tsx scripts/seed/mysql.ts
```

#### 4. Access MySQL Database

**Connection URL:**

```
mysql://dbuser:dbpassword@localhost:3306/healthcare
```

**Adminer UI:**

- URL: http://localhost:8081
- System: MySQL
- Server: mysql
- Username: dbuser
- Password: dbpassword
- Database: healthcare

#### 5. Stop MySQL Container

```bash
docker compose -f docker-compose-mysql.yml down
```

---

### Database Schema

Both PostgreSQL and MySQL setups include 5 tables with 50 entries each:

- **patients** - Patient information (name, email, phone, DOB, gender, address)
- **doctors** - Doctor information (name, email, specialization, license, experience)
- **appointments** - Scheduled appointments between patients and doctors
- **medical_records** - Medical visit records with diagnoses and treatments
- **prescriptions** - Medication prescriptions linked to medical records

The schema automatically establishes foreign key relationships for realistic data queries.

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

scripts/
├── setup/                    # Database setup scripts
│   ├── postgresql.ts         # PostgreSQL docker setup
│   └── mysql.ts              # MySQL docker setup
└── seed/                     # Database seeding scripts
    ├── postgresql.ts         # PostgreSQL data seeding
    ├── mysql.ts              # MySQL data seeding
    ├── init-postgres.sql     # PostgreSQL initial data (generated)
    └── init-mysql.sql        # MySQL initial data (generated)
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
