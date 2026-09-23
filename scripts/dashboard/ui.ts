// Drawing primitives shared by the dashboard views. Widgets are plain functions
// that paint into the Screen and register hit regions for the mouse.

import { type Rect, Screen, textWidth, truncate } from "./screen.ts";
import { darken, lighten, palette } from "./theme.ts";

export interface Region {
	id: string;
	rect: Rect;
	/** Higher layers (the modal) shadow everything below them. */
	layer: number;
	focusable?: boolean;
	/** Mouse down, with the pointer position. */
	onPress?: (x: number, y: number) => void;
	/** Mouse up on the same region, or Enter/Space while focused. */
	onClick?: () => void;
	onWheel?: (delta: number) => void;
}

/** Hit regions registered during the current frame, in paint order. */
export class Regions {
	list: Region[] = [];
	layer = 0;

	reset() {
		this.list = [];
		this.layer = 0;
	}

	add(region: Omit<Region, "layer">) {
		this.list.push({ ...region, layer: this.layer });
	}

	get top() {
		return this.list.reduce((top, region) => Math.max(top, region.layer), 0);
	}

	/** Topmost region under the pointer, optionally filtered. */
	at(x: number, y: number, filter?: (region: Region) => boolean) {
		const top = this.top;
		for (let i = this.list.length - 1; i >= 0; i--) {
			const region = this.list[i];
			if (region.layer !== top) continue;
			const { rect } = region;
			if (
				x >= rect.x &&
				y >= rect.y &&
				x < rect.x + rect.w &&
				y < rect.y + rect.h &&
				(!filter || filter(region))
			) {
				return region;
			}
		}
	}

	byId(id: string | null) {
		return this.list.find((region) => region.id === id);
	}

	/** Focusable ids of the topmost layer, in paint order. */
	focusables() {
		const top = this.top;
		return this.list
			.filter((region) => region.layer === top && region.focusable)
			.map((region) => region.id);
	}
}

export const inset = (rect: Rect, dx: number, dy: number): Rect => ({
	x: rect.x + dx,
	y: rect.y + dy,
	w: Math.max(0, rect.w - dx * 2),
	h: Math.max(0, rect.h - dy * 2),
});

export interface PanelOptions {
	title: string;
	/** Dot next to the title. */
	color: number;
	/** Right-aligned text in the top border. */
	info?: string;
	/** Hint in the bottom border. */
	footer?: string;
	background?: number;
	border?: number;
}

/** Rounded bordered box; returns the padded content area. */
export const panel = (screen: Screen, rect: Rect, options: PanelOptions) => {
	const { x, y, w, h } = rect;
	const bg = options.background ?? palette.surface;
	const border = { fg: options.border ?? palette.border, bg };

	screen.fill(rect, { bg, fg: palette.text });
	screen.text(x, y, `╭${"─".repeat(w - 2)}╮`, border);
	screen.text(x, y + h - 1, `╰${"─".repeat(w - 2)}╯`, border);
	for (let row = y + 1; row < y + h - 1; row++) {
		screen.text(x, row, "│", border);
		screen.text(x + w - 1, row, "│", border);
	}

	const title = truncate(options.title, w - 8);
	screen.text(x + 2, y, " ● ", { fg: options.color, bg });
	const titleWidth = screen.text(x + 5, y, `${title} `, {
		fg: palette.text,
		bg,
		bold: true,
	});

	if (options.info) {
		const room = w - 5 - titleWidth - 4;
		const info = truncate(options.info, room - 2);
		if (info && room > 4) {
			screen.text(x + w - 3 - textWidth(info) - 1, y, ` ${info} `, {
				fg: palette.muted,
				bg,
			});
		}
	}

	if (options.footer && textWidth(options.footer) + 6 < w) {
		screen.text(
			x + w - 4 - textWidth(options.footer),
			y + h - 1,
			` ${options.footer} `,
			{ fg: palette.faint, bg },
		);
	}

	return inset(rect, 2, 1);
};

/** Draws a thumb over the panel's right border when content overflows. */
export const scrollbar = (
	screen: Screen,
	rect: Rect,
	offset: number,
	visible: number,
	total: number,
) => {
	if (total <= visible || visible <= 0) return;
	const track = rect.h - 2;
	const size = Math.max(1, Math.round((visible / total) * track));
	const start = Math.round((offset / (total - visible)) * (track - size));
	for (let i = 0; i < size; i++) {
		screen.text(rect.x + rect.w - 1, rect.y + 1 + start + i, "┃", {
			fg: palette.muted,
		});
	}
};

