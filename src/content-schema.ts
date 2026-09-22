// Front matter schemas, ported from the old Nuxt Content `content.config.ts`.
// Validation runs at build time (see `_config.ts`), so a typo in a post's front
// matter fails the build instead of silently rendering a broken page.

import { z } from "zod";

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

export const postSchema = z.object({
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
});

export const pageSchema = z.object({
	title: z.string(),
	sections: z.array(section).optional(),
});

export const deviceSchema = z.object({
	title: z.string(),
	purchase: z.string(),
	tags: z.array(z.string()),
	image: z.string(),
	url: z.string().optional(),
	post: z.string().optional(),
	draft: z.boolean().optional(),
});

export const bookSchema = z.object({
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
});

/** Throws a readable error naming the offending file. */
export const validate = <T extends z.ZodType>(
	schema: T,
	data: unknown,
	file: string,
): z.infer<T> => {
	const result = schema.safeParse(data);
	if (!result.success) {
		throw new Error(
			`Invalid front matter in ${file}:\n${z.prettifyError(result.error)}`,
		);
	}
	return result.data;
};
