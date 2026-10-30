// remark plugin for the MDC-style blocks composing the about page:
//
//   ::callout{variant="info" title="Titolo" icon="🔒"}
//   Any **Markdown** content, lists included.
//   ::
//
// Blocks can nest, and they render the same markup as the Vue components they
// were designed with, so their sibling CSS files in `src/components/content/`
// work as they are. Only the names in BLOCKS are touched, so `::timeline` and
// any other text starting with colons are left alone.

import type { Paragraph, Root, RootContent, Text } from "mdast";
import { escape, parseAttrs } from "./timeline.ts";

type Attrs = Record<string, string>;

const BLOCKS: Record<string, { open: (attrs: Attrs) => string; close: string }> = {
	"about-hero": {
		open: ({ image, role }) =>
			`<section class="about-hero"><figure class="about-hero__portrait${image ? "" : " is-placeholder"}">${
				image
					? `<img src="${escape(image)}" alt="Ritratto" loading="eager">`
					: '<span class="about-hero__placeholder" aria-hidden="true">🙂</span>'
			}</figure><div class="about-hero__body">${
				role ? `<p class="about-hero__role kicker">${escape(role)}</p>` : ""
			}<div class="about-hero__lead">`,
		close: "</div></div></section>",
	},
	"about-timeline": {
		open: () => '<div class="about-timeline"><ol class="about-timeline__track">',
		close:
			'</ol><p class="about-timeline__hint" aria-hidden="true"><span>scorri</span> <span class="about-timeline__arrow">→</span></p></div>',
	},
	"about-milestone": {
		open: ({ title = "", period, image, icon }) =>
			`<li class="about-milestone"><span class="about-milestone__marker" aria-hidden="true"></span><figure class="about-milestone__figure${image ? "" : " is-placeholder"}">${
				image
					? `<img src="${escape(image)}" alt="${escape(title)}" loading="lazy">`
					: `<span class="about-milestone__icon" role="img" aria-label="${escape(title)}">${escape(icon ?? "•")}</span>`
			}</figure>${
				period ? `<p class="about-milestone__period kicker">${escape(period)}</p>` : ""
			}${title ? `<p class="about-milestone__title">${escape(title)}</p>` : ""}<div class="about-milestone__desc">`,
		close: "</div></li>",
	},
	callout: {
		open: ({ variant = "info", title, icon }) =>
			`<aside class="callout callout--${escape(variant)}">${
				title
					? `<p class="callout__header">${
						icon ? `<span class="callout__icon" role="img" aria-hidden="true">${escape(icon)}</span>` : ""
					}<span class="callout__title">${escape(title)}</span></p>`
					: ""
			}<div class="callout__body">`,
		close: "</div></aside>",
	},
};

const OPEN = /^\s*::([a-z-]+)(?:\{(.*)\})?[ \t]*(?:\n|$)/;
const CLOSE = /(?:^|\n)\s*::\s*$/;

// Splits a paragraph into the block markers around its content. A marker can
// share a paragraph with others and with the text it wraps, because Markdown
// only ends a paragraph at a blank line.
const expand = (node: Paragraph, stack: string[]): RootContent[] => {
	const children = [...node.children];
	const before: RootContent[] = [];
	const after: RootContent[] = [];

	const first = (): Text | undefined =>
		children[0]?.type === "text" ? children[0] : undefined;
	const last = (): Text | undefined => {
		const child = children[children.length - 1];
		return child?.type === "text" ? child : undefined;
	};
	const html = (value: string): RootContent => ({ type: "html", value });

	for (let match = first()?.value.match(OPEN); match; match = first()?.value.match(OPEN)) {
		const block = BLOCKS[match[1] as string];
		if (!block) break;
		stack.push(match[1] as string);
		before.push(html(block.open(parseAttrs(match[2] ?? ""))));

		const text = first() as Text;
		text.value = text.value.slice(match[0].length);
		if (!text.value) children.shift();
	}

	while (stack.length > 0) {
		const text = last();
		if (!text || !CLOSE.test(text.value)) break;
		after.unshift(html(BLOCKS[stack.pop() as string]?.close as string));

		text.value = text.value.replace(CLOSE, "");
		if (!text.value) children.pop();
	}

	return [
		...before,
		...(children.length > 0 ? [{ ...node, children }] : []),
		...after,
	];
};

export default function blocks() {
	return (tree: Root): void => {
		const stack: string[] = [];
		tree.children = tree.children.flatMap((node) =>
			node.type === "paragraph" ? expand(node, stack) : [node]
		);
		if (stack.length > 0) {
			throw new Error(`Unclosed ::${stack[stack.length - 1]} block`);
		}
	};
}
