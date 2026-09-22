// /tags/<tag>/ — published posts with a given tag.

export const layout = "layouts/tag.vto";

export default function* ({ search }: Lume.Data) {
	for (const tag of search.values<string>("tags", "type=post")) {
		yield {
			url: `/tags/${tag}/`,
			tag,
			results: search.pages(`type=post '${tag}'`, "date=desc"),
		};
	}
}
