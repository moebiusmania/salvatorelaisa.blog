// Double-buffered cell grid. Widgets draw into the back buffer every frame and
// `flush()` diffs it against what's on the terminal, so only the cells that
// actually changed are written (typically a handful per mouse move).

import { unicodeWidth } from "@std/cli/unicode-width";

export interface Style {
	/** 0xRRGGBB; undefined keeps the color already in the cell. */
	fg?: number;
	bg?: number;
	bold?: boolean;
	dim?: boolean;
	italic?: boolean;
	underline?: boolean;
}

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

const BOLD = 1;
const DIM = 2;
const ITALIC = 4;
const UNDERLINE = 8;

/** Placeholder for the second column of a wide character. */
const WIDE_TAIL = "";

const segmenter = new Intl.Segmenter();

const widths = new Map<string, number>();
const widthOf = (segment: string) => {
	const code = segment.charCodeAt(0);
	if (segment.length === 1 && code >= 0x20 && code < 0x7f) return 1;
	let width = widths.get(segment);
	if (width === undefined) {
		// Emoji presentation selectors aren't counted by unicodeWidth.
		width = segment.includes("\ufe0f") ? 2 : Math.min(unicodeWidth(segment), 2);
		widths.set(segment, width);
	}
	return width;
};

// Surrogates, combining marks, ZWJ and variation selectors need real grapheme
// segmentation; everything else (nearly all dashboard text) is one char per cell.
const COMPLEX = /[\ud800-\udfff\u0300-\u036f\u200d\ufe00-\ufe0f\u20d0-\u20ff]/;

/** Splits text into grapheme clusters paired with their column width. */
export const graphemes = (text: string): [string, number][] => {
	if (!COMPLEX.test(text)) {
		const out: [string, number][] = new Array(text.length);
		for (let i = 0; i < text.length; i++) out[i] = [text[i], widthOf(text[i])];
		return out;
	}
	return Array.from(segmenter.segment(text), ({ segment }) => [
		segment,
		widthOf(segment),
	]);
};

export const textWidth = (text: string) =>
	graphemes(text).reduce((width, [, w]) => width + w, 0);

/** Crops `text` to `width` columns, ending with an ellipsis when cut. */
export const truncate = (text: string, width: number) => {
	if (width <= 0) return "";
	if (textWidth(text) <= width) return text;
	let out = "";
	let used = 0;
	for (const [g, w] of graphemes(text)) {
		if (used + w > width - 1) break;
		out += g;
		used += w;
	}
	return out + "…";
};

const attrsOf = (style: Style) =>
	(style.bold ? BOLD : 0) |
	(style.dim ? DIM : 0) |
	(style.italic ? ITALIC : 0) |
	(style.underline ? UNDERLINE : 0);

const sgr = (fg: number, bg: number, attrs: number) => {
	let code = "\x1b[0";
	if (attrs & BOLD) code += ";1";
	if (attrs & DIM) code += ";2";
	if (attrs & ITALIC) code += ";3";
	if (attrs & UNDERLINE) code += ";4";
	code += `;38;2;${(fg >> 16) & 255};${(fg >> 8) & 255};${fg & 255}`;
	code += `;48;2;${(bg >> 16) & 255};${(bg >> 8) & 255};${bg & 255}`;
	return code + "m";
};

class Buffer {
	chars: string[];
	fg: Int32Array;
	bg: Int32Array;
	attrs: Uint8Array;

	constructor(size: number) {
		this.chars = new Array(size).fill(" ");
		this.fg = new Int32Array(size);
		this.bg = new Int32Array(size);
		this.attrs = new Uint8Array(size);
	}
}

export class Screen {
	width = 0;
	height = 0;
	#back = new Buffer(0);
	#front = new Buffer(0);
	/** Forces the next flush to repaint everything (after a resize). */
	#invalid = true;
	#clip: Rect | null = null;

	resize(width: number, height: number) {
		if (width === this.width && height === this.height) return;
		this.width = width;
		this.height = height;
		this.#back = new Buffer(width * height);
		this.#front = new Buffer(width * height);
		this.#invalid = true;
	}

	/** Restricts drawing to `rect` while `fn` runs. */
	clip(rect: Rect, fn: () => void) {
		const previous = this.#clip;
		this.#clip = previous ? intersect(previous, rect) : rect;
		try {
			fn();
		} finally {
			this.#clip = previous;
		}
	}

