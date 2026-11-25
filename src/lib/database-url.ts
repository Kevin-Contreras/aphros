/** Direct (migrate / admin) Prisma Postgres URL. */
export function getDirectDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.APHROS_DATABASE_URL ||
    process.env.APHROS_POSTGRES_URL ||
    process.env.APHROS_PRISMA_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL ||
    ""
  );
}

/**
 * Runtime URL — prefer pooled endpoint on Vercel.
 * Falls back to the direct URL when pooled is unavailable.
 */
export function getDatabaseUrl() {
  return (
    process.env.APHROS_DATABASE_URL_POOLED ||
    process.env.DATABASE_URL_POOLED ||
    process.env.POSTGRES_URL_POOLED ||
    getDirectDatabaseUrl()
  );
}
