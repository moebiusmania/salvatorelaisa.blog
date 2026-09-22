// Builds the whole site into a scratch folder and checks the output: routes,
// drafts, the home page ordering, the feed and the seasonal header. It replaces
// the old Vue component snapshots with assertions on the real generated HTML.

import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { parseMarkdown } from "../src/content.ts";
import { SEASON_EVENT, SITE_TITLE } from "../src/utils/config.ts";

// Lume resolves `dest` against the working directory, so use a relative folder
// (gitignored) rather than an absolute temp path. It is fixed when the site is
// created, hence the env var set before importing the config.
const dest = "_site_test";
Deno.env.set("BLOG_DEST", dest);
const { default: site } = await import("../_config.ts");

const read = (path: string): Promise<string> =>
	Deno.readTextFile(`${dest}${path}`);

const exists = async (path: string): Promise<boolean> => {
	try {
		await Deno.stat(`${dest}${path}`);
		return true;
	} catch {
		return false;
	}
};

// Posts as they sit on disk, to cross-check what the build did with them.
const posts: { slug: string; draft: boolean; pinned: boolean }[] = [];
for await (const entry of Deno.readDir("content")) {
	if (!entry.isFile || !entry.name.endsWith(".md")) continue;
	const { data } = parseMarkdown(await Deno.readTextFile(`content/${entry.name}`));
	posts.push({
		slug: entry.name.replace(/\.md$/, ""),
		draft: data.draft !== false,
		pinned: data.pinned === true,
	});
}
const published = posts.filter((post) => !post.draft);

describe("site build", {
	sanitizeOps: false,
	sanitizeResources: false,
}, () => {
	beforeAll(async () => {
		await site.build();
	});

	afterAll(async () => {
		await Deno.remove(dest, { recursive: true });
	});

	it("generates the top-level routes", async () => {
		for (
			const path of [
				"/index.html",
				"/404.html",
				"/about/index.html",
				"/books/index.html",
				"/devices/index.html",
				"/now/index.html",
				"/tags/index.html",
				"/post/page/1/index.html",
				"/post/year/index.html",
				"/events/xmas/index.html",
				"/events/halloween/index.html",
				"/rss.xml",
				"/search.json",
				"/assets/app.css",
				"/assets/js/main.js",
				"/manifest.json",
			]
		) {
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
	});

	it("renders the MDC timeline and heading ids in posts", async () => {
		const html = await read("/post/android-switch/index.html");

		expect(html).toContain('class="timeline-container"');
		expect(html).toContain('id="_10-anni-dopo"');
	});
});
