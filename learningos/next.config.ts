import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // better-sqlite3 is a native module; keep it external to the server bundle.
  serverExternalPackages: ["better-sqlite3"],
  // This app sits in a subdirectory alongside sibling projects; pin the tracing
  // root so Next doesn't infer the parent repo as the workspace root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
