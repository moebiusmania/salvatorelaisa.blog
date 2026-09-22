// /post/year/<yyyy>/ — one page per year since the blog started, even the
// empty ones (the /post/year/ index links all of them).

export const layout = "layouts/post-year.vto";

export const FIRST_YEAR = 2010;

export default function* ({ search }: Lume.Data) {
	const posts = search.pages("type=post", "date=desc");
	const current = new Date().getFullYear();

	for (let year = FIRST_YEAR; year <= current; year++) {
		yield {
			url: `/post/year/${year}/`,
			year: String(year),
			results: posts.filter((post) =>
				new Date(post.date).getUTCFullYear() === year
			),
		};
	}
}
