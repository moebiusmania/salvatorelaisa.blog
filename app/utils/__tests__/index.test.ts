import { describe, it, expect, afterEach, vi } from "vitest";
import { prefersDark, THEME_COOKIE, LIGHT, DARK } from "../index";

describe("Theme utilities", () => {
	afterEach(() => {
		vi.restoreAllMocks();
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
			vi.spyOn(window, "matchMedia").mockImplementation(
				(query: string) =>
					({
						matches: query.includes("dark"),
						media: query,
						addEventListener: () => {},
						removeEventListener: () => {},
					}) as unknown as MediaQueryList,
			);

			expect(prefersDark()).toBe(true);
		});

		it("returns false when the system does not request a dark color scheme", () => {
			vi.spyOn(window, "matchMedia").mockImplementation(
				(query: string) =>
					({
						matches: false,
						media: query,
						addEventListener: () => {},
						removeEventListener: () => {},
					}) as unknown as MediaQueryList,
			);

			expect(prefersDark()).toBe(false);
		});
	});
});
