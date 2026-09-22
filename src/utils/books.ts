// Presentation logic for the /books shelf.
//
// Every book is drawn as a spine seen from the side, and the shelf only looks
// like a shelf if the spines differ in colour, height and thickness. Those
// variations have to be *stable*, though: `Math.random()` would produce a
// different value on the server than on the client (hydration mismatch) and
// would reshuffle the whole shelf on every build. So they are derived from a
// hash of the book's path instead — random-looking, but a pure function of the
// content. A book can always opt out via the `color` / `height` front matter.

export interface BookLike {
	path?: string;
	title?: string;
	color?: string;
	height?: string;
	read?: string;
}

export type SpineHeight = "short" | "medium" | "tall" | "xtall";

// Percentages of the shelf slot, so a spine of any height still stands on the
// plank rather than floating. The floor is deliberately high: the title runs
// along the spine's length untruncated, so even the shortest book has to be
// long enough to hold it.
export const SPINE_HEIGHTS: Record<SpineHeight, string> = {
	short: "80%",
	medium: "87%",
	tall: "93%",
	xtall: "100%",
};

const HEIGHT_KEYS: SpineHeight[] = ["short", "medium", "tall", "xtall"];

// Book-cloth tones. Deliberately not theme tokens: a real spine keeps its
// colour whatever the room's lighting, and the theme already supplies the
// shelf, the plank and the page around them.
export const SPINE_COLORS: string[] = [
	"#7c2d2d", // oxblood
	"#2f4f3e", // forest
	"#1f3a5f", // navy
	"#c9a227", // mustard
	"#256b6b", // teal
	"#5b3a67", // plum
	"#a5491a", // rust
	"#4a5568", // slate
	"#8a3d52", // burgundy rose
	"#3f6b35", // olive
];

// Uniform thickness is what makes a fake shelf look fake. The thinnest spine
// still has to fit two stacked lines of text across its width — title and
// author, plus the spine's own horizontal padding — which is what sets the
// lower bound here.
export const SPINE_WIDTHS: string[] = ["2.6rem", "3rem", "3.4rem", "3.9rem"];

/**
 * FNV-1a, 32 bit, followed by a MurmurHash3 finalizer. Small, dependency-free
 * and stable across runtimes — which is the whole point here: the server and
 * the browser must agree on every spine.
 *
 * The finalizer is not decoration. Plain FNV-1a barely mixes its low bits, so
 * `hash(x) % n` for a small `n` stays a near-direct function of the last few
 * input bytes: two keys differing only by a suffix land a constant distance
 * apart for every input, which makes attributes picked that way move in
 * lockstep instead of independently.
 */
export const hashString = (input: string): number => {
	let hash = 2166136261;

	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	hash ^= hash >>> 16;
	hash = Math.imul(hash, 2246822507);
	hash ^= hash >>> 13;
	hash = Math.imul(hash, 3266489909);
	hash ^= hash >>> 16;

	return hash >>> 0;
};

// Each attribute is hashed from its own key, so colour, height and thickness
// vary independently. Deriving them from one seed by offsetting the index
// instead correlates them: with four heights and four widths, a constant offset
// means every spine of a given height also has the same thickness.
const pick = <T>(list: T[], key: string): T =>
	list[hashString(key) % list.length] as T;

const isSpineHeight = (value: string): value is SpineHeight =>
	HEIGHT_KEYS.includes(value as SpineHeight);

export const INK_LIGHT = "#f6f2ea";
export const INK_DARK = "#1a1714";

/**
 * WCAG relative luminance, or `null` if the input is not a hex colour.
 */
const luminance = (color: string): number | null => {
	const hex = color.replace("#", "");
	const full =
		hex.length === 3
			? hex
					.split("")
					.map((char) => char + char)
					.join("")
			: hex;

	if (!/^[0-9a-f]{6}$/i.test(full)) return null;

	const channels = [0, 2, 4].map((offset) => {
		const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
		return value <= 0.03928
			? value / 12.92
			: Math.pow((value + 0.055) / 1.055, 2.4);
	});

	return (
		0.2126 * (channels[0] as number) +
		0.7152 * (channels[1] as number) +
		0.0722 * (channels[2] as number)
	);
};

