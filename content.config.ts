import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
	collections: {
		content: defineCollection({
			type: "page",
			source: "**/*.md",
			schema: z.object({
				title: z.string(),
				description: z.string(),
				date: z.coerce.date(),
				tags: z.array(z.string()),
				pinned: z.boolean(),
				draft: z.boolean(),
				readingTime: z.number(),
				platforms: z
					.array(
						z.object({
							label: z.string(),
							url: z.string(),
						}),
					)
					.optional(),
				sections: z
					.array(
						z.object({
							heading: z.string(),
							icon: z.string().optional(),
							items: z.array(
								z.object({
									title: z.string(),
									badge: z.string().optional(),
									url: z.string().optional(),
									description: z.string().optional(),
									featured: z.boolean().optional(),
								}),
							),
						}),
					)
					.optional(),
				meta: z.object({
					images: z.array(z.string()),
					summary: z.string(),
				}),
			}),
		}),
		devices: defineCollection({
			type: "page",
			source: "**/devices/*.md",
			schema: z.object({
				title: z.string(),
				purchase: z.string(),
				tags: z.array(z.string()),
				image: z.string(),
				url: z.string().optional(),
				post: z.string().optional(),
				draft: z.boolean().optional(),
			}),
		}),
		books: defineCollection({
			type: "page",
			source: "**/books/*.md",
			schema: z.object({
				title: z.string(),
				author: z.string(),
				language: z.string(),
				// String rather than a date so partial values like "2023-06" are
				// allowed, same trade-off as `purchase` on devices.
				read: z.string().optional(),
				url: z.string().optional(),
				// Overrides for the spine look, which is otherwise derived from a
				// hash of the file path. See app/utils/books.ts.
				color: z.string().optional(),
				height: z.string().optional(),
				draft: z.boolean().optional(),
			}),
		}),
	},
});
