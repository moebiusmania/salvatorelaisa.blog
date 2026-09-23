// Raw terminal I/O: alternate screen, SGR mouse reporting (with hover),
// bracketed paste and an input parser that turns stdin bytes into events.

export type KeyName =
	| "enter"
	| "escape"
	| "tab"
	| "backspace"
	| "delete"
	| "up"
	| "down"
	| "left"
	| "right"
	| "home"
	| "end"
	| "pageup"
	| "pagedown";

export type InputEvent =
	| { type: "key"; name: KeyName; shift?: boolean }
	/** Ctrl + letter, e.g. `{ type: "ctrl", key: "c" }`. */
	| { type: "ctrl"; key: string }
	/** Printable text: a typed character or a whole paste. */
	| { type: "text"; text: string; paste?: boolean }
	| {
		type: "mouse";
		action: "down" | "up" | "move" | "drag" | "wheel";
		/** 0 left, 1 middle, 2 right. */
		button: number;
		/** Zero-based cell coordinates. */
		x: number;
		y: number;
		/** -1 up, 1 down (wheel only). */
		delta: number;
	};

const CSI_KEYS: Record<string, KeyName> = {
	A: "up",
	B: "down",
	C: "right",
	D: "left",
	H: "home",
	F: "end",
	"1~": "home",
	"7~": "home",
	"4~": "end",
	"8~": "end",
	"3~": "delete",
	"5~": "pageup",
	"6~": "pagedown",
};

// deno-lint-ignore no-control-regex
const MOUSE = /^\x1b\[<(\d+);(\d+);(\d+)([Mm])/;
// deno-lint-ignore no-control-regex
const CSI = /^\x1b\[([0-9;]*)([A-Za-z~])/;
// deno-lint-ignore no-control-regex
const SS3 = /^\x1bO([A-DHF])/;
const PASTE_START = "\x1b[200~";
const PASTE_END = "\x1b[201~";

/**
 * Stateful parser: a paste can span several reads, everything else is assumed
 * to arrive whole (which is how terminals deliver escape sequences in practice).
 */
export class InputParser {
	#paste: string | null = null;

	parse(chunk: string): InputEvent[] {
		const events: InputEvent[] = [];
		let text = "";
		const flushText = () => {
			if (text) events.push({ type: "text", text });
			text = "";
		};

		let i = 0;
		while (i < chunk.length) {
			if (this.#paste !== null) {
				const end = chunk.indexOf(PASTE_END, i);
				if (end === -1) {
					this.#paste += chunk.slice(i);
					break;
				}
				this.#paste += chunk.slice(i, end);
				// Titles are single line: fold newlines and tabs into spaces.
				const pasted = this.#paste.replace(/[\r\n\t]+/g, " ");
				if (pasted) events.push({ type: "text", text: pasted, paste: true });
				this.#paste = null;
				i = end + PASTE_END.length;
				continue;
			}

			const char = chunk[i];

			if (char === "\x1b") {
				flushText();
				const rest = chunk.slice(i);

				if (rest.startsWith(PASTE_START)) {
					this.#paste = "";
					i += PASTE_START.length;
					continue;
				}

				const mouse = MOUSE.exec(rest);
				if (mouse) {
					events.push(parseMouse(mouse));
					i += mouse[0].length;
					continue;
				}

				const csi = CSI.exec(rest) ?? SS3.exec(rest);
				if (csi) {
					const [, params, final] = csi.length === 3 ? csi : ["", "", csi[1]];
					if (final === "Z") {
						events.push({ type: "key", name: "tab", shift: true });
					} else {
						// Modified arrows arrive as `1;5A`: keep only the key.
						const key = CSI_KEYS[final === "~" ? `${params}~` : final] ??
							CSI_KEYS[`${params.split(";")[0]}~`];
						if (key) events.push({ type: "key", name: key });
					}
					i += csi[0].length;
					continue;
				}

				// A lone ESC is the Escape key; ESC + char is Alt + char, which the
				// dashboard doesn't use, so it's read as Escape and the char dropped.
				events.push({ type: "key", name: "escape" });
				i += rest.length > 1 ? 2 : 1;
				continue;
			}

			const code = char.charCodeAt(0);
			if (char === "\r" || char === "\n") {
				flushText();
				events.push({ type: "key", name: "enter" });
			} else if (char === "\t") {
				flushText();
				events.push({ type: "key", name: "tab" });
			} else if (code === 0x7f || code === 0x08) {
				flushText();
				events.push({ type: "key", name: "backspace" });
			} else if (code < 0x20) {
				flushText();
				events.push({
					type: "ctrl",
					key: String.fromCharCode(code + 0x60),
				});
			} else {
				text += char;
			}
			i++;
		}

		flushText();
		return events;
	}
}

const parseMouse = (match: RegExpExecArray): InputEvent => {
	const code = Number(match[1]);
	const x = Number(match[2]) - 1;
	const y = Number(match[3]) - 1;
	const button = code & 3;
	const base = { type: "mouse" as const, x, y, button, delta: 0 };

	if (code & 64) {
		return { ...base, action: "wheel", delta: button === 0 ? -1 : 1 };
	}
	if (code & 32) {
		return { ...base, action: button === 3 ? "move" : "drag" };
	}
	return { ...base, action: match[4] === "M" ? "down" : "up" };
};

const ENTER = "\x1b[?1049h" + // alternate screen
	"\x1b[?25l" + // hide cursor
	"\x1b[?7l" + // no autowrap (writing the last cell must not scroll)
	"\x1b[?1000h\x1b[?1003h\x1b[?1006h" + // mouse: clicks, motion, SGR encoding
	"\x1b[?2004h" + // bracketed paste
	"\x1b[2J";
const LEAVE = "\x1b[?2004l" +
	"\x1b[?1006l\x1b[?1003l\x1b[?1000l" +
	"\x1b[?7h" +
	"\x1b[0m\x1b[?25h" +
	"\x1b[?1049l";

const encoder = new TextEncoder();

export const write = (data: string) => {
	const bytes = encoder.encode(data);
	let written = 0;
	// writeSync may write only part of a large frame.
	while (written < bytes.length) {
		written += Deno.stdout.writeSync(bytes.subarray(written));
	}
};

let active = false;

export const enterScreen = () => {
	Deno.stdin.setRaw(true);
	write(ENTER);
	active = true;
};

/** Restores the terminal. Safe to call more than once. */
export const leaveScreen = () => {
	if (!active) return;
	active = false;
	write(LEAVE);
	try {
		Deno.stdin.setRaw(false);
	} catch {
		// stdin already closed
	}
};

/**
 * Reads stdin until it closes. Events are handed over one read at a time, so a
 * burst (fast mouse motion, a paste) can be applied as a single update.
 */
export const readInput = async (onEvents: (events: InputEvent[]) => void) => {
	const parser = new InputParser();
	const decoder = new TextDecoder();
	for await (const chunk of Deno.stdin.readable) {
		const events = parser.parse(decoder.decode(chunk, { stream: true }));
		if (events.length) onEvents(events);
	}
};
