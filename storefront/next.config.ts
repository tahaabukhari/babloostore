import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a WASM Postgres; `ws` breaks when bundled ("b.mask is not a function").
  serverExternalPackages: ["@electric-sql/pglite", "ws"],
  experimental: {
    // Photos are resized in the browser first; Vercel caps request bodies at 4.5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
