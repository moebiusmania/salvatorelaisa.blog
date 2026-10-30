// Title index for the Alpine search on /post/page/<n>/ (see src/client/main.ts).

import type { APIRoute } from "astro";
import { longDate } from "../helpers.ts";
import { getPosts } from "../utils/posts.ts";

export const GET: APIRoute = async () => {
	const posts = (await getPosts()).map((post) => ({
		title: post.title,
		href: `/post/${post.slug}`,
		slug: post.slug,
		date: longDate(post.date),
		tags: post.tags,
		summary: post.summary ?? "",
		readingTime: post.readingTime,
		pinned: post.pinned === true,
	}));

	return new Response(JSON.stringify(posts));
};
