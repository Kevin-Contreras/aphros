const url =
  process.env.DATABASE_URL ||
  process.env.APHROS_DATABASE_URL ||
  process.env.APHROS_POSTGRES_URL ||
  process.env.APHROS_PRISMA_DATABASE_URL ||
  process.env.APHROS_DATABASE_URL_POOLED ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL;

if (!url) {
  console.error(`
Missing database URL for prisma migrate deploy.

Expected one of:
  DATABASE_URL
  APHROS_DATABASE_URL
  APHROS_POSTGRES_URL
  APHROS_DATABASE_URL_POOLED

In Vercel → Settings → Environment Variables, confirm the Prisma Postgres
integration variables are enabled for Production, then redeploy.
`);
  process.exit(1);
}
