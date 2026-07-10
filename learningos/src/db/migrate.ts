import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

/**
 * Apply all pending SQL migrations from ./drizzle. Works against a local file:
 * database or a remote Turso libsql:// URL (set DATABASE_URL / DATABASE_AUTH_TOKEN).
 * Run with `npm run db:migrate`. Idempotent.
 */
async function main() {
  const url = process.env.DATABASE_URL ?? "file:learningos.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });
  client.close();
  console.log(`Migrations applied to ${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
