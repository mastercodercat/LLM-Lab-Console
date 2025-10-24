Postgres setup (Prisma)

This project uses Prisma to persist experiment reports to PostgreSQL.

1. Set DATABASE_URL in your environment (example for local Postgres):

   DATABASE_URL="postgresql://user:password@localhost:5432/llm_lab"

2. Install Prisma CLI (if not installed):

   npm install prisma --save-dev

3. Generate Prisma client and run migration:

   npx prisma generate
   npx prisma migrate dev --name init

4. Start the Next.js app:

   npm run dev

Notes:

- The Prisma schema is in `prisma/schema.prisma` and defines `ExperimentSet` and `Response` models.
- The app exposes API endpoints:
  - POST /api/experiment -> runs experiments and persists results
  - GET /api/reports -> lists recent experiment sets
  - GET /api/reports/:id -> fetch a saved set and responses

If you prefer not to use Prisma, you can swap in any Postgres client and adapt the code in `app/api/*.ts` files.
