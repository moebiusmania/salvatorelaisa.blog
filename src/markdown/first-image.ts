// remark plugin: the first markdown image of each document gets
// `fetchpriority="high"`, since it is usually the post's hero image and the LCP
// element.

import type {} from "mdast-util-to-hast";
import type { Image, Root } from "mdast";
import { visit, EXIT } from "unist-util-visit";

export default function firstImage() {
	return (tree: Root): void => {
		visit(tree, "image", (node: Image) => {
			node.data = {
				...node.data,
				hProperties: { ...node.data?.hProperties, fetchpriority: "high" },
			};
			return EXIT;
		});
	};
}
