# LLM Lab Console

A Next.js + Mantine project for running, visualizing, and exporting LLM experiment results. This project is styled for maintainability, accessibility, and robust error handling.

---

## Quick Start

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Developer Setup

- **TypeScript check:**
  ```powershell
  npx tsc --noEmit
  ```
- **Lint:**
  ```powershell
  npm run lint -- .
  ```
- **Run tests:** (add tests in `/tests` or alongside components)
  ```powershell
  npm test
  ```
- **Styling:**
  - Use Mantine props for layout and spacing.
  - Use CSS classes from `app/globals.css` for presentational styles (see `DEVELOPER_GUIDE.md`).
  - For theme colors, set CSS variables on the component root and reference in CSS.

---

## Environment variables

Create a `.env` file at the project root (not checked into git) and set the following values used by the app:

- `DATABASE_URL` — your Prisma database connection string (Postgres, SQLite, etc.). Example for SQLite:
  ```powershell
  DATABASE_URL="file:./dev.db"
  ```
- `GROQ_API_KEY` — API key for Groq (used by `app/lib/groq.ts` to call the Groq/OpenAI-compatible API).
- `PROXY_URL` — optional. If you need to route requests through an HTTP(S) proxy, set the full proxy URL (e.g. `http://127.0.0.1:3128`).

If you deploy to Vercel, Railway, or another platform, set these as project environment variables in the provider dashboard rather than committing a `.env` file.

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
