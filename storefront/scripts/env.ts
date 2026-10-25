// Scripts run outside Next.js, so load .env.local / .env the same way Next does.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {}
}