const contrast = (a: number, b: number): number =>
	(Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * WCAG contrast ratio between two hex colours, 1 (identical) to 21 (black on
 * white). Returns 1 if either colour is unparseable. Exported so the palette
 * itself can be held to a legibility floor in the tests.
 */
export const contrastRatio = (a: string, b: string): number => {
	const first = luminance(a);
	const second = luminance(b);

	return first === null || second === null ? 1 : contrast(first, second);
};

/**
 * Ink colour that stays readable on `background`. Whichever of the two inks
 * wins on WCAG contrast is the one that gets used — a fixed luminance threshold
 * gets the mid-tone spines wrong (mustard is dark enough to look "dark" by
 * eye, but carries dark text at 7:1 and light text at barely 2:1).
 */
export const readableInk = (background: string): string => {
	const background_l = luminance(background);
	if (background_l === null) return INK_LIGHT;

	const light_l = luminance(INK_LIGHT) as number;
	const dark_l = luminance(INK_DARK) as number;

	return contrast(background_l, dark_l) >= contrast(background_l, light_l)
		? INK_DARK
		: INK_LIGHT;
};

/**
 * How far the spine's two gradient ends are pushed off the base colour.
 *
 * These are deliberately asymmetric and deliberately small on the lit side.
 * The text sits on the lit edge, so lightening the colour there eats directly
 * into its contrast: at 14% white the teal, rust and olive spines drop to
 * 4.0:1. 6% keeps the whole palette above 4.5:1 while still turning the spine,
 * and most of the visible depth is carried by the shaded edge instead, where
 * there is no text to fight with.
 */
export const LIT_MIX = 0.94;
export const SHADE_MIX = 0.82;

/**
 * Channel-wise blend of `color` toward `toward`, in gamma-encoded sRGB — the
 * same space `color-mix(in srgb, …)` uses. Returns `color` unchanged if either
 * input is not a hex colour.
 */
export const mixHex = (
	color: string,
	amount: number,
	toward: string,
): string => {
	const parse = (value: string): number[] | null => {
		const hex = value.replace("#", "");
		const full =
			hex.length === 3
				? hex
						.split("")
						.map((char) => char + char)
						.join("")
				: hex;

		return /^[0-9a-f]{6}$/i.test(full)
			? [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16))
			: null;
	};

	const base = parse(color);
	const other = parse(toward);
	if (!base || !other) return color;

	return `#${base
		.map((channel, index) =>
			Math.round(channel * amount + (other[index] as number) * (1 - amount))
				.toString(16)
				.padStart(2, "0"),
		)
		.join("")}`;
};

/**
 * The CSS custom properties one spine needs. Front matter wins over the hash,
 * so a book whose automatic look is wrong can be pinned by hand.
 *
 * The two gradient ends are computed here rather than with `color-mix()` in the
 * stylesheet so that the palette, the ink and the tones the ink actually sits
 * on all come from one place and can be held to a contrast floor in the tests.
 */
export const spineStyle = (book: BookLike): Record<string, string> => {
	const key = book.path || book.title || "";
	const color = book.color || pick(SPINE_COLORS, `${key}:color`);
	const height =
		book.height && isSpineHeight(book.height)
			? book.height
			: pick(HEIGHT_KEYS, `${key}:height`);

	return {
		"--book-color": color,
		"--book-lit": mixHex(color, LIT_MIX, "#ffffff"),
		"--book-shade": mixHex(color, SHADE_MIX, "#000000"),
		"--book-height": SPINE_HEIGHTS[height],
		"--book-width": pick(SPINE_WIDTHS, `${key}:width`),
		"--book-ink": readableInk(color),
	};
};

/**
 * Most recently read first; books with no read date collect at the end of the
 * last shelf. Plain string compare is enough for both "2025-03-14" and the
 * partial "2025-03" — ISO dates sort lexicographically.
 */
export const sortBooks = <T extends BookLike>(books: T[]): T[] =>
	[...books].sort((a, b) => {
		if (!a.read && !b.read) return 0;
		if (!a.read) return 1;
		if (!b.read) return -1;
		return b.read.localeCompare(a.read);
	});

/**
 * Same shape as DeviceCard's `formatDate`: a bare year is passed through as-is,
 * anything else goes through the Italian locale.
 */
export const formatRead = (read: string): string => {
	const parts = read.split("-");
	return parts.length === 1 ? read : new Date(read).toLocaleDateString("it");
};
