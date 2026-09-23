import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { InputParser } from "../../scripts/dashboard/terminal.ts";

const parse = (...chunks: string[]) => {
	const parser = new InputParser();
	return chunks.flatMap((chunk) => parser.parse(chunk));
};

describe("InputParser", () => {
	it("groups typed characters into text events", () => {
		expect(parse("ciao è")).toEqual([{ type: "text", text: "ciao è" }]);
	});

	it("reads special keys", () => {
		expect(parse("\r\t\x7f\x1b[Z\x1b[3~\x1b[D\x1bOH")).toEqual([
			{ type: "key", name: "enter" },
			{ type: "key", name: "tab" },
			{ type: "key", name: "backspace" },
			{ type: "key", name: "tab", shift: true },
			{ type: "key", name: "delete" },
			{ type: "key", name: "left" },
			{ type: "key", name: "home" },
		]);
	});

	it("reads a lone ESC as Escape and ctrl chords as ctrl events", () => {
		expect(parse("\x1b")).toEqual([{ type: "key", name: "escape" }]);
		expect(parse("\x03")).toEqual([{ type: "ctrl", key: "c" }]);
	});

	it("drops modifiers from arrows", () => {
		expect(parse("\x1b[1;5C")).toEqual([{ type: "key", name: "right" }]);
	});

	it("decodes SGR mouse events with zero-based coordinates", () => {
		const mouse = (action: string, button: number, delta = 0) => ({
			type: "mouse",
			action,
			button,
			x: 9,
			y: 4,
			delta,
		});
		expect(
			parse(
				"\x1b[<0;10;5M\x1b[<0;10;5m\x1b[<35;10;5M\x1b[<32;10;5M\x1b[<64;10;5M\x1b[<65;10;5M",
			),
		).toEqual([
			mouse("down", 0),
			mouse("up", 0),
			mouse("move", 3),
			mouse("drag", 0),
			mouse("wheel", 0, -1),
			mouse("wheel", 1, 1),
		]);
	});

	it("joins bracketed pastes across reads and folds newlines", () => {
		expect(parse("a\x1b[200~uno\ndue", "\ttre\x1b[201~b")).toEqual([
			{ type: "text", text: "a" },
			{ type: "text", text: "uno due tre", paste: true },
			{ type: "text", text: "b" },
		]);
	});
});
