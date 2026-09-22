// markdown-it plugin that gives every heading an `id`, using the same slugs
// Nuxt Content generated (github-slugger style, with a leading "_" when the slug
// starts with a digit), so existing `#fragment` links keep working.

// deno-lint-ignore-file no-explicit-any

export const slugify = (text: string): string => {
	const slug = text
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, "")
		.replace(/\s/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-|-$/g, "");

	return /^\d/.test(slug) ? `_${slug}` : slug;
};

export default function headingIds(md: any): void {
	md.core.ruler.push("heading_ids", (state: any) => {
		const seen = new Map<string, number>();

		state.tokens.forEach((token: any, index: number) => {
			if (token.type !== "heading_open" || token.attrGet("id")) return;

			const inline = state.tokens[index + 1];
			const text = (inline?.children ?? [])
				.filter((child: any) => child.type === "text" || child.type === "code_inline")
				.map((child: any) => child.content)
				.join("");

			const base = slugify(text);
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			token.attrSet("id", count === 0 ? base : `${base}-${count}`);
		});
	});
}
