import { Table } from "@cliffy/table";
import { parse } from "@std/yaml";

interface Post {
	title: string;
	date: string;
	tags: string;
}

interface Frontmatter {
	draft?: boolean;
	title?: string;
	date?: string;
	tags?: string[];
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

function truncateTitle(title: string): string {
	const maxWords = 6;
	const words = title.split(" ");
	if (words.length > maxWords) {
		return words.slice(0, maxWords).join(" ") + "...";
	}
	return title;
}

const contentDir = `${Deno.cwd()}/content`;

const files: string[] = [];
for await (const entry of Deno.readDir(contentDir)) {
	if (entry.isFile && entry.name.endsWith(".md")) {
		files.push(entry.name);
	}
}

const draftPosts: Post[] = [];

for (const file of files) {
	const filePath = `${contentDir}/${file}`;
	const fileContent = await Deno.readTextFile(filePath);
	const { data } = parseFrontmatter(fileContent);

	if (data.draft) {
		const tags = Array.isArray(data.tags)
			? data.tags.join(", ")
			: data.tags || "No tags";

		draftPosts.push({
			title: truncateTitle(data.title || "Untitled"),
			date: data.date || "No date",
			tags,
		});
	}
}

if (draftPosts.length === 0) {
	console.log("No draft posts found.");
} else {
	console.log("\n📝 Draft Posts:\n");
	const rows = draftPosts.map((post) => [post.title, post.date, post.tags]);
	new Table()
		.header(["✏️ Title", "🗓️ Date", "🏷️ Tags"])
		.body(rows)
		.border()
		.render();
}
