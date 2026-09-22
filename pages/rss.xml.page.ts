// /rss.xml — same feed the old `scripts/generate-rss.ts` produced after
// `nuxt generate`, now built from Lume's page index. Links and GUIDs keep the
// exact same format so feed readers don't see the items as new.

import { SITE_DESCRIPTION, SITE_TITLE } from "../src/utils/config.ts";

export const url = "/rss.xml";

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

type Post = ReturnType<Lume.Data["search"]["pages"]>[number];

const buildItem = (post: Post): string => {
	const slug = post.url.replace(/^\/post\//, "").replace(/\/$/, "");
	const link = `${SITE_URL}/post/${slug}`;
	const parts = [
		`\t\t<item>`,
		`\t\t\t<title>${escapeXml(post.title ?? "Untitled")}</title>`,
		`\t\t\t<link>${escapeXml(link)}</link>`,
		`\t\t\t<guid isPermaLink="true">${escapeXml(link)}</guid>`,
		`\t\t\t<pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
	];

	if (post.summary) {
		parts.push(`\t\t\t<description>${escapeXml(post.summary)}</description>`);
	}

	for (const tag of post.tags ?? []) {
		parts.push(`\t\t\t<category>${escapeXml(tag)}</category>`);
	}

	const image = (post.images as string[] | undefined)?.[0];
	if (image) {
		parts.push(
			`\t\t\t<enclosure url="${escapeXml(image)}" type="image/webp" />`,
		);
	}

	parts.push(`\t\t</item>`);
	return parts.join("\n");
};

export default function ({ search }: Lume.Data): string {
	const items = search
		.pages("type=post", "date=desc", MAX_ITEMS)
		.map(buildItem)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
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
`;
}
