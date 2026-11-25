import "dotenv/config";
import { defineConfig } from "prisma/config";

// Vercel Storage / Prisma Postgres may inject any of these names
const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Required at migrate deploy / runtime; generate tolerates empty during install
    url: url || "",
  },
});
