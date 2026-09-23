import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Screen, textWidth, truncate } from "../../scripts/dashboard/screen.ts";

// deno-lint-ignore no-control-regex
const stripSgr = (out: string) => out.replace(/\x1b\[[0-9;?]*[mhlJ]/g, "");

const frame = (screen: Screen, draw: () => void) => {
	screen.clear(0x000000, 0xffffff);
	draw();
	return screen.flush();
};

describe("Screen", () => {
	it("repaints everything on the first frame", () => {
		const screen = new Screen();
		screen.resize(4, 2);
		const out = frame(screen, () => screen.text(0, 0, "ab"));
		expect(stripSgr(out)).toContain("ab  ");
	});

	it("moves the cursor explicitly at the start of each row", () => {
		// Autowrap is disabled, so relying on the cursor wrapping would stack
		// every row into the last column.
		const screen = new Screen();
		screen.resize(3, 2);
		const out = frame(screen, () => {
			screen.text(0, 0, "abc");
			screen.text(0, 1, "def");
		});
		expect(stripSgr(out)).toBe("\x1b[1;1Habc\x1b[2;1Hdef");
	});

	it("only writes the cells that changed", () => {
		const screen = new Screen();
		screen.resize(10, 3);
		frame(screen, () => screen.text(0, 1, "hello"));
		const out = frame(screen, () => screen.text(0, 1, "hallo"));
		expect(stripSgr(out)).toBe("\x1b[2;2Ha");
		expect(frame(screen, () => screen.text(0, 1, "hallo"))).toBe("");
	});

	it("rewrites a cell when only its color changes", () => {
		const screen = new Screen();
		screen.resize(5, 1);
		frame(screen, () => screen.text(0, 0, "x", { fg: 0xff0000 }));
		const out = frame(screen, () => screen.text(0, 0, "x", { fg: 0x00ff00 }));
		expect(out).toContain("38;2;0;255;0");
		expect(stripSgr(out)).toBe("\x1b[1;1Hx");
	});

	it("respects the clip rectangle", () => {
		const screen = new Screen();
		screen.resize(6, 1);
		const out = frame(
			screen,
			() =>
				screen.clip(
					{ x: 1, y: 0, w: 2, h: 1 },
					() => screen.text(0, 0, "abcdef"),
				),
		);
		expect(stripSgr(out)).toContain(" bc   ");
	});
});

describe("text helpers", () => {
	it("measures wide characters", () => {
		expect(textWidth("abc")).toBe(3);
		expect(textWidth("日本")).toBe(4);
	});

	it("truncates with an ellipsis", () => {
		expect(truncate("hello world", 20)).toBe("hello world");
		expect(truncate("hello world", 6)).toBe("hello…");
	});
});
