import process from "node:process";

export default defineNuxtConfig({
	future: {
		compatibilityVersion: 5,
	},

	app: {
		// Page transitions are handled by the native View Transitions API
		// (app/plugins/view-transitions.client.ts) instead of Vue transitions.
		pageTransition: false,
	},

	modules: [
		"@nuxt/content",
		// Only needed by Vitest / devtools; skipping it speeds up `nuxt generate`.
		...(process.env.NODE_ENV === "production" ? [] : ["@nuxt/test-utils/module"]),
	],

	experimental: {
		componentIslands: true,
	},

	content: {
		experimental: {
			sqliteConnector: "native", 
		},
		renderer: {
			anchorLinks: false,
		},
		// Disable caching in test environment to prevent SQLite corruption
		...(process.env.NODE_ENV === "test" && {
			cache: false,
			storage: "memory",
		}),
	},

	compatibilityDate: "2024-08-20",

	vite: {
		optimizeDeps: {
			include: ["@vue/devtools-core", "@vue/devtools-kit"],
		},
	},

	routeRules: {
		// Static assets with long cache lifetime (1 year)
		"/styles/**": {
			headers: {
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		},
		"/static/**": {
			headers: {
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		},
		"/images/**": {
			headers: {
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		},
		"/_nuxt/**": {
			headers: {
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		},
		// HTML pages with shorter cache (1 hour) to allow for content updates
		"/**": {
			headers: {
				"Cache-Control": "public, max-age=3600, must-revalidate",
			},
		},
	},

	hooks: {
		"content:file:afterParse"(ctx) {
			const { file, content } = ctx;

			const wordsPerMinute = 180;
			const text = typeof file.body === "string" ? file.body : "";
			const wordCount = text.split(/\s+/).length;

			content.readingTime = Math.ceil(wordCount / wordsPerMinute);
		},
	},
});
