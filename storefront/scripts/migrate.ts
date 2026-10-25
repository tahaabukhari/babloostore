import "./env";
import { migrate as migrateNeon } from "drizzle-orm/neon-serverless/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { db, isLocalDb } from "../src/db";

async function main() {
  const migrationsFolder = "./drizzle";
  if (isLocalDb()) {
    console.log("Applying migrations to local PGlite database (./.data/pglite)…");
    await migratePglite(db as unknown as PgliteDatabase, { migrationsFolder });
  } else {
    console.log("Applying migrations to DATABASE_URL…");
    await migrateNeon(db, { migrationsFolder });
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
