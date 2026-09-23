// Dashboard state, layout and input handling.
//
// State lives in signals; a single effect paints the whole screen from them
// into the back buffer, and the Screen diff makes sure only changed cells
// reach the terminal. Any signal a draw reads (hover, scroll, modal, …)
// automatically triggers a repaint when it changes.

import {
	batch,
	computed,
	effect,
	type Signal,
	signal,
} from "@preact/signals-core";
import { slugify } from "../_compose.ts";
import type { InputEvent } from "./terminal.ts";
import { graphemes, type Rect, Screen, textWidth, truncate } from "./screen.ts";
import { loadStats, type PostInfo, type Stats } from "./stats.ts";
import { lighten, mix, palette } from "./theme.ts";
import {
	bigText,
	button,
	buttonWidth,
	hbar,
	panel,
	Regions,
	scrollbar,
	vbar,
} from "./ui.ts";

interface Kind {
	id: string;
	/** Used in "New …" labels and the modal title. */
	noun: string;
	short: string;
	/** deno.json task that creates the file; receives the title as argument. */
	task: string;
	/** Where the task writes, for the path preview in the modal. */
	folder: string;
	color: number;
	key: string;
	example: string;
}

const KINDS: Kind[] = [
	{
		id: "post",
		noun: "post",
		short: "Post",
		task: "new:post",
		folder: "content",
		color: palette.accent,
		key: "1",
		example: "Il mio nuovo post",
	},
	{
		id: "device",
		noun: "device card",
		short: "Device",
		task: "new:device",
		folder: "content/devices",
		color: palette.teal,
		key: "2",
		example: "Steam Deck OLED",
	},
	{
		id: "book",
		noun: "book",
		short: "Book",
		task: "new:book",
		folder: "content/books",
		color: palette.violet,
		key: "3",
		example: "Il barone rampante",
	},
];

const THEME_COLORS: Record<string, number> = {
	default: palette.accent,
	halloween: 0xff7a18,
	spring: palette.green,
	summer: 0xf4a93b,
	xmas: palette.teal,
};

const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const MAX_TITLE = 200;

interface Modal {
	kind: Kind;
	/** Title as grapheme clusters, so the cursor never splits a character. */
	chars: string[];
	cursor: number;
	busy: boolean;
	error: string | null;
}

type ListKey = "recent" | "drafts";

const exists = (path: string) => {
	try {
		Deno.statSync(path);
		return true;
	} catch {
		return false;
	}
};

const isoDate = (date: Date | null) =>
	date ? date.toISOString().slice(0, 10) : "no date   ";

