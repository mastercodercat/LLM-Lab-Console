# LLM Lab Console

An advanced platform for running, analyzing, and comparing LLM responses with automated quality metrics. Built for researchers and developers to optimize LLM parameters systematically.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **UI Components:** Mantine v7
- **Database:** PostgreSQL with Prisma ORM
- **API Integration:** Groq API (OpenAI-compatible)
- **State Management:** React Hooks + Context
- **Styling:** CSS Modules + Mantine Theme
- **Type Safety:** TypeScript
- **Testing:** Jest + React Testing Library
- **Code Quality:** ESLint + Prettier

## Features

- Parameter space exploration with grid search
- Real-time response analysis with quality metrics
- Comparative visualization of results
- Export functionality (CSV/JSON)
- Responsive, accessible UI
- Type-safe database operations
- Comprehensive error handling

## Quick Start

1. **Clone and Install:**

   ```bash
   git clone https://github.com/mastercodercat/llm-lab-console.git
   cd llm-lab-console
   npm install
   ```

2. **Set up Environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Initialize Database:**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Detailed Setup Guide

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or access to a PostgreSQL database)
- Git

### Database Setup

1. **Create PostgreSQL Database:**

   ```sql
   CREATE DATABASE llm_lab_console;
   ```

2. **Configure Prisma:**

   - Update DATABASE_URL in `.env`
   - Generate Prisma Client:
     ```bash
     npx prisma generate
     ```
   - Run migrations:
     ```bash
     npx prisma migrate dev
     ```
   - (Optional) Seed database:
     ```bash
     npx prisma db seed
     ```

3. **Verify Setup:**
   ```bash
   npx prisma studio
   ```

### API Setup

1. **Get API Credentials:**

   - Create account at [Groq](https://groq.com)
   - Generate API key
   - Add to `.env` as `GROQ_API_KEY`

2. **Proxy Configuration (Optional):**
   - Add `PROXY_URL` to `.env` if needed
   - Format: `http(s)://[username:password@]host:port`

### Development Tools

1. **Code Quality:**

   ```bash
   # TypeScript check
   npx tsc --noEmit

   # Lint
   npm run lint

   # Format
   npm run format

   # Test
   npm run test
   ```

2. **Database Management:**

   ```bash
   # Reset database
   npx prisma migrate reset

   # Update schema
   npx prisma migrate dev

   # View data
   npx prisma studio
   ```

### Styling Guidelines

- Use Mantine theme for consistent spacing/colors
- Leverage CSS modules for component styles
- Follow BEM naming convention
- Use CSS variables for theme values
- See `app/globals.css` for utilities
- Check `DEVELOPER_GUIDE.md` for detailed conventions

### VS Code Setup

Recommended extensions:

- Prisma
- ESLint
- Prettier
- GitLens
- Error Lens

Settings:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Environment Configuration

### Required Variables

Create a `.env` file in the project root with these variables:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/llm_lab_console"

# API Keys
GROQ_API_KEY="your_groq_api_key"

# Optional: Proxy Configuration
PROXY_URL="http(s)://[username:password@]host:port"
```

### Variable Details

1. **DATABASE_URL**

   - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
   - Required for Prisma ORM
   - Supports PostgreSQL only
   - Use SSL in production

2. **GROQ_API_KEY**

   - Get from [Groq Dashboard](https://console.groq.com)
   - Required for LLM API access
   - Starts with "gsk\_"

3. **PROXY_URL** (Optional)
   - Full proxy URL with auth if needed
   - Used for API calls if present
   - Example: `http://user:pass@proxy.com:8080`

### Deployment Configuration

When deploying:

- Use platform environment variables
- Never commit `.env` to git
- Set production DATABASE_URL with SSL
- Use secure secrets management

Supported platforms:

- Vercel
- Railway
- Heroku
- Self-hosted

See `DEVELOPER_GUIDE.md` for detailed deployment instructions.

## API & Error Handling

- API calls use SWR or direct `fetch` with robust error handling.
- UI shows retry buttons and fallback states for network errors.
- See `docs/DEVELOPER_GUIDE.md` for patterns and examples.

---

## Accessibility

- Keyboard navigation and focus styles are supported.
- Charts and interactive elements use ARIA attributes.
- See the accessibility checklist in `docs/DEVELOPER_GUIDE.md`.

---

## Documentation

See the docs folder for developer resources:

- [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) — coding patterns, styling conventions, accessibility checklist, testing and security notes.
- [`docs/ARCHITECTURAL_GUIDE.md`](docs/ARCHITECTURAL_GUIDE.md) — high-level architecture, data model, and design decisions for the project.

---
