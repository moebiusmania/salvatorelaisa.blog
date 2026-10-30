// /rss.xml — same feed the old `scripts/generate-rss.ts` produced after
// `nuxt generate`. Links and GUIDs keep the exact same format so feed readers
// don't see the items as new.

import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "../utils/config.ts";
import { getPosts, type Post } from "../utils/posts.ts";

const SITE_URL = "https://salvatorelaisa.blog";
const LANGUAGE = "it";
const MAX_ITEMS = 20;

const escapeXml = (value: unknown): string =>
	String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

const buildItem = (post: Post): string => {
	const link = `${SITE_URL}/post/${post.slug}`;
	const parts = [
		`\t\t<item>`,
		`\t\t\t<title>${escapeXml(post.title)}</title>`,
		`\t\t\t<link>${escapeXml(link)}</link>`,
		`\t\t\t<guid isPermaLink="true">${escapeXml(link)}</guid>`,
		`\t\t\t<pubDate>${post.date.toUTCString()}</pubDate>`,
	];

	if (post.summary) {
		parts.push(`\t\t\t<description>${escapeXml(post.summary)}</description>`);
	}

	for (const tag of post.tags) {
		parts.push(`\t\t\t<category>${escapeXml(tag)}</category>`);
	}

	const image = post.images?.[0];
	if (image) {
		parts.push(
			`\t\t\t<enclosure url="${escapeXml(image)}" type="image/webp" />`,
		);
	}

	parts.push(`\t\t</item>`);
	return parts.join("\n");
};

export const GET: APIRoute = async () => {
	const items = (await getPosts())
		.slice(0, MAX_ITEMS)
		.map(buildItem)
		.join("\n");

	return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(SITE_TITLE)}</title>
		<link>${SITE_URL}</link>
		<description>${escapeXml(SITE_DESCRIPTION)}</description>
		<language>${LANGUAGE}</language>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
	</channel>
</rss>
`);
};
