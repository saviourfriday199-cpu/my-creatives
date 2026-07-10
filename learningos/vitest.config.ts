import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // One worker + no parallelism: the suite shares a single migrated SQLite file.
    fileParallelism: false,
    env: {
      DATABASE_URL: "file:./test.db",
      NODE_ENV: "test",
      // Force the deterministic heuristic extractor (no network) in tests.
      ANTHROPIC_API_KEY: "",
    },
  },
  resolve: {
    alias: {
      // Neutralise the server-only guard and point @ at src for tests.
      "server-only": resolve(__dirname, "tests/stubs/server-only.ts"),
      "@": resolve(__dirname, "src"),
    },
  },
});
