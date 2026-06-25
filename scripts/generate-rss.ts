import { parse } from "@std/yaml";

const SITE_URL = "https://salvatorelaisa.blog";
const SITE_TITLE = "Salvatore Laisa";
const SITE_DESCRIPTION = "Blog personale.";
const LANGUAGE = "it";
const MAX_ITEMS = 20;

const contentDir = `${Deno.cwd()}/content`;
const outputDir = `${Deno.cwd()}/.output/public`;
const outputFile = `${outputDir}/rss.xml`;

interface Frontmatter {
	title?: string;
	date?: string;
	draft?: boolean;
	tags?: string[];
	summary?: string;
	images?: string[];
}

interface Post extends Frontmatter {
	slug: string;
}

function parseFrontmatter(content: string): { data: Frontmatter } {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) return { data: {} };

	try {
		const data = parse(frontmatterMatch[1]) as Frontmatter;
		return { data };
	} catch {
		return { data: {} };
	}
}

function escapeXml(value: unknown): string {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function buildItem(post: Post): string {
	const url = `${SITE_URL}/post/${post.slug}`;
	const parts = [
		`\t\t<item>`,
		`\t\t\t<title>${escapeXml(post.title ?? "Untitled")}</title>`,
		`\t\t\t<link>${escapeXml(url)}</link>`,
		`\t\t\t<guid isPermaLink="true">${escapeXml(url)}</guid>`,
	];

	if (post.date) {
		parts.push(
			`\t\t\t<pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
		);
	}

	if (post.summary) {
		parts.push(`\t\t\t<description>${escapeXml(post.summary)}</description>`);
	}

	for (const tag of post.tags ?? []) {
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
}

async function main(): Promise<void> {
	try {
		const stat = await Deno.stat(outputDir);
		if (!stat.isDirectory) throw new Error("not a directory");
	} catch {
		console.error(
			`🚨 ${outputDir} not found. Run \`npm run generate\` first.`,
		);
		Deno.exit(1);
	}

	const files: string[] = [];
	for await (const entry of Deno.readDir(contentDir)) {
		if (entry.isFile && entry.name.endsWith(".md")) {
			files.push(entry.name);
		}
	}

	const fileContents = await Promise.all(
		files.map(async (file) => ({
			slug: file.replace(/\.md$/, ""),
			content: await Deno.readTextFile(`${contentDir}/${file}`),
		})),
	);

	const posts: Post[] = fileContents
		.map(({ slug, content }) => ({ slug, ...parseFrontmatter(content).data }))
		.filter((post) => !post.draft && post.date)
		.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
		.slice(0, MAX_ITEMS);

	const items = posts.map(buildItem).join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

	await Deno.writeTextFile(outputFile, xml);
	console.log(`✨ Generated rss.xml with ${posts.length} items at ${outputFile}`);
}

await main();