export interface ButtonState {
	hovered: boolean;
	focused: boolean;
	pressed: boolean;
}

export interface ButtonOptions {
	id: string;
	x: number;
	y: number;
	label: string;
	/** Face color. */
	color: number;
	textColor?: number;
	/** Background the button sits on (for the half-block edges). */
	on: number;
	/** Three rows with half-block caps instead of a single row. */
	tall: boolean;
	state: ButtonState;
	onClick: () => void;
}

export const buttonWidth = (label: string) => textWidth(label) + 6;

export const button = (
	screen: Screen,
	regions: Regions,
	options: ButtonOptions,
) => {
	const { x, y, label, on, tall, state } = options;
	const w = buttonWidth(label);
	const face = state.pressed
		? darken(options.color, 0.25)
		: state.hovered
		? lighten(options.color, 0.18)
		: state.focused
		? lighten(options.color, 0.1)
		: options.color;
	const mid = tall ? y + 1 : y;

	if (tall) {
		screen.text(x, y, "▄".repeat(w), { fg: face, bg: on });
		screen.text(x, y + 2, "▀".repeat(w), { fg: face, bg: on });
	}
	screen.fill({ x, y: mid, w, h: 1 }, { bg: face });
	screen.text(x + 3, mid, label, {
		fg: options.textColor ?? palette.white,
		bg: face,
		bold: state.hovered || state.focused,
		// Keyboard focus stays visible even when the mouse is elsewhere.
		underline: state.focused,
	});

	regions.add({
		id: options.id,
		rect: { x, y, w, h: tall ? 3 : 1 },
		focusable: true,
		onClick: options.onClick,
	});
	return w;
};

// 3-row block font for the big numbers on the stat cards.
const FONT: Record<string, [string, string, string]> = {
	"0": ["█▀█", "█ █", "▀▀▀"],
	"1": ["▀█ ", " █ ", "▀▀▀"],
	"2": ["▀▀█", "█▀▀", "▀▀▀"],
	"3": ["▀▀█", " ▀█", "▀▀▀"],
	"4": ["█ █", "▀▀█", "  ▀"],
	"5": ["█▀▀", "▀▀█", "▀▀▀"],
	"6": ["█▀▀", "█▀█", "▀▀▀"],
	"7": ["▀▀█", "  █", "  ▀"],
	"8": ["█▀█", "█▀█", "▀▀▀"],
	"9": ["█▀█", "▀▀█", "▀▀▀"],
	"k": ["█  ", "█▄▀", "▀ ▀"],
	".": [" ", " ", "▀"],
	"-": ["   ", "▀▀▀", "   "],
};

/** Renders `text` in the block font; unknown characters are skipped. */
export const bigText = (text: string): [string, string, string] => {
	const glyphs = [...text].map((char) => FONT[char]).filter(Boolean);
	return [0, 1, 2].map((row) =>
		glyphs.map((glyph) => glyph[row]).join(" ")
	) as [string, string, string];
};

const EIGHTHS_UP = " ▁▂▃▄▅▆▇█";
const EIGHTHS_RIGHT = " ▏▎▍▌▋▊▉█";

/** Vertical bar `height` rows tall at most, filled to `ratio` in eighths. */
export const vbar = (
	screen: Screen,
	x: number,
	bottom: number,
	width: number,
	height: number,
	ratio: number,
	fg: number,
) => {
	let eighths = Math.round(ratio * height * 8);
	// Non-zero values always show at least a sliver.
	if (ratio > 0 && eighths === 0) eighths = 1;
	for (let row = 0; row < height && eighths > 0; row++) {
		const char = EIGHTHS_UP[Math.min(8, eighths)];
		screen.text(x, bottom - row, char.repeat(width), { fg });
		eighths -= 8;
	}
};

/** Horizontal bar up to `width` columns, filled to `ratio` in eighths. */
export const hbar = (
	screen: Screen,
	x: number,
	y: number,
	width: number,
	ratio: number,
	fg: number,
) => {
	let eighths = Math.max(ratio > 0 ? 1 : 0, Math.round(ratio * width * 8));
	let bar = "";
	while (eighths > 0) {
		bar += EIGHTHS_RIGHT[Math.min(8, eighths)];
		eighths -= 8;
	}
	screen.text(x, y, bar, { fg });
	return textWidth(bar);
};
