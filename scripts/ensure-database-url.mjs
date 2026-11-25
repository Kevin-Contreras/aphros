const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL;

if (!url) {
  console.error(`
Missing database URL for prisma migrate deploy.

In Vercel:
  1. Project → Storage → create/connect Prisma Postgres (or Postgres)
  2. Or Settings → Environment Variables → add DATABASE_URL
     (postgresql://...@...:5432/postgres?sslmode=require)
  3. Enable it for Production (and Preview if needed)
  4. Redeploy

Locally: npx vercel env pull .env.local
`);
  process.exit(1);
}
