// Front matter schemas, ported from the old Nuxt Content `content.config.ts`.
// Astro validates every entry at build time, so a typo in a post's front matter
// fails the build instead of silently rendering a broken page.

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Ids are the bare file names: they end up in URLs and in the spine hashes, so
// Astro's default slugified ids would change them.
const generateId = ({ entry }: { entry: string }): string =>
	entry.replace(/\.md$/, "");

const platform = z.object({
	label: z.string(),
	url: z.string(),
});

const sectionItem = z.object({
	title: z.string(),
	badge: z.string().optional(),
	url: z.string().optional(),
	description: z.string().optional(),
	featured: z.boolean().optional(),
});

const section = z.object({
	heading: z.string(),
	icon: z.string().optional(),
	items: z.array(sectionItem),
});

// Every markdown file directly under content/ is a blog post, served at
// /post/<filename>/ (the same URLs the Nuxt version generated).
const posts = defineCollection({
	loader: glob({ pattern: "*.md", base: "./content", generateId }),
	schema: z.object({
		// Coerced: YAML reads a title like `1999` as a number.
		title: z.coerce.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()),
		draft: z.boolean(),
		pinned: z.boolean().optional(),
		summary: z.string().optional(),
		// A single image may be written as a plain string.
		images: z
			.union([z.string().transform((image) => [image]), z.array(z.string())])
			.optional(),
		platforms: z.array(platform).optional(),
	}),
});

// The collections below never become a page of their own: they are rendered
// inside other pages (the /devices grid, the /books shelf, /about, …). Files
// whose name starts with "-" are hidden, drafts are filtered in utils/posts.ts.
const pages = defineCollection({
	loader: glob({ pattern: "*.md", base: "./content/pages", generateId }),
	schema: z.object({
		title: z.string(),
		sections: z.array(section).optional(),
	}),
});

const devices = defineCollection({
	loader: glob({ pattern: "[!-]*.md", base: "./content/devices", generateId }),
	schema: z.object({
		title: z.string(),
		purchase: z.string(),
		tags: z.array(z.string()),
		image: z.string(),
		url: z.string().optional(),
		post: z.string().optional(),
		draft: z.boolean().optional(),
	}),
});

const books = defineCollection({
	loader: glob({ pattern: "[!-]*.md", base: "./content/books", generateId }),
	schema: z.object({
		title: z.string(),
		author: z.string(),
		language: z.string(),
		// String rather than a date so partial values like "2023-06" are allowed,
		// same trade-off as `purchase` on devices.
		read: z.string().optional(),
		url: z.string().optional(),
		// Overrides for the spine look, which is otherwise derived from a hash of
		// the file path. See src/utils/books.ts.
		color: z.string().optional(),
		height: z.string().optional(),
		draft: z.boolean().optional(),
	}),
});

export const collections = { posts, pages, devices, books };
