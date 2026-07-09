import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This app lives in a subdirectory alongside another project; pin the tracing
  // root here so Next doesn't infer the parent repo as the workspace root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
