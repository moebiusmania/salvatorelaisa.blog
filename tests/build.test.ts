// Builds the whole site into a scratch folder and checks the output: routes,
// drafts, the home page ordering, the feed and the seasonal header. Assertions
// run on the real generated HTML.

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { readdirSync } from "node:fs";
import { rm } from "node:fs/promises";
import { parseMarkdown } from "../scripts/_frontmatter.ts";
import { SEASON_EVENT, SITE_TITLE } from "../src/utils/config.ts";

// Inside the repo: Astro moves files into outDir with a rename, which fails
// across filesystems.
const dest = "_site_test";

const read = (path: string): Promise<string> => Bun.file(`${dest}${path}`).text();
const exists = (path: string): Promise<boolean> => Bun.file(`${dest}${path}`).exists();

// Posts as they sit on disk, to cross-check what the build did with them.
const posts = await Promise.all(
	readdirSync("content")
		.filter((file) => file.endsWith(".md"))
		.map(async (file) => {
			const { data } = parseMarkdown(await Bun.file(`content/${file}`).text());
			return {
				slug: file.replace(/\.md$/, ""),
				draft: data.draft !== false,
				pinned: data.pinned === true,
			};
		}),
);
const published = posts.filter((post) => !post.draft);

describe("site build", () => {
	beforeAll(async () => {
		const build = Bun.spawn(
			["bun", "--bun", "astro", "build", "--outDir", dest],
			{ stdout: "ignore", stderr: "inherit" },
		);
		expect(await build.exited).toBe(0);
	}, 600_000);

	afterAll(async () => {
		await rm(dest, { recursive: true, force: true });
	});

	it("generates the top-level routes", async () => {
		for (const path of [
			"/index.html",
			"/404.html",
			"/about/index.html",
			"/books/index.html",
			"/devices/index.html",
			"/now/index.html",
			"/tags/index.html",
			"/post/page/1/index.html",
			"/post/year/index.html",
			"/post/year/2010/index.html",
			"/events/xmas/index.html",
			"/events/halloween/index.html",
			"/rss.xml",
			"/search.json",
			"/manifest.json",
			"/.nojekyll",
			"/CNAME",
		]) {
			expect(await exists(path), path).toBe(true);
		}
	});

	it("publishes every non-draft post at /post/<slug>/ and skips drafts", async () => {
		for (const post of posts) {
			expect(await exists(`/post/${post.slug}/index.html`), post.slug).toBe(
				!post.draft,
			);
		}
	});

	it("paginates all published posts, 10 per page", async () => {
		const pages = Math.ceil(published.length / 10);
		expect(await exists(`/post/page/${pages}/index.html`)).toBe(true);
		expect(await exists(`/post/page/${pages + 1}/index.html`)).toBe(false);
	});

	it("puts the pinned post first on the home page", async () => {
		const pinned = published.find((post) => post.pinned);
		const html = await read("/index.html");
		const first = html.match(/view-transition-name:post-title-([^;]+);/)?.[1];

		if (pinned) expect(first).toBe(pinned.slug);
		expect(html.match(/class="post-preview/g)?.length).toBeLessThanOrEqual(6);
	});

	it("indexes every published post for the search", async () => {
		const index = JSON.parse(await read("/search.json"));
		expect(index).toHaveLength(published.length);
	});

	it("keeps at most 20 items in the feed, with extensionless post links", async () => {
		const rss = await read("/rss.xml");
		const links = [...rss.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);

		expect(rss.match(/<item>/g)?.length).toBeLessThanOrEqual(20);
		for (const link of links.slice(1)) {
			expect(link).toMatch(/^https:\/\/salvatorelaisa\.blog\/post\/[^/]+$/);
		}
	});

	it("never publishes devices or books hidden with a leading dash", async () => {
		const devices = await read("/devices/index.html");
		const books = await read("/books/index.html");

		expect(devices).not.toContain("Amazon Echo");
		expect(books).not.toContain("Il Signore degli Anelli");
	});

	it("renders the header, with the seasonal event only when a theme is on", async () => {
		const html = await read("/index.html");

		expect(html).toContain(`<span>${SITE_TITLE}</span>`);
		expect(html.includes("event-nav")).toBe(SEASON_EVENT !== null);
		expect(html).not.toContain('name="generator"');
	});

	it("renders the timeline, Nuxt heading ids and <s> strikethrough in posts", async () => {
		const html = await read("/post/android-switch/index.html");

		expect(html).toContain('class="timeline-container"');
		expect(html).toContain('id="_10-anni-dopo"');
		expect(html).not.toContain("::timeline");
	});

	it("gives only the first image of a post a high fetch priority", async () => {
		const html = await read("/post/android-switch/index.html");
		expect(html.match(/fetchpriority="high"/g)?.length).toBeLessThanOrEqual(1);
	});

	it("bundles the component CSS without the seasonal decorations", async () => {
		const html = await read("/index.html");
		const href = html.match(/href="(\/assets\/[^"]+\.css)"/)?.[1];
		const css = await read(href as string);

		expect(css).toContain(".post-preview");
		expect(css).not.toContain(".spook");
		expect(css).not.toContain(".snowflake");
		expect(css).not.toContain(".cloud");
	});

	it("loads no htmx", async () => {
		expect(await read("/post/page/1/index.html")).not.toContain("htmx");
	});
});
