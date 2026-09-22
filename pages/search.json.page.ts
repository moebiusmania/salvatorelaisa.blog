// Title index for the Alpine search on /post/page/<n>/ (see assets/js/main.ts).

import { longDate } from "../src/helpers.ts";

export const url = "/search.json";

export default function ({ search }: Lume.Data): string {
	const posts = search.pages("type=post", "date=desc").map((post) => {
		const slug = post.url.replace(/^\/post\//, "").replace(/\/$/, "");
		return {
			title: post.title,
			href: `/post/${slug}`,
			slug,
			date: longDate(post.date),
			tags: post.tags,
			summary: post.summary ?? "",
			readingTime: post.readingTime,
			pinned: post.pinned === true,
		};
	});

	return JSON.stringify(posts);
}
