import "dotenv/config";
import { defineConfig } from "prisma/config";

function isUsableDatabaseUrl(url: string | undefined): url is string {
  if (!url) return false;
  if (url.includes("@HOST:") || url.includes("USER:PASSWORD")) return false;
  return /^(postgres|postgresql):\/\//i.test(url);
}

function firstUsable(...candidates: (string | undefined)[]) {
  for (const value of candidates) {
    if (isUsableDatabaseUrl(value)) return value;
  }
  return "";
}

// Prefer APHROS_* (Vercel Marketplace prefix) over a leftover placeholder DATABASE_URL
const url = firstUsable(
  process.env.APHROS_DATABASE_URL,
  process.env.APHROS_POSTGRES_URL,
  process.env.APHROS_PRISMA_DATABASE_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL,
  process.env.PRISMA_DATABASE_URL,
  process.env.APHROS_DATABASE_URL_POOLED,
);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
