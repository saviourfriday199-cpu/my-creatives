import type { Config } from "drizzle-kit";

/**
 * Drizzle Kit config. Dev/test use SQLite (better-sqlite3); production swaps
 * DATABASE_URL to Postgres — see docs/ARCHITECTURE.md for the migration path.
 */
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./learningos.db",
  },
} satisfies Config;
