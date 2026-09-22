import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";

import timeline from "./src/markdown/timeline.ts";
import firstImage from "./src/markdown/first-image.ts";
import headingIds from "./src/markdown/heading-ids.ts";
import { loadCollection, parseMarkdown } from "./src/content.ts";
import {
	bookSchema,
	deviceSchema,
	pageSchema,
	postSchema,
	validate,
} from "./src/content-schema.ts";
import * as config from "./src/utils/config.ts";
import * as now from "./src/utils/now.ts";
import { DARK, LIGHT, THEME_COOKIE } from "./src/utils/index.ts";
import { formatRead, sortBooks, spineStyle } from "./src/utils/books.ts";
import {
	cssVars,
	isoDay,
	formatDate,
	longDate,
	publishedDate,
	themeInitScript,
} from "./src/helpers.ts";

const site = lume(
	{
		src: ".",
		// Overridable so the build test can write to a temporary folder.
		dest: Deno.env.get("BLOG_DEST") ?? "./_site",
		location: new URL("https://salvatorelaisa.blog"),
	},
	{
		markdown: {
			plugins: [timeline, firstImage, headingIds],
		},
	},
);

// The repo root is the Lume source, so only a handful of top-level folders are
// part of the site. Everything else (scripts, docs, tests, README…) is ignored.
// The data-only collections under content/ are loaded by `src/content.ts`.
const SITE_ROOTS = [
	"/_components",
	"/_includes",
	"/_data.ts",
	"/pages",
	"/content",
	"/assets",
	"/public",
];
site.ignore((path) =>
	!SITE_ROOTS.some((root) => path === root || path.startsWith(`${root}/`)) ||
	/^\/content\/(devices|books|pages)(\/|$)/.test(path)
);

// Static files are served as-is from the site root, like Nuxt's `public/`.
site.copy("public", ".");
// Lume skips files starting with "_" or "." when walking a folder.
site.copy("public/_headers", "_headers");
site.copy("public/.nojekyll", ".nojekyll");

site.use(esbuild());
site.add("assets/js/main.ts");

// --- data ---------------------------------------------------------------------

const devices = (await loadCollection("content/devices")).map((device) => ({
	...device,
	...validate(deviceSchema, device, device.path),
}));
const books = (await loadCollection("content/books")).map((book) => ({
	...book,
	...validate(bookSchema, book, book.path),
}));
const pages = Object.fromEntries(
	await Promise.all(
		["about", "halloween", "xmas"].map(async (name) => {
			const file = `content/pages/${name}.md`;
			const { data, body } = parseMarkdown(await Deno.readTextFile(file));
			return [name, { ...validate(pageSchema, data, file), body }];
		}),
	),
);

site.data("config", config);
site.data("now", now);
site.data("theme", { DARK, LIGHT, THEME_COOKIE, themeInitScript });
site.data(
	"devices",
	// Most recent purchase first, as in the old `order("purchase", "DESC")`.
	[...devices].sort((a, b) => b.purchase.localeCompare(a.purchase)),
);
site.data("books", sortBooks(books));
site.data("contentPages", pages);
site.data("utils", {
	cssVars,
	isoDay,
	formatDate,
	formatRead,
	longDate,
	publishedDate,
	spineStyle,
});

// --- posts --------------------------------------------------------------------

site.preprocess([".md"], async (pages) => {
	for (const page of pages) {
		if (page.data.type !== "post") continue;

		const file = page.src.path + page.src.ext;
		const post = validate(postSchema, page.data, file);
		page.data.title = post.title;
		page.data.images = post.images;

		// Same estimate the Nuxt `content:file:afterParse` hook used: 180 wpm over
		// the whole raw file (front matter included), so the numbers don't change.
		const raw = await Deno.readTextFile(`.${file}`);
		page.data.readingTime = Math.ceil(raw.split(/\s+/).length / 180);

		// <head> data for the base layout.
		const slug = page.data.url.replace(/^\/post\//, "").replace(/\/$/, "");
		page.data.metaTitle = `${config.SITE_TITLE} - ${page.data.title}`;
		page.data.og = {
			url: `https://salvatorelaisa.blog/post/${slug}`,
			image: (page.data.images as string[] | undefined)?.[0],
		};
	}
});

export default site;
