// Collection queries shared by the pages. Everything is sorted and filtered
// here so templates never touch `getCollection` directly.

import { readFile } from "node:fs/promises";
import { type CollectionEntry, getCollection } from "astro:content";
import { sortBooks } from "./books.ts";

export const POSTS_PER_PAGE = 10;

// `bun run dev:drafts` sets this; a production build never includes drafts.
const SHOW_DRAFTS = import.meta.env.DEV && process.env.BLOG_DRAFTS === "true";

const visible = (entry: { data: { draft?: boolean } }): boolean =>
	SHOW_DRAFTS || entry.data.draft !== true;

export interface Post extends Omit<CollectionEntry<"posts">["data"], "draft"> {
	slug: string;
	readingTime: number;
	entry: CollectionEntry<"posts">;
}

// Same estimate the Nuxt `content:file:afterParse` hook used: 180 wpm over the
// whole raw file (front matter included), so the numbers don't change.
const readingTime = async (file: string): Promise<number> => {
	const raw = await readFile(file, "utf-8");
	return Math.ceil(raw.split(/\s+/).length / 180);
};

/** Published posts, most recent first. */
export const getPosts = async (): Promise<Post[]> => {
	const entries = await getCollection("posts", visible);
	const posts = await Promise.all(
		entries.map(async (entry) => ({
			...entry.data,
			slug: entry.id,
			readingTime: await readingTime(entry.filePath as string),
			entry,
		})),
	);

	return posts.sort(
		(a, b) =>
			b.date.getTime() - a.date.getTime() || a.slug.localeCompare(b.slug),
	);
};

/** Tags with their published posts, the most used first. */
export const getTags = async (): Promise<{ label: string; posts: Post[] }[]> => {
	const posts = await getPosts();
	const labels = [...new Set(posts.flatMap((post) => post.tags))];

	return labels
		.map((label) => ({
			label,
			posts: posts.filter((post) => post.tags.includes(label)),
		}))
		.sort(
			(a, b) =>
				b.posts.length - a.posts.length || a.label.localeCompare(b.label),
		);
};

/** Most recent purchase first. */
export const getDevices = async (): Promise<CollectionEntry<"devices">[]> =>
	(await getCollection("devices", visible)).sort(
		(a, b) =>
			b.data.purchase.localeCompare(a.data.purchase) ||
			a.id.localeCompare(b.id),
	);

export const getBooks = async (): Promise<CollectionEntry<"books">[]> => {
	const books = await getCollection("books", visible);
	const sorted = sortBooks(
		books
			.sort((a, b) => a.id.localeCompare(b.id))
			.map((book) => ({ ...book.data, entry: book })),
	);
	return sorted.map((book) => book.entry);
};
