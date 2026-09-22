// Loads the "data only" markdown collections (devices, books, standalone pages).
//
// Unlike posts, these files never become a page of their own: they are rendered
// inside other pages (the /devices grid, the /books shelf, /about, …). Lume drops
// `url: false` pages before they reach `search`, so instead of going through the
// page pipeline they are read here and exposed as plain site data. Their body is
// rendered in the templates with Lume's `md` filter.

import { parse } from "@std/yaml";
import { basename, join } from "lume/deps/path.ts";

export interface Entry {
	/** Nuxt Content style path, e.g. "/books/dune" (used to seed the book spines). */
	path: string;
	/** Filename without extension, e.g. "dune". */
	slug: string;
	/** Raw markdown body, without the front matter. */
	body: string;
	[key: string]: unknown;
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export const parseMarkdown = (
	source: string,
): { data: Record<string, unknown>; body: string } => {
	const match = source.match(FRONT_MATTER);
	if (!match) return { data: {}, body: source };

	return {
		data: (parse(match[1] as string) as Record<string, unknown>) ?? {},
		body: source.slice(match[0].length),
	};
};

/**
 * Reads every `.md` file in `dir` (non recursive). Files whose name starts with
 * "-" and entries with `draft: true` are skipped, matching the old Nuxt
 * queries (`stem NOT LIKE '%/-%'`, `draft IS NULL`).
 */
export const loadCollection = async (dir: string): Promise<Entry[]> => {
	const entries: Entry[] = [];
	const folder = basename(dir);

	for await (const file of Deno.readDir(dir)) {
		if (!file.isFile || !file.name.endsWith(".md")) continue;
		if (file.name.startsWith("-")) continue;

		const slug = file.name.replace(/\.md$/, "");
		const { data, body } = parseMarkdown(
			await Deno.readTextFile(join(dir, file.name)),
		);

		if (data.draft === true) continue;

		entries.push({ ...data, path: `/${folder}/${slug}`, slug, body });
	}

	return entries.sort((a, b) => a.slug.localeCompare(b.slug));
};
