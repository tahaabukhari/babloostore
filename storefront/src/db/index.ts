import { PGlite } from "@electric-sql/pglite";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { mkdirSync } from "node:fs";
import ws from "ws";
import * as schema from "./schema";

export type DB = NeonDatabase<typeof schema>;

export const LOCAL_DB_DIR = process.env.PGLITE_DIR ?? "./.data/pglite";

/**
 * DATABASE_URL set   → Neon (or any Postgres reachable over Neon's WebSocket proxy).
 * DATABASE_URL unset → embedded PGlite in ./.data/pglite for local testing.
 *   PGlite is single-process: stop `npm run dev` before running db/owner scripts.
 */
export function isLocalDb() {
  return !process.env.DATABASE_URL;
}

function create(): DB {
  const url = process.env.DATABASE_URL;
  if (url) {
    neonConfig.webSocketConstructor = ws;
    return drizzleNeon({ client: new Pool({ connectionString: url }), schema });
  }
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_DB) {
    throw new Error("DATABASE_URL is not set. Add your Neon connection string to the environment.");
  }
  mkdirSync(LOCAL_DB_DIR, { recursive: true });
  // Both drivers expose the same Postgres query builder; the cast keeps one DB type.
  return drizzlePglite({ client: new PGlite(LOCAL_DB_DIR), schema }) as unknown as DB;
}

// Created on first use (so `next build` doesn't need a database) and reused
// across hot reloads in development.
const g = globalThis as unknown as { __bsDb?: DB };
function instance() {
  return (g.__bsDb ??= create());
}
export const db = new Proxy({} as DB, {
  get(_, prop) {
    const real = instance();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
export { schema };
