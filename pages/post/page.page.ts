// /post/page/<n>/ — every published post, 10 per page, plus the title search.

export const layout = "layouts/post-page.vto";

export default function* ({ search, paginate }: Lume.Data) {
	const posts = search.pages("type=post", "date=desc");

	yield* paginate(posts, {
		size: 10,
		url: (n: number) => `/post/page/${n}/`,
	});
}
