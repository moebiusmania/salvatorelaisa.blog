import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { DARK, LIGHT, prefersDark, THEME_COOKIE } from "../../src/utils/index.ts";

// Deno has no `window`; install a minimal one exposing just `matchMedia`.
const withMatchMedia = (matches: (query: string) => boolean): void => {
	(globalThis as { window?: unknown }).window = {
		matchMedia: (query: string) =>
			({
				matches: matches(query),
				media: query,
				addEventListener: () => {},
				removeEventListener: () => {},
			}) as unknown as MediaQueryList,
	};
};

describe("Theme utilities", () => {
	afterEach(() => {
		delete (globalThis as { window?: unknown }).window;
	});

	describe("constants", () => {
		it("has correct theme values", () => {
			expect(LIGHT).toBe("light");
			expect(DARK).toBe("dark");
			expect(THEME_COOKIE).toBe("theme");
		});
	});

	describe("prefersDark", () => {
		it("returns true when the system requests a dark color scheme", () => {
			withMatchMedia((query) => query.includes("dark"));
			expect(prefersDark()).toBe(true);
		});

		it("returns false when the system does not request a dark color scheme", () => {
			withMatchMedia(() => false);
			expect(prefersDark()).toBe(false);
		});

		it("returns false without a window (e.g. at build time)", () => {
			expect(prefersDark()).toBe(false);
		});
	});
});
