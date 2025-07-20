import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    environment: "nuxt",
    include: ["**/*.test.ts", "**/*.spec.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
