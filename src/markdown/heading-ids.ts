// remark plugin that gives every heading an `id`, using the same slugs Nuxt
// Content generated (github-slugger style, with a leading "_" when the slug
// starts with a digit), so existing `#fragment` links keep working.

import type {} from "mdast-util-to-hast";
import type { Heading, Root } from "mdast";
import { visit } from "unist-util-visit";

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

const headingText = (heading: Heading): string => {
	let text = "";
	visit(heading, (node) => {
		if (node.type === "text" || node.type === "inlineCode") text += node.value;
	});
	return text;
};

export default function headingIds() {
	return (tree: Root): void => {
		const seen = new Map<string, number>();

		visit(tree, "heading", (node: Heading) => {
			const base = slugify(headingText(node));
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			node.data = {
				...node.data,
				hProperties: {
					...node.data?.hProperties,
					id: count === 0 ? base : `${base}-${count}`,
				},
			};
		});
	};
}
