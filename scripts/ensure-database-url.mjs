function isUsableDatabaseUrl(url) {
  if (!url) return false;
  if (url.includes("@HOST:") || url.includes("USER:PASSWORD")) return false;
  return /^(postgres|postgresql):\/\//i.test(url);
}

const candidates = [
  process.env.APHROS_DATABASE_URL,
  process.env.APHROS_POSTGRES_URL,
  process.env.APHROS_PRISMA_DATABASE_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL,
  process.env.PRISMA_DATABASE_URL,
  process.env.APHROS_DATABASE_URL_POOLED,
];

const url = candidates.find(isUsableDatabaseUrl);

if (!url) {
  console.error(`
Missing a usable database URL for prisma migrate deploy.

Expected one of:
  APHROS_DATABASE_URL
  APHROS_POSTGRES_URL
  DATABASE_URL (must not be a placeholder like @HOST)

In Vercel → Settings → Environment Variables:
  - Keep the APHROS_* vars from Prisma Postgres
  - Delete any old DATABASE_URL with HOST/USER:PASSWORD
  - Redeploy
`);
  process.exit(1);
}

console.log("Using database host:", url.replace(/^.*@/, "").replace(/\/.*/, ""));
