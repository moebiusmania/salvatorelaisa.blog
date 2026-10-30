// remark plugin: `~~x~~` renders as <s>, like markdown-it did, instead of GFM's
// <del> (which the CSS styles differently).

import type {} from "mdast-util-to-hast";
import type { Delete, Root } from "mdast";
import { visit } from "unist-util-visit";

export default function strikethrough() {
	return (tree: Root): void => {
		visit(tree, "delete", (node: Delete) => {
			node.data = { ...node.data, hName: "s" };
		});
	};
}
