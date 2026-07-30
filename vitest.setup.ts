import { beforeAll } from "vitest";
import { config } from "@vue/test-utils";

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

config.global.stubs = {
	NuxtLink: {
		template: "<a :href=\"href ?? to ?? ''\"><slot /></a>",
		props: ["href", "to"],
	},
};

function isSuppressedVueWarning(msg: string): boolean {
	return (
		msg.includes("Suspense") ||
		msg.includes("RouterLink") ||
		msg.includes("Failed to resolve component") ||
		msg.includes("Missing required prop")
	);
}

function makeWriteFilter(original: typeof process.stdout.write) {
	return ((chunk: unknown, ...rest: unknown[]) => {
		const str =
			typeof chunk === "string"
				? chunk
				: chunk instanceof Uint8Array
					? new TextDecoder().decode(chunk)
					: "";
		if (isSuppressedVueWarning(str)) return true;
		return original(chunk as string, ...rest);
	}) as typeof process.stdout.write;
}

process.stdout.write = makeWriteFilter(process.stdout.write.bind(process.stdout));
process.stderr.write = makeWriteFilter(process.stderr.write.bind(process.stderr));
