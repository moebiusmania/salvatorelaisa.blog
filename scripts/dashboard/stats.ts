// Collects the numbers shown on the dashboard straight from the content files.

import { parseMarkdown } from "../../src/content.ts";

export interface PostInfo {
	slug: string;
	title: string;
	/** Null when missing or unparsable. */
	date: Date | null;
	tags: string[];
	draft: boolean;
	pinned: boolean;
	words: number;
	/** Minutes, computed like the site does (180 wpm over the raw file). */
	readingTime: number;
}

export interface Stats {
	/** Published posts, newest first. */
	posts: PostInfo[];
	/** Draft posts, newest first. */
	drafts: PostInfo[];
	words: number;
	readingTime: number;
	perYear: { year: number; count: number }[];
	tags: { tag: string; count: number }[];
	devices: { visible: number; hidden: number };
	books: { visible: number; hidden: number };
	theme: string;
	/** Days since the newest published post. */
	daysSinceLastPost: number | null;
}

const markdownFiles = async (dir: string) => {
	const files: string[] = [];
	try {
		for await (const entry of Deno.readDir(dir)) {
			if (entry.isFile && entry.name.endsWith(".md")) files.push(entry.name);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) throw error;
	}
	return files;
};

/** Accepts YAML dates as well as loose strings like `2020-04-3`. */
const toDate = (value: unknown): Date | null => {
	if (value instanceof Date) return value;
	const match = String(value ?? "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
	if (!match) return null;
	const [, year, month, day] = match.map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};

const byDateDesc = (a: PostInfo, b: PostInfo) =>
	(b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) ||
	a.title.localeCompare(b.title);

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** Same rule as `loadCollection` in src/content.ts: a "-" prefix or `draft: true` hides. */
const countCollection = async (dir: string) => {
	let visible = 0;
	let hidden = 0;
	for (const file of await markdownFiles(dir)) {
		const { data } = parseMarkdown(await Deno.readTextFile(`${dir}/${file}`));
		if (file.startsWith("-") || data.draft === true) hidden++;
		else visible++;
	}
	return { visible, hidden };
};

const readTheme = async () => {
	const config = await Deno.readTextFile("src/utils/config.ts");
	return config.match(/CURRENT_THEME = "([^"]+)"/)?.[1] ?? "?";
};

export const loadStats = async (): Promise<Stats> => {
	const files = await markdownFiles("content");
	const all = await Promise.all(
		files.map(async (file): Promise<PostInfo> => {
			const raw = await Deno.readTextFile(`content/${file}`);
			const { data, body } = parseMarkdown(raw);
			return {
				slug: file.replace(/\.md$/, ""),
				title: String(data.title ?? file),
				date: toDate(data.date),
				tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
				draft: data.draft === true,
				pinned: data.pinned === true,
				words: countWords(body),
				readingTime: Math.ceil(raw.split(/\s+/).length / 180),
			};
		}),
	);

	const posts = all.filter((post) => !post.draft).sort(byDateDesc);
	const drafts = all.filter((post) => post.draft).sort(byDateDesc);

	const years = new Map<number, number>();
	const tags = new Map<string, number>();
	for (const post of posts) {
		if (post.date) {
			const year = post.date.getUTCFullYear();
			years.set(year, (years.get(year) ?? 0) + 1);
		}
		for (const tag of post.tags) {
			if (tag) tags.set(tag, (tags.get(tag) ?? 0) + 1);
		}
	}

	// Fill the gaps so quiet years show up as empty bars.
	const perYear: Stats["perYear"] = [];
	if (years.size) {
		const first = Math.min(...years.keys());
		const last = Math.max(...years.keys(), new Date().getFullYear());
		for (let year = first; year <= last; year++) {
			perYear.push({ year, count: years.get(year) ?? 0 });
		}
	}

	const newest = posts.find((post) => post.date)?.date;

	const [devices, books, theme] = await Promise.all([
		countCollection("content/devices"),
		countCollection("content/books"),
		readTheme(),
	]);

	return {
		posts,
		drafts,
		words: posts.reduce((sum, post) => sum + post.words, 0),
		readingTime: posts.reduce((sum, post) => sum + post.readingTime, 0),
		perYear,
		tags: [...tags]
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
		devices,
		books,
		theme,
		daysSinceLastPost: newest
			? Math.max(0, Math.floor((Date.now() - newest.getTime()) / 86_400_000))
			: null,
	};
};
