import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a WASM Postgres; keep it out of the server bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Photos are resized in the browser first; Vercel caps request bodies at 4.5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
