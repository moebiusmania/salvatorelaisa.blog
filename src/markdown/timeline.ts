// remark plugin for the MDC-style timeline used in a couple of posts:
//
//   ::timeline{items="2013 - first, 2015 - second"}
//   ::
//
// It renders the same markup the old `Timeline.server.vue` component produced,
// so `src/components/content/Timeline.css` keeps working unchanged.

import type { Paragraph, Root } from "mdast";
import { visit } from "unist-util-visit";


const BLOCK = /^::timeline\{(.*)\}\s*\n::\s*$/;

export const escape = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export const parseAttrs = (source: string): Record<string, string> => {
	const attrs: Record<string, string> = {};
	for (const match of source.matchAll(/(\w+)="([^"]*)"/g)) {
		attrs[match[1] as string] = match[2] as string;
	}
	return attrs;
};

export const renderTimeline = (attrs: Record<string, string>): string => {
	const title = attrs.title ?? "Timeline degli eventi";
	const description = attrs.description ??
		"Alcuni eventi che ho vissuto relativi all'articolo visualizzati in ordine cronologico";
	const list = (attrs.items ?? "").split(",").filter((item) => item.trim());

	const items = list
		.map((item, index) => {
			const text = escape(item.trim());
			return `<li class="timeline-item" role="listitem" tabindex="0" aria-label="Timeline item ${
				index + 1
			} of ${list.length}: ${text}"><div class="timeline-content"><span class="timeline-text">${text}</span></div></li>`;
		})
		.join("");

	return `<section class="timeline-container" role="region" aria-label="${escape(title)}"${
		description ? ' aria-describedby="timeline-description"' : ""
	}><ul class="timeline" role="list" aria-label="${list.length} timeline items">${items}</ul><div class="sr-only" aria-live="polite" aria-atomic="true">Timeline with ${list.length} items loaded</div></section>\n`;
};

export default function timeline() {
	return (tree: Root): void => {
		visit(tree, "paragraph", (node: Paragraph, index, parent) => {
			const [child] = node.children;
			if (node.children.length !== 1 || child?.type !== "text") return;

			const open = child.value.match(BLOCK);
			if (!open || !parent || index === undefined) return;

			parent.children[index] = {
				type: "html",
				value: renderTimeline(parseAttrs(open[1] as string)),
			};
		});
	};
}
