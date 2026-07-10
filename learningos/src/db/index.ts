import "server-only";
import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";

/**
 * Database singleton on libSQL. `DATABASE_URL` is a local `file:` path in dev
 * and tests, and a remote `libsql://…turso.io` URL in production (with
 * `DATABASE_AUTH_TOKEN`). The libSQL client handles both, so the same Drizzle
 * code runs everywhere and the SQLite migrations are reused unchanged.
 *
 * Cached on globalThis so Next's dev hot-reload doesn't open a new client per
 * request.
 */
const url = process.env.DATABASE_URL ?? "file:learningos.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const globalForDb = globalThis as unknown as { __libsql?: Client };
const client =
  globalForDb.__libsql ?? createClient(authToken ? { url, authToken } : { url });
if (process.env.NODE_ENV !== "production") globalForDb.__libsql = client;

export const db = drizzle(client, { schema });
export { schema };
