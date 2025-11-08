import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, "..", "content");

// Simple YAML frontmatter parser
function parseFrontmatter(content) {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) return { data: {} };

	const frontmatter = frontmatterMatch[1];
	const data = {};

	frontmatter.split("\n").forEach((line) => {
		const [key, ...values] = line.split(":");
		if (key && values.length > 0) {
			const value = values.join(":").trim();
			try {
				data[key.trim()] = JSON.parse(value);
			} catch {
				data[key.trim()] = value;
			}
		}
	});

	return { data };
}

// Truncate title if it's longer than 8 words
function truncateTitle(title) {
	const maxWords = 6;
	const words = title.split(" ");
	if (words.length > maxWords) {
		return words.slice(0, maxWords).join(" ") + "...";
	}
	return title;
}

// Get all markdown files
const files = fs.readdirSync(contentDir).filter((file) => file.endsWith(".md"));

// Parse frontmatter and collect draft posts
const draftPosts = files
	.map((file) => {
		const filePath = path.join(contentDir, file);
		const fileContent = fs.readFileSync(filePath, "utf8");
		const { data } = parseFrontmatter(fileContent);

		if (data.draft) {
			const tags = Array.isArray(data.tags)
				? data.tags.join(", ")
				: data.tags || "No tags";

			return {
				title: truncateTitle(data.title || "Untitled"),
				date: data.date || "No date",
				tags,
			};
		}
		return null;
	})
	.filter(Boolean);

// Create a simple table
function createTable(rows) {
	if (rows.length === 0) {
		console.log("No draft posts found.");
		return;
	}

	// Calculate column widths
	const widths = {
		title: Math.max(5, ...rows.map((r) => r.title.length)),
		date: Math.max(4, ...rows.map((r) => r.date.length)),
		tags: Math.max(4, ...rows.map((r) => r.tags.length)),
	};

	// Create separator line
	const separator = `+${"-".repeat(widths.title + 2)}+${"-".repeat(
		widths.date + 2,
	)}+${"-".repeat(widths.tags + 2)}+`;

	// Create header
	const header = `| ${"✏️ Title".padEnd(widths.title)} | ${"🗓️ Date".padEnd(
		widths.date + 1,
	)} | ${"🏷️ Tags".padEnd(widths.tags + 1)} |`;

	// Create rows
	const formattedRows = rows.map(
		(row) =>
			`| ${row.title.padEnd(widths.title)} | ${row.date.padEnd(
				widths.date,
			)} | ${row.tags.padEnd(widths.tags)} |`,
	);

	// Print table
	console.log("\n📝 Draft Posts:");
	console.log(separator);
	console.log(header);
	console.log(separator);
	formattedRows.forEach((row) => console.log(row));
	console.log(separator);
}

createTable(draftPosts);
