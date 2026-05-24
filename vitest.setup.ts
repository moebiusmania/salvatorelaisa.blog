// Vitest setup file to prevent SQLite corruption issues
import { beforeAll } from "vitest";

class MockStorage {
	private store: Map<string, string> = new Map();

	clear() {
		this.store.clear();
	}

	getItem(key: string): string | null {
		return this.store.get(key) ?? null;
	}

	setItem(key: string, value: string) {
		this.store.set(key, value);
	}

	removeItem(key: string) {
		this.store.delete(key);
	}
}

beforeAll(() => {
	// Disable content caching to prevent SQLite corruption
	process.env.NUXT_CONTENT_CACHE = "false";

	// Set content to use memory storage instead of SQLite
	process.env.NUXT_CONTENT_STORAGE = "memory";

	// Disable content database
	process.env.NUXT_CONTENT_DATABASE = "false";

	// Provide a localStorage mock for tests
	Object.defineProperty(globalThis, "localStorage", {
		value: new MockStorage(),
		writable: false,
		configurable: true,
	});
});