	#visible(x: number, y: number) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
		const clip = this.#clip;
		return (
			!clip ||
			(x >= clip.x && y >= clip.y && x < clip.x + clip.w && y < clip.y + clip.h)
		);
	}

	/** `attrs` is `attrsOf(style)`, computed once by the caller. */
	#put(x: number, y: number, char: string, style: Style, attrs: number) {
		if (!this.#visible(x, y)) return;
		const i = y * this.width + x;
		const back = this.#back;
		// Overwriting half of a wide character: blank out the other half.
		if (back.chars[i] === WIDE_TAIL && x > 0) back.chars[i - 1] = " ";
		if (x + 1 < this.width && back.chars[i + 1] === WIDE_TAIL) {
			back.chars[i + 1] = " ";
		}
		back.chars[i] = char;
		if (style.fg !== undefined) back.fg[i] = style.fg;
		if (style.bg !== undefined) back.bg[i] = style.bg;
		back.attrs[i] = attrs;
	}

	/** Fills the whole back buffer; call at the start of each frame. */
	clear(bg: number, fg: number) {
		const back = this.#back;
		back.chars.fill(" ");
		back.fg.fill(fg);
		back.bg.fill(bg);
		back.attrs.fill(0);
	}

	fill(rect: Rect, style: Style, char = " ") {
		const attrs = attrsOf(style);
		for (let y = rect.y; y < rect.y + rect.h; y++) {
			for (let x = rect.x; x < rect.x + rect.w; x++) {
				this.#put(x, y, char, style, attrs);
			}
		}
	}

	/** Draws single-line text, returns the number of columns used. */
	text(x: number, y: number, text: string, style: Style = {}) {
		const attrs = attrsOf(style);
		let col = x;
		for (const [g, w] of graphemes(text)) {
			if (w === 0) continue;
			if (w === 2) {
				// A wide char that doesn't fit before the edge becomes a space.
				if (col + 1 >= this.width || !this.#visible(col + 1, y)) {
					this.#put(col, y, " ", style, attrs);
				} else {
					this.#put(col, y, g, style, attrs);
					this.#put(col + 1, y, WIDE_TAIL, style, attrs);
				}
			} else {
				this.#put(col, y, g, style, attrs);
			}
			col += w;
		}
		return col - x;
	}

	/** Recolors a region without touching its characters (hover highlights). */
	tint(rect: Rect, style: Style) {
		const back = this.#back;
		for (let y = rect.y; y < rect.y + rect.h; y++) {
			for (let x = rect.x; x < rect.x + rect.w; x++) {
				if (!this.#visible(x, y)) continue;
				const i = y * this.width + x;
				if (style.fg !== undefined) back.fg[i] = style.fg;
				if (style.bg !== undefined) back.bg[i] = style.bg;
			}
		}
	}

	/** Applies `fn` to every color on screen, e.g. to dim it behind a modal. */
	mapColors(fn: (color: number) => number) {
		const { fg, bg } = this.#back;
		for (let i = 0; i < fg.length; i++) {
			fg[i] = fn(fg[i]);
			bg[i] = fn(bg[i]);
		}
	}

	/** Returns the escape sequence that brings the terminal up to date. */
	flush(): string {
		const back = this.#back;
		const front = this.#front;
		const full = this.#invalid;
		this.#invalid = false;

		let out = full ? "\x1b[0m\x1b[2J" : "";
		let cursor = -1;
		let lastStyle = "";

		for (let i = 0; i < back.chars.length; i++) {
			const char = back.chars[i];
			if (char === WIDE_TAIL) continue;
			const wide = i + 1 < back.chars.length && back.chars[i + 1] === WIDE_TAIL;

			const changed = full ||
				char !== front.chars[i] ||
				back.fg[i] !== front.fg[i] ||
				back.bg[i] !== front.bg[i] ||
				back.attrs[i] !== front.attrs[i] ||
				(wide && front.chars[i + 1] !== WIDE_TAIL);
			if (!changed) continue;

			if (cursor !== i) {
				const y = Math.floor(i / this.width);
				out += `\x1b[${y + 1};${i - y * this.width + 1}H`;
			}
			const style = sgr(back.fg[i], back.bg[i], back.attrs[i]);
			if (style !== lastStyle) {
				out += style;
				lastStyle = style;
			}
			out += char;
			cursor = i + (wide ? 2 : 1);
			// Autowrap is off, so the terminal cursor doesn't follow onto the
			// next row: force a move there.
			if (cursor % this.width === 0) cursor = -1;
		}

		// The back buffer becomes the front one; the next frame starts from a
		// copy so widgets never see stale half-drawn state.
		front.chars = back.chars.slice();
		front.fg.set(back.fg);
		front.bg.set(back.bg);
		front.attrs.set(back.attrs);

		// Synchronized output keeps terminals that support it from tearing.
		return out ? `\x1b[?2026h${out}\x1b[0m\x1b[?2026l` : "";
	}
}

const intersect = (a: Rect, b: Rect): Rect => {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	return {
		x,
		y,
		w: Math.max(0, Math.min(a.x + a.w, b.x + b.w) - x),
		h: Math.max(0, Math.min(a.y + a.h, b.y + b.h) - y),
	};
};
