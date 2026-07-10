import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // libSQL ships native bindings; keep it external to the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // This app sits in a subdirectory alongside sibling projects; pin the tracing
  // root so Next doesn't infer the parent repo as the workspace root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
