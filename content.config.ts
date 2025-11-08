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
	},
});
