import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";

import firstImage from "./src/markdown/first-image.ts";
import headingIds from "./src/markdown/heading-ids.ts";
import strikethrough from "./src/markdown/strikethrough.ts";
import timeline from "./src/markdown/timeline.ts";

export default defineConfig({
	site: "https://salvatorelaisa.blog",
	// `public/` is copied verbatim; the output folder is what CI deploys.
	outDir: "./_site",
	build: {
		format: "directory",
		assets: "assets",
		// Same as the old /assets/app.css: one cacheable stylesheet for every page.
		inlineStylesheets: "never",
	},
	devToolbar: { enabled: false },
	markdown: {
		// Posts keep the output they had with markdown-it: no smart punctuation, no
		// code highlighting, and the plugins below reproduce the old markup.
		syntaxHighlight: false,
		processor: unified({
			smartypants: false,
			remarkPlugins: [timeline, firstImage, headingIds, strikethrough],
		}),
	},
});
