// Vitest setup file to prevent SQLite corruption issues
import { beforeAll } from "vitest";

beforeAll(() => {
	// Disable content caching to prevent SQLite corruption
	process.env.NUXT_CONTENT_CACHE = "false";

	// Set content to use memory storage instead of SQLite
	process.env.NUXT_CONTENT_STORAGE = "memory";

	// Disable content database
	process.env.NUXT_CONTENT_DATABASE = "false";
});
