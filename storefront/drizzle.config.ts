import { defineConfig } from "drizzle-kit";

// Only `drizzle-kit generate` is used; migrations are applied by scripts/migrate.ts
// so the same command works for Neon and the local PGlite database.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
