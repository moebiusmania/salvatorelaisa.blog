import { describe, it, expect } from "vitest";
import {
	hashString,
	readableInk,
	contrastRatio,
	mixHex,
	spineStyle,
	LIT_MIX,
	SHADE_MIX,
	sortBooks,
	formatRead,
	INK_DARK,
	INK_LIGHT,
	SPINE_COLORS,
	SPINE_HEIGHTS,
	SPINE_WIDTHS,
} from "../books";

describe("hashString", () => {
	it("is stable for the same input", () => {
		expect(hashString("/books/dune")).toBe(hashString("/books/dune"));
	});

	it("differs across inputs", () => {
		expect(hashString("/books/dune")).not.toBe(hashString("/books/sapiens"));
	});

	it("returns a non-negative integer", () => {
		const hash = hashString("/books/kafka-sulla-spiaggia");
		expect(Number.isInteger(hash)).toBe(true);
		expect(hash).toBeGreaterThanOrEqual(0);
	});
});

describe("readableInk", () => {
	it("returns dark ink on a light background", () => {
		expect(readableInk("#ffffff")).toBe(INK_DARK);
	});

	it("returns light ink on a dark background", () => {
		expect(readableInk("#1f3a5f")).toBe(INK_LIGHT);
		expect(readableInk("#000000")).toBe(INK_LIGHT);
	});

	// A fixed luminance threshold gets this one wrong: mustard reads as a dark
	// colour by eye but carries dark text far better than light text.
	it("returns dark ink on mid-tone mustard", () => {
		expect(readableInk("#c9a227")).toBe(INK_DARK);
	});

	it("supports shorthand hex", () => {
		expect(readableInk("#fff")).toBe(INK_DARK);
	});

	it("falls back to light ink for malformed input", () => {
		expect(readableInk("nope")).toBe(INK_LIGHT);
		expect(readableInk("#12345g")).toBe(INK_LIGHT);
	});

	// Guards the palette, not the function: adding a spine colour that cannot
	// carry either ink legibly should fail here.
	it("keeps every palette colour above 4.5:1 against its chosen ink", () => {
		SPINE_COLORS.forEach((color) => {
			expect(contrastRatio(color, readableInk(color))).toBeGreaterThanOrEqual(
				4.5,
			);
		});
	});

	// The spine is a gradient, so the base colour clearing the floor is not
	// enough — the ink has to survive both ends. The lit end is the binding
	// constraint, since that is the edge the text sits on.
	it("keeps both gradient ends above 4.5:1 against the chosen ink", () => {
		SPINE_COLORS.forEach((color) => {
			const ink = readableInk(color);

			expect(
				contrastRatio(mixHex(color, LIT_MIX, "#ffffff"), ink),
			).toBeGreaterThanOrEqual(4.5);
			expect(
				contrastRatio(mixHex(color, SHADE_MIX, "#000000"), ink),
			).toBeGreaterThanOrEqual(4.5);
		});
	});
});

describe("mixHex", () => {
	it("blends channel-wise toward white", () => {
		expect(mixHex("#000000", 0.5, "#ffffff")).toBe("#808080");
	});

	it("blends channel-wise toward black", () => {
		expect(mixHex("#ffffff", 0.5, "#000000")).toBe("#808080");
	});

	it("returns the colour unchanged at full amount", () => {
		expect(mixHex("#256b6b", 1, "#ffffff")).toBe("#256b6b");
	});

	it("expands shorthand hex", () => {
		expect(mixHex("#fff", 1, "#000000")).toBe("#ffffff");
	});

	it("passes malformed input through untouched", () => {
		expect(mixHex("nope", 0.5, "#ffffff")).toBe("nope");
		expect(mixHex("#256b6b", 0.5, "nope")).toBe("#256b6b");
	});
});

describe("contrastRatio", () => {
	it("computes the known black-on-white ratio", () => {
		expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
	});

	it("returns 1 for identical colours", () => {
		expect(contrastRatio("#256b6b", "#256b6b")).toBeCloseTo(1, 5);
	});

	it("returns 1 when a colour is unparseable", () => {
		expect(contrastRatio("nope", "#ffffff")).toBe(1);
	});
});

