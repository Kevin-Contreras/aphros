import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prefer direct (non-pooled) URL for migrations
const url =
  process.env.DATABASE_URL ||
  process.env.APHROS_DATABASE_URL ||
  process.env.APHROS_POSTGRES_URL ||
  process.env.APHROS_PRISMA_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.APHROS_DATABASE_URL_POOLED ||
  "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
