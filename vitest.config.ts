import type { ConfigEnv } from "vite";
import { defineVitestConfig } from "@nuxt/test-utils/config";

const nuxtVitestConfig = defineVitestConfig({
	test: {
		globals: true,
		environment: "nuxt",
		include: ["**/*.test.ts", "**/*.spec.ts"],
		setupFiles: ["./vitest.setup.ts"],
		// The Nuxt environment costs ~1s to spin up, so a worker per file dominated
		// the run. Sharing workers cuts the suite roughly in half; the trade-off is
		// that tests must clean up globals they touch (see BackToTop.test.ts).
		isolate: false,
	},
	// Flat Vite options (not under `vite:`) — @nuxt/test-utils merges into root config.
	// Vitest 5 removed the `vitest/environments` entry point. @nuxt/test-utils picks
	// `vitest/runtime` at runtime, but Vite still resolves the dead `vitest/environments`
	// branch of that ternary at transform time, so it needs somewhere to point.
	// Remove once @nuxt/test-utils drops the fallback.
	resolve: {
		alias: {
			"vitest/environments": "vitest/runtime",
		},
	},
});

// @nuxt/test-utils derives the Vite config by starting a Nuxt build and aborting it
// as soon as the client config resolves, so the client bundle — and its
// `manifest.json` — is never written. Nuxt's `nuxt:client-manifest` plugin still
// comes along for the ride and reads that manifest in `closeBundle`, which Vite
// fires when Vitest tears the environment down, so every run ended with a
// spurious `[NUXT_B7021] The client build manifest was expected at ...` error.
// The plugin has no job in tests (nothing consumes the SSR manifest), so drop it.
export default async (env: ConfigEnv) => {
	const config = await nuxtVitestConfig(env);

	config.plugins = config.plugins?.filter(
		(plugin) =>
			!plugin || !("name" in plugin) || plugin.name !== "nuxt:client-manifest",
	);

	return config;
};