const compact = (n: number) =>
	n < 1000 ? String(n) : `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, n));

/** Removes ANSI colors and `deno task`'s own "Task …" banner. */
const cleanOutput = (bytes: Uint8Array) =>
	new TextDecoder()
		.decode(bytes)
		// deno-lint-ignore no-control-regex
		.replace(/\x1b\[[0-9;]*m/g, "")
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("Task "))
		// The scripts prefix their messages with an emoji; the toast has its own.
		.map((line) => line.replace(/^[^\p{L}\p{N}]+/u, ""));

const clockFormat = new Intl.DateTimeFormat("en-GB", {
	weekday: "short",
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat("en-GB", { timeStyle: "medium" });

export interface AppOptions {
	write: (data: string) => void;
	quit: () => void;
}

export const createApp = ({ write, quit }: AppOptions) => {
	const screen = new Screen();
	const regions = new Regions();

	// --- state -------------------------------------------------------------

	const size = signal({ columns: 80, rows: 24 });
	const stats = signal<Stats | null>(null);
	const loadError = signal<string | null>(null);
	const loading = signal(false);
	const updatedAt = signal<Date | null>(null);
	const hover = signal<string | null>(null);
	const pressed = signal<string | null>(null);
	const focus = signal("action:post");
	const modal = signal<Modal | null>(null);
	const toast = signal<{ text: string; ok: boolean } | null>(null);
	const scroll: Record<ListKey, Signal<number>> = {
		recent: signal(0),
		drafts: signal(0),
	};
	const now = signal(new Date());
	const clock = computed(() => clockFormat.format(now.value));
	const spinning = computed(() => loading.value || !!modal.value?.busy);
	const frame = signal(0);

	const target = computed(() => {
		const m = modal.value;
		if (!m) return null;
		const title = m.chars.join("").trim();
		const slug = slugify(title);
		const path = slug ? `${m.kind.folder}/${slug}.md` : null;
		return { title, path, exists: path ? exists(path) : false };
	});

	// Non-reactive bits the input handlers need from the last frame.
	const listRows: Record<ListKey, number> = { recent: 0, drafts: 0 };
	let inputScroll = 0;
	let returnFocus = focus.peek();
	let mouse = { x: -1, y: -1 };

	// --- actions -----------------------------------------------------------

	let reloading: Promise<void> | null = null;
	let reloadAgain = false;
	const reload = () => {
		if (reloading) {
			reloadAgain = true;
			return reloading;
		}
		loading.value = true;
		reloading = (async () => {
			do {
				reloadAgain = false;
				try {
					const next = await loadStats();
					batch(() => {
						stats.value = next;
						loadError.value = null;
						updatedAt.value = new Date();
					});
				} catch (error) {
					loadError.value = (error as Error).message;
				}
			} while (reloadAgain);
		})().finally(() => {
			reloading = null;
			loading.value = false;
		});
		return reloading;
	};

	let toastTimer: ReturnType<typeof setTimeout> | undefined;
	const notify = (text: string, ok: boolean) => {
		toast.value = { text, ok };
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast.value = null), 6000);
	};

	const openModal = (kind: Kind) => {
		if (modal.peek()) return;
		batch(() => {
			returnFocus = focus.peek();
			inputScroll = 0;
			modal.value = { kind, chars: [], cursor: 0, busy: false, error: null };
			focus.value = "modal:input";
			pressed.value = null;
		});
	};

	const closeModal = () => {
		if (!modal.peek() || modal.peek()?.busy) return;
		batch(() => {
			modal.value = null;
			focus.value = returnFocus;
			pressed.value = null;
		});
	};

	/** Applies an edit to the title; any edit clears the previous error. */
	const edit = (fn: (m: Modal) => Pick<Modal, "chars" | "cursor">) => {
		const m = modal.peek();
		if (!m || m.busy) return;
		const next = fn(m);
		modal.value = {
			...m,
			chars: next.chars.slice(0, MAX_TITLE),
			cursor: clamp(next.cursor, 0, Math.min(next.chars.length, MAX_TITLE)),
			error: null,
		};
	};

	const insert = (text: string) =>
		edit(({ chars, cursor }) => {
			const added = graphemes(text)
				.map(([g]) => g)
				.filter((g) => g >= " ");
			return {
				chars: [...chars.slice(0, cursor), ...added, ...chars.slice(cursor)],
				cursor: cursor + added.length,
			};
		});

	const deleteRange = (from: number, to: number) =>
		edit(({ chars, cursor }) => {
			const start = clamp(Math.min(from, to), 0, chars.length);
			const end = clamp(Math.max(from, to), 0, chars.length);
			return {
				chars: [...chars.slice(0, start), ...chars.slice(end)],
				cursor: cursor > end ? cursor - (end - start) : Math.min(cursor, start),
			};
		});

	const wordStart = ({ chars, cursor }: Modal) => {
		let i = cursor;
		while (i > 0 && chars[i - 1] === " ") i--;
		while (i > 0 && chars[i - 1] !== " ") i--;
		return i;
	};

	const submit = async () => {
		const m = modal.peek();
		const t = target.peek();
		if (!m || !t || m.busy) return;

		const fail = (
			error: string,
		) => (modal.value = { ...m, busy: false, error });
		if (!t.title) return fail("Type a title first");
		if (!t.path) return fail("The title needs at least one letter or digit");
		if (t.exists) return fail(`${t.path} already exists`);

		modal.value = { ...m, busy: true, error: null };
		try {
			const result = await new Deno.Command(Deno.execPath(), {
				args: ["task", m.kind.task, t.title],
				stdin: "null",
				stdout: "piped",
				stderr: "piped",
			}).output();
			const stdout = cleanOutput(result.stdout);
			const stderr = cleanOutput(result.stderr);

			if (result.success) {
				batch(() => {
					modal.value = null;
					focus.value = returnFocus;
				});
				notify(stdout.at(-1) ?? `Created ${t.path}`, true);
				reload();
			} else {
				fail(
					stderr.at(-1) ?? stdout.at(-1) ??
						`deno task ${m.kind.task} exited with ${result.code}`,
				);
			}
		} catch (error) {
			fail((error as Error).message);
		}
	};

	const scrollList = (key: ListKey, delta: number) => {
		const s = stats.peek();
		if (!s) return;
		const total = key === "recent" ? s.posts.length : s.drafts.length;
		const max = Math.max(0, total - listRows[key]);
		scroll[key].value = clamp(scroll[key].peek() + delta, 0, max);
	};

	const moveFocus = (step: number) => {
		const ids = regions.focusables();
		if (!ids.length) return;
		const i = ids.indexOf(focus.peek());
		focus.value = i === -1
			? ids[step > 0 ? 0 : ids.length - 1]
			: ids[(i + step + ids.length) % ids.length];
	};

	const activate = () => regions.byId(focus.peek())?.onClick?.();

	// --- input -------------------------------------------------------------

	const handleMouse = (event: Extract<InputEvent, { type: "mouse" }>) => {
		const { x, y, action } = event;
		mouse = { x, y };

		if (action === "move" || action === "drag") {
			hover.value = regions.at(x, y)?.id ?? null;
		} else if (action === "wheel") {
			regions.at(x, y, (region) => !!region.onWheel)?.onWheel?.(event.delta);
		} else if (action === "down" && event.button === 0) {
			const region = regions.at(x, y);
			pressed.value = region?.id ?? null;
			if (region?.focusable) focus.value = region.id;
			region?.onPress?.(x, y);
		} else if (action === "up") {
			const region = regions.at(x, y);
			const wasPressed = pressed.peek();
			pressed.value = null;
			if (region && region.id === wasPressed) region.onClick?.();
		}
	};

	const handleModalKey = (event: InputEvent, m: Modal) => {
		if (event.type === "text") {
			focus.value = "modal:input";
			insert(event.text);
		} else if (event.type === "ctrl") {
			switch (event.key) {
				case "a":
					return edit(({ chars }) => ({ chars, cursor: 0 }));
				case "e":
					return edit(({ chars }) => ({ chars, cursor: chars.length }));
				case "u":
					return deleteRange(0, m.cursor);
				case "k":
					return deleteRange(m.cursor, m.chars.length);
				case "w":
					return deleteRange(wordStart(m), m.cursor);
			}
		} else if (event.type === "key") {
			switch (event.name) {
				case "escape":
					return closeModal();
				case "enter":
					return focus.peek() === "modal:cancel" ? closeModal() : submit();
				case "tab":
					return moveFocus(event.shift ? -1 : 1);
				case "backspace":
					return deleteRange(m.cursor - 1, m.cursor);
				case "delete":
					return deleteRange(m.cursor, m.cursor + 1);
				case "left":
					return edit(({ chars, cursor }) => ({ chars, cursor: cursor - 1 }));
				case "right":
					return edit(({ chars, cursor }) => ({ chars, cursor: cursor + 1 }));
				case "home":
					return edit(({ chars }) => ({ chars, cursor: 0 }));
				case "end":
					return edit(({ chars }) => ({ chars, cursor: chars.length }));
			}
		}
	};

	const handleKey = (event: InputEvent) => {
		if (event.type === "text") {
			for (const char of event.text) {
				const kind = KINDS.find((k) => k.key === char || k.id[0] === char);
				if (kind) return openModal(kind);
				if (char === " ") return activate();
				if (char === "r") return void reload();
				if (char === "q") return quit();
			}
		} else if (event.type === "key") {
			switch (event.name) {
				case "tab":
					return moveFocus(event.shift ? -1 : 1);
				case "right":
					return moveFocus(1);
				case "left":
					return moveFocus(-1);
				case "enter":
					return activate();
				case "up":
				case "down":
					return scrollList("recent", event.name === "up" ? -1 : 1);
				case "pageup":
				case "pagedown":
					return scrollList(
						"recent",
						(event.name === "pageup" ? -1 : 1) * listRows.recent,
					);
			}
		}
	};

	const handleEvent = (event: InputEvent) => {
		if (event.type === "ctrl" && (event.key === "c" || event.key === "q")) {
			return quit();
		}
		if (event.type === "mouse") return handleMouse(event);
		const m = modal.peek();
		if (m) handleModalKey(event, m);
		else handleKey(event);
	};

	/** One batch per stdin read: the screen repaints once, not per event. */
	const handle = (events: InputEvent[]) =>
		batch(() => events.forEach(handleEvent));

	// --- drawing -------------------------------------------------------------

	const isHovered = (id: string) => hover.value === id;
	const buttonState = (id: string) => ({
		hovered: isHovered(id),
		focused: focus.value === id,
		pressed: pressed.value === id,
	});

	const drawHeader = (width: number, s: Stats | null) => {
		screen.fill({ x: 0, y: 0, w: width, h: 1 }, { bg: palette.surface });
		let x = 1;
		x += screen.text(x, 0, " ◆ ", { fg: palette.accent, bold: true });
		x += screen.text(x, 0, "salvatorelaisa.blog", {
			fg: palette.text,
			bold: true,
		});
		screen.text(x + 2, 0, "admin dashboard", { fg: palette.muted });

		const theme = s?.theme ?? "…";
		const time = clock.value;
		const right = `theme ● ${theme}   ${time} `;
		if (x + 20 + textWidth(right) > width) return;
		let rx = width - 1 - textWidth(right);
		rx += screen.text(rx, 0, "theme ", { fg: palette.muted });
		rx += screen.text(rx, 0, "● ", {
			fg: THEME_COLORS[theme] ?? palette.muted,
		});
		rx += screen.text(rx, 0, `${theme}   `, { fg: palette.text });
		screen.text(rx, 0, time, { fg: palette.muted });
	};

	const drawCards = (rect: Rect, s: Stats | null, big: boolean) => {
		const pinned = s?.posts.filter((post) => post.pinned).length ?? 0;
		const days = s?.daysSinceLastPost;
		const cards = [
			{
				label: "POSTS",
				value: s ? String(s.posts.length) : "-",
				sub: s ? `${pinned} pinned` : "",
				color: palette.accent,
			},
			{
				label: "DRAFTS",
				value: s ? String(s.drafts.length) : "-",
				sub: "unpublished",
				color: palette.yellow,
			},
			{
				label: "DEVICES",
				value: s ? String(s.devices.visible) : "-",
				sub: s ? `${s.devices.hidden} hidden` : "",
				color: palette.teal,
			},
			{
				label: "BOOKS",
				value: s ? String(s.books.visible) : "-",
				sub: s ? `${s.books.hidden} hidden` : "",
				color: palette.violet,
			},
			{
				label: "WORDS",
				value: s ? compact(s.words) : "-",
				sub: s ? `≈ ${Math.round(s.readingTime / 60)}h reading` : "",
				color: palette.blue,
			},
			{
				label: "LAST POST",
				value: days == null ? "-" : String(days),
				sub: days === 0 ? "today" : days === 1 ? "day ago" : "days ago",
				color: palette.green,
			},
		];

		const count = rect.w >= 108 ? 6 : rect.w >= 84 ? 5 : 4;
		const gap = 1;
		const width = Math.floor((rect.w - gap * (count - 1)) / count);

		cards.slice(0, count).forEach((card, i) => {
			const x = rect.x + i * (width + gap);
			// The last card absorbs the rounding remainder.
			const w = i === count - 1 ? rect.x + rect.w - x : width;
			const { y, h } = rect;
			screen.fill({ x, y, w, h }, { bg: palette.surface });
			for (let row = y; row < y + h; row++) {
				screen.text(x, row, "▌", { fg: card.color });
			}

			const inner = x + 3;
			const room = w - 5;
			screen.text(inner, y + 1, truncate(card.label, room), {
				fg: palette.muted,
				bold: true,
			});
			const glyphs = bigText(card.value);
			if (big && textWidth(glyphs[0]) <= room) {
				glyphs.forEach((line, row) =>
					screen.text(inner, y + 2 + row, line, { fg: card.color })
				);
				screen.text(inner, y + 5, truncate(card.sub, room), {
					fg: palette.faint,
				});
			} else {
				screen.text(inner, y + 2, truncate(card.value, room), {
					fg: card.color,
					bold: true,
				});
				screen.text(inner, y + 3, truncate(card.sub, room), {
					fg: palette.faint,
				});
			}
		});
	};

	const drawYears = (rect: Rect, s: Stats | null) => {
		const all = s?.perYear ?? [];
		const hovered = all.find(({ year }) => isHovered(`year:${year}`));
		const total = s?.posts.length ?? 0;
		const info = hovered
			? `${hovered.year} · ${plural(hovered.count, "post")}`
			: all.length
			? `${plural(total, "post")} since ${all[0].year}`
			: "";
		const inner = panel(screen, rect, {
			title: "Posts per year",
			color: palette.accent,
			info,
		});
		if (!all.length || inner.h < 3) return;

		// Most recent years win when there isn't room for all of them.
		let years = all;
		let slot = Math.floor(inner.w / years.length);
		if (slot < 2) {
			years = all.slice(-Math.floor(inner.w / 2));
			slot = 2;
		}
		slot = Math.min(slot, 6);
		const barWidth = Math.max(1, slot - 1);
		const chartWidth = slot * years.length - (slot - barWidth);
		const x0 = inner.x + Math.floor((inner.w - chartWidth) / 2);
		const barRows = inner.h - 1;
		const bottom = inner.y + barRows - 1;
		const labelY = inner.y + inner.h - 1;
		const max = Math.max(1, ...years.map(({ count }) => count));
		const labelWidth = slot >= 5 ? 4 : 2;
		const step = Math.ceil((labelWidth + 1) / slot);

		years.forEach(({ year, count }, i) => {
			const id = `year:${year}`;
			const x = x0 + i * slot;
			const active = isHovered(id);
			const ratio = count / max;

			if (active) {
				screen.fill(
					{ x, y: inner.y, w: barWidth, h: barRows },
					{ bg: palette.surfaceHi },
				);
			}
			if (count === 0) {
				screen.text(x, bottom, "▁".repeat(barWidth), { fg: palette.border });
			} else {
				vbar(
					screen,
					x,
					bottom,
					barWidth,
					barRows,
					ratio,
					active
						? palette.accentHi
						: mix(palette.borderHi, palette.accent, 0.35 + 0.65 * ratio),
				);
			}

			if (active || (years.length - 1 - i) % step === 0) {
				const label = String(year).slice(-labelWidth);
				screen.text(
					x + Math.floor((barWidth - labelWidth) / 2),
					labelY,
					label,
					{
						fg: active ? palette.text : palette.faint,
						bold: active,
					},
				);
			}

			regions.add({ id, rect: { x, y: inner.y, w: slot, h: inner.h } });
		});
	};

	const drawTags = (rect: Rect, s: Stats | null) => {
		const tags = s?.tags ?? [];
		const hovered = tags.find(({ tag }) => isHovered(`tag:${tag}`));
		const inner = panel(screen, rect, {
			title: "Top tags",
			color: palette.teal,
			info: hovered
				? `${hovered.tag} · ${plural(hovered.count, "post")}`
				: tags.length
				? plural(tags.length, "tag")
				: "",
		});
		const shown = tags.slice(0, inner.h);
		if (!shown.length) return;

		const max = shown[0].count;
		const nameWidth = Math.min(
			16,
			Math.max(...shown.map(({ tag }) => textWidth(tag))),
		);
		const countWidth = String(max).length;
		const barMax = inner.w - nameWidth - countWidth - 2;

		shown.forEach(({ tag, count }, i) => {
			const id = `tag:${tag}`;
			const y = inner.y + i;
			const active = isHovered(id);
			const ratio = count / max;
			if (active) {
				screen.fill(
					{ x: inner.x - 1, y, w: inner.w + 2, h: 1 },
					{ bg: palette.surfaceHi },
				);
			}
			screen.text(inner.x, y, truncate(tag, nameWidth), {
				fg: active ? palette.text : palette.muted,
				bold: active,
			});
			const length = hbar(
				screen,
				inner.x + nameWidth + 1,
				y,
				barMax,
				ratio,
				active
					? lighten(palette.teal, 0.25)
					: mix(palette.borderHi, palette.teal, 0.4 + 0.6 * ratio),
			);
			screen.text(inner.x + nameWidth + 1 + length + 1, y, String(count), {
				fg: active ? palette.text : palette.faint,
			});
			regions.add({ id, rect: { x: inner.x - 1, y, w: inner.w + 2, h: 1 } });
		});
	};

	const drawList = (
		rect: Rect,
		key: ListKey,
		title: string,
		noun: string,
		color: number,
		items: PostInfo[],
		empty: string,
	) => {
		const inner = panel(screen, rect, {
			title,
			color,
			info: items.length ? plural(items.length, noun) : "",
			footer: items.length > rect.h - 2 ? "wheel to scroll" : undefined,
		});
		listRows[key] = inner.h;
		regions.add({
			id: `list:${key}`,
			rect,
			onWheel: (delta) => scrollList(key, delta * 2),
		});

		if (!items.length) {
			screen.text(inner.x, inner.y, empty, { fg: palette.faint, italic: true });
			return;
		}

		const offset = clamp(
			scroll[key].value,
			0,
			Math.max(0, items.length - inner.h),
		);
		// Fixed-width columns so titles line up; dates go first when space is short.
		const showDate = inner.w >= 44;
		const metaWidth = Math.max(
			...items.map((post) => String(post.readingTime).length + 4),
		);
		items.slice(offset, offset + inner.h).forEach((post, i) => {
			const id = `row:${key}:${post.slug}`;
			const y = inner.y + i;
			const active = isHovered(id);
			if (active) {
				screen.fill(
					{ x: inner.x - 1, y, w: inner.w + 2, h: 1 },
					{ bg: palette.surfaceHi },
				);
			}

			let x = inner.x;
			if (showDate) {
				x += screen.text(x, y, isoDate(post.date), { fg: palette.faint });
				x += 2;
			}
			const meta = `${post.readingTime} min`.padStart(metaWidth);
			const room = inner.x + inner.w - x - metaWidth - 2;
			if (post.pinned) x += screen.text(x, y, "★ ", { fg: palette.yellow });
			screen.text(x, y, truncate(post.title, room - (post.pinned ? 2 : 0)), {
				fg: active ? palette.white : palette.text,
				bold: active,
			});
			screen.text(inner.x + inner.w - metaWidth, y, meta, {
				fg: active ? palette.muted : palette.faint,
			});
			regions.add({ id, rect: { x: inner.x - 1, y, w: inner.w + 2, h: 1 } });
		});

		scrollbar(screen, rect, offset, inner.h, items.length);
	};

	const drawActions = (y: number, width: number, tall: boolean) => {
		const compactLabels = width < 96;
		let x = 2;
		for (const kind of KINDS) {
			const id = `action:${kind.id}`;
			x += button(screen, regions, {
				id,
				x,
				y,
				label: compactLabels ? `+ ${kind.short}` : `+ New ${kind.noun}`,
				color: kind.color,
				on: palette.bg,
				tall,
				state: buttonState(id),
				onClick: () => openModal(kind),
			});
			x += 2;
		}

		const extra = [
			{
				id: "action:refresh",
				label: compactLabels ? "↻" : "↻ Refresh",
				run: () => void reload(),
			},
			{ id: "action:quit", label: compactLabels ? "✕" : "✕ Quit", run: quit },
		];
		const extraWidth = extra.reduce(
			(sum, b) => sum + buttonWidth(b.label) + 2,
			0,
		);
		let rx = width - extraWidth;
		if (rx < x) return;
		for (const { id, label, run } of extra) {
			rx += button(screen, regions, {
				id,
				x: rx,
				y,
				label,
				color: palette.surfaceHi,
				textColor: palette.text,
				on: palette.bg,
				tall,
				state: buttonState(id),
				onClick: run,
			});
			rx += 2;
		}
	};

	const drawStatus = (y: number, width: number, s: Stats | null) => {
		screen.fill({ x: 0, y, w: width, h: 1 }, { bg: palette.surface });

		// Right side: toast, loading state or last refresh.
		const t = toast.value;
		let right = "";
		let rightColor: number = palette.faint;
		if (t) {
			right = `${t.ok ? "✓" : "✗"} ${t.text}`;
			rightColor = t.ok ? palette.green : palette.accent;
		} else if (loadError.value) {
			right = `✗ ${loadError.value}`;
			rightColor = palette.accent;
		} else if (loading.value) {
			right = `${SPINNER[frame.value % SPINNER.length]} loading`;
			rightColor = palette.muted;
		} else if (updatedAt.value) {
			right = `updated ${timeFormat.format(updatedAt.value)}`;
		}
		right = truncate(right, Math.floor(width / 2));
		const rightWidth = textWidth(right);
		if (right) {
			screen.text(width - 1 - rightWidth, y, right, {
				fg: rightColor,
				bold: !!t,
			});
		}
		const room = width - rightWidth - 4;

		// Left side: details of the hovered post, or keyboard hints.
		const id = hover.value;
		const post = id?.startsWith("row:") && s
			? [...s.posts, ...s.drafts].find((p) => id.endsWith(`:${p.slug}`))
			: undefined;
		if (post) {
			const tags = post.tags.filter(Boolean).join(", ") || "no tags";
			const text = `content/${post.slug}.md  ·  ${tags}  ·  ${
				plural(post.words, "word")
			}`;
			screen.text(1, y, truncate(text, room), { fg: palette.muted });
			return;
		}

		const hints: [string, string][] = modal.value
			? [["⏎", "create"], ["esc", "cancel"], ["tab", "focus"]]
			: [
				["1 2 3", "new"],
				["r", "refresh"],
				["tab ⏎", "keyboard"],
				["q", "quit"],
			];
		let x = 1;
		for (const [key, label] of hints) {
			const hint = `${key} ${label}   `;
			if (x + textWidth(hint) > room) break;
			x += screen.text(x, y, key, { fg: palette.text, bold: true });
			x += screen.text(x, y, ` ${label}   `, { fg: palette.faint });
		}
	};

	const drawInput = (field: Rect, m: Modal, focused: boolean) => {
		screen.fill(field, { bg: focused ? palette.surfaceHi : palette.bg });
		screen.text(field.x, field.y, "▎", {
			fg: focused ? m.kind.color : palette.border,
		});

		const x0 = field.x + 2;
		const room = field.w - 3;
		const widths = m.chars.map(textWidth);
		const span = (from: number, to: number) =>
			widths.slice(from, to).reduce((sum, w) => sum + w, 0);

		// Scroll horizontally just enough to keep the cursor in view.
		inputScroll = Math.min(inputScroll, m.cursor);
		while (span(inputScroll, m.cursor) + 1 > room) inputScroll++;

		if (!m.chars.length) {
			screen.text(x0, field.y, truncate(`e.g. ${m.kind.example}`, room), {
				fg: palette.faint,
				italic: true,
			});
		}
		let x = x0;
		for (let i = inputScroll; i < m.chars.length; i++) {
			if (x - x0 + widths[i] > room) break;
			x += screen.text(x, field.y, m.chars[i], { fg: palette.text });
		}
		if (focused && !m.busy) {
			const char = m.chars[m.cursor] ?? " ";
			screen.text(x0 + span(inputScroll, m.cursor), field.y, char, {
				fg: palette.bg,
				bg: palette.text,
			});
		}

		regions.add({
			id: "modal:input",
			rect: field,
			focusable: true,
			// Clicking in the field moves the cursor under the pointer.
			onPress: (px) => {
				let column = x0;
				let index = inputScroll;
				while (index < m.chars.length && column + widths[index] <= px) {
					column += widths[index];
					index++;
				}
				edit(({ chars }) => ({ chars, cursor: index }));
			},
		});
	};

	const drawModal = (m: Modal, width: number, height: number) => {
		// Dim everything painted so far, then block it with a backdrop region.
		screen.mapColors((color) => mix(color, 0x000000, 0.55));
		regions.layer = 1;
		regions.add({
			id: "modal:backdrop",
			rect: { x: 0, y: 0, w: width, h: height },
			onClick: closeModal,
		});

		const w = Math.min(66, width - 4);
		const h = 11;
		const x = Math.floor((width - w) / 2);
		const y = Math.floor((height - h) / 2);
		screen.fill({ x: x + 2, y: y + 1, w, h }, { bg: 0x07070b });
		const inner = panel(screen, { x, y, w, h }, {
			title: `New ${m.kind.noun}`,
			color: m.kind.color,
			border: palette.borderHi,
			footer: `deno task ${m.kind.task}`,
		});
		// Swallows clicks inside the box so they don't reach the backdrop.
		regions.add({ id: "modal:box", rect: { x, y, w, h } });

		screen.text(inner.x, inner.y + 1, "Title", {
			fg: palette.muted,
			bold: true,
		});
		drawInput(
			{ x: inner.x, y: inner.y + 2, w: inner.w, h: 1 },
			m,
			focus.value === "modal:input",
		);

		const t = target.value;
		const [message, color] = m.error
			? [`✗ ${m.error}`, palette.accent]
			: t?.exists
			? [`⚠ ${t.path} already exists`, palette.yellow]
			: [`→ ${t?.path ?? `${m.kind.folder}/…`}`, palette.faint];
		screen.text(inner.x, inner.y + 3, truncate(message, inner.w), {
			fg: color,
		});

		const valid = !!t?.path && !t.exists;
		const createLabel = m.busy
			? `${SPINNER[frame.value % SPINNER.length]} Creating…`
			: "Create";
		const createX = inner.x + inner.w - buttonWidth(createLabel);
		const cancelX = createX - 2 - buttonWidth("Cancel");
		const buttonY = inner.y + 5;
		button(screen, regions, {
			id: "modal:cancel",
			x: cancelX,
			y: buttonY,
			label: "Cancel",
			color: palette.surfaceHi,
			textColor: palette.text,
			on: palette.surface,
			tall: true,
			state: buttonState("modal:cancel"),
			onClick: closeModal,
		});
		button(screen, regions, {
			id: "modal:create",
			x: createX,
			y: buttonY,
			label: createLabel,
			color: valid || m.busy ? m.kind.color : palette.border,
			textColor: valid || m.busy ? palette.white : palette.muted,
			on: palette.surface,
			tall: true,
			state: buttonState("modal:create"),
			onClick: submit,
		});
	};

	const draw = () => {
		const { columns: width, rows: height } = size.value;
		screen.resize(width, height);
		regions.reset();
		screen.clear(palette.bg, palette.text);

		if (width < 60 || height < 20) {
			const lines = [
				"Terminal too small",
				`${width}×${height}, needs at least 60×20`,
				"q to quit",
			];
			lines.forEach((line, i) =>
				screen.text(
					Math.max(0, Math.floor((width - textWidth(line)) / 2)),
					Math.floor(height / 2) - 1 + i,
					line,
					{ fg: i === 0 ? palette.text : palette.muted, bold: i === 0 },
				)
			);
			return;
		}

		const s = stats.value;
		drawHeader(width, s);

		const statusY = height - 1;
		const tall = height >= 28;
		const actionsY = statusY - 1 - (tall ? 3 : 1);
		const bigCards = height >= 34;
		const cardsHeight = bigCards ? 7 : 5;
		let y = 2;
		drawCards({ x: 1, y, w: width - 2, h: cardsHeight }, s, bigCards);
		y += cardsHeight + 1;

		const leftWidth = Math.floor((width - 3) / 2);
		const column = (top: number, h: number): [Rect, Rect] => [
			{ x: 1, y: top, w: leftWidth, h },
			{ x: leftWidth + 2, y: top, w: width - leftWidth - 3, h },
		];

		const available = actionsY - 1 - y;
		if (available >= 18) {
			const chartHeight = clamp(Math.round(available * 0.45), 9, 14);
			const [left, right] = column(y, chartHeight);
			drawYears(left, s);
			drawTags(right, s);
			y += chartHeight + 1;
		}

		const [left, right] = column(y, actionsY - 1 - y);
		drawList(
			left,
			"recent",
			"Recent posts",
			"post",
			palette.accent,
			s?.posts ?? [],
			"No posts yet",
		);
		drawList(
			right,
			"drafts",
			"Drafts",
			"draft",
			palette.yellow,
			s?.drafts ?? [],
			"No drafts, all caught up",
		);

		drawActions(actionsY, width, tall);

		const m = modal.value;
		if (m) drawModal(m, width, height);
		// After the modal so its key hints aren't dimmed with the rest.
		drawStatus(statusY, width, s);
	};

	// --- render loop -------------------------------------------------------

	let flushQueued = false;
	const flush = () => {
		flushQueued = false;
		write(screen.flush());
		// Layout may have moved under a still pointer (modal closed, list
		// scrolled): refresh the hover so highlights stay truthful.
		if (mouse.x >= 0) {
			const id = regions.at(mouse.x, mouse.y)?.id ?? null;
			if (id !== hover.peek()) hover.value = id;
		}
	};

	const start = () => {
		effect(() => {
			draw();
			if (!flushQueued) {
				flushQueued = true;
				queueMicrotask(flush);
			}
		});

		// Spinner frames only tick while something is in flight.
		effect(() => {
			if (!spinning.value) return;
			const timer = setInterval(() => frame.value++, 80);
			return () => clearInterval(timer);
		});

		setInterval(() => (now.value = new Date()), 1000);

		reload();
		watch();
	};

	/** Reloads the stats when content changes on disk, from here or elsewhere. */
	const watch = async () => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		try {
			for await (const _ of Deno.watchFs(["content", "src/utils/config.ts"])) {
				clearTimeout(timer);
				timer = setTimeout(reload, 200);
			}
		} catch {
			// Watching is a nicety; the refresh button still works without it.
		}
	};

	const resize = (columns: number, rows: number) => {
		size.value = { columns, rows };
	};

	return { start, handle, resize };
};