describe("spineStyle", () => {
	it("is deterministic for a given path", () => {
		const book = { path: "/books/dune" };
		expect(spineStyle(book)).toEqual(spineStyle(book));
	});

	it("picks values from the curated lists", () => {
		const style = spineStyle({ path: "/books/sapiens" });

		expect(SPINE_COLORS).toContain(style["--book-color"]);
		expect(SPINE_WIDTHS).toContain(style["--book-width"]);
		expect(Object.values(SPINE_HEIGHTS)).toContain(style["--book-height"]);
	});

	it("lets front matter override the hashed colour and height", () => {
		const style = spineStyle({
			path: "/books/dune",
			color: "#b4551f",
			height: "xtall",
		});

		expect(style["--book-color"]).toBe("#b4551f");
		expect(style["--book-height"]).toBe(SPINE_HEIGHTS.xtall);
	});

	it("recomputes the ink from an overridden colour", () => {
		expect(spineStyle({ path: "/books/x", color: "#ffffff" })["--book-ink"]).toBe(
			INK_DARK,
		);
		expect(spineStyle({ path: "/books/x", color: "#000000" })["--book-ink"]).toBe(
			INK_LIGHT,
		);
	});

	it("falls back to a hashed height when the override is not a known tier", () => {
		const style = spineStyle({ path: "/books/dune", height: "enormous" });
		expect(Object.values(SPINE_HEIGHTS)).toContain(style["--book-height"]);
	});

	// Regression: deriving every attribute from one seed by offsetting the index
	// locks height and thickness together, because both lists have four entries.
	// Each attribute must be hashed from its own key.
	it("varies height and width independently", () => {
		const pairs = new Map<string, Set<string>>();

		for (let i = 0; i < 60; i++) {
			const style = spineStyle({ path: `/books/book-${i}` });
			const height = style["--book-height"] as string;
			const width = style["--book-width"] as string;

			if (!pairs.has(height)) pairs.set(height, new Set());
			pairs.get(height)?.add(width);
		}

		// If the two were correlated, every height would map to exactly one width.
		const widthsPerHeight = [...pairs.values()].map((set) => set.size);
		expect(Math.max(...widthsPerHeight)).toBeGreaterThan(1);
	});

	it("uses the full colour palette across many books", () => {
		const seen = new Set(
			Array.from({ length: 200 }, (_, i) =>
				spineStyle({ path: `/books/book-${i}` })["--book-color"],
			),
		);

		expect(seen.size).toBe(SPINE_COLORS.length);
	});

	it("still produces a full style when the book has no path", () => {
		const style = spineStyle({ title: "Senza path" });

		expect(style["--book-color"]).toBeDefined();
		expect(style["--book-height"]).toBeDefined();
		expect(style["--book-width"]).toBeDefined();
		expect(style["--book-ink"]).toBeDefined();
	});
});

describe("sortBooks", () => {
	it("orders most recently read first and undated last", () => {
		const books = [
			{ path: "/books/c", read: "2022-09-20" },
			{ path: "/books/d" },
			{ path: "/books/a", read: "2025-03-14" },
			{ path: "/books/b", read: "2023-06" },
		];

		expect(sortBooks(books).map((book) => book.path)).toEqual([
			"/books/a",
			"/books/b",
			"/books/c",
			"/books/d",
		]);
	});

	it("compares partial and full dates correctly", () => {
		const books = [
			{ path: "/books/full", read: "2023-06-30" },
			{ path: "/books/partial", read: "2023-07" },
		];

		expect(sortBooks(books)[0]?.path).toBe("/books/partial");
	});

	it("does not mutate the input array", () => {
		const books = [
			{ path: "/books/old", read: "2020-01-01" },
			{ path: "/books/new", read: "2025-01-01" },
		];

		sortBooks(books);
		expect(books[0]?.path).toBe("/books/old");
	});
});

describe("formatRead", () => {
	it("passes a bare year through unchanged", () => {
		expect(formatRead("2019")).toBe("2019");
	});

	it("formats a full date with the Italian locale", () => {
		expect(formatRead("2025-03-14")).toBe(
			new Date("2025-03-14").toLocaleDateString("it"),
		);
	});
});
