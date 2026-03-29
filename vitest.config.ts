import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
	test: {
		globals: true,
		environment: "nuxt",
		include: ["**/*.test.ts", "**/*.spec.ts"],
		setupFiles: ["./vitest.setup.ts"],
	},
	// Flat Vite options (not under `vite:`) — @nuxt/test-utils merges into root config.
	// Redirects deprecated `vitest/environments` used by @nuxt/test-utils → `vitest/runtime`.
	resolve: {
		alias: {
			"vitest/environments": "vitest/runtime",
		},
	},
});
