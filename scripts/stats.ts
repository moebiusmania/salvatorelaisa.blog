import { readdir } from "node:fs/promises";
import { renderTable } from "./_table.ts";

const title = "📊 Blog quick stats";
const contentDir = `${process.cwd()}/content`;
const devicesDir = `${process.cwd()}/content/devices`;

try {
	const files = (await readdir(contentDir, { withFileTypes: true }))
		.filter(
			(entry) =>
				entry.isFile() &&
				entry.name.endsWith(".md") &&
				entry.name !== "_template.md",
		)
		.map((entry) => entry.name);

	const contents = await Promise.all(
		files.map((file) => Bun.file(`${contentDir}/${file}`).text()),
	);
	const draftCount = contents.filter((content) =>
		content.includes("draft: true"),
	).length;

	const deviceFiles = (await readdir(devicesDir, { withFileTypes: true }))
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name);

	const hyphenDevices = deviceFiles.filter((file) =>
		file.startsWith("-"),
	).length;

	console.log(`\n${title}\n`);

	console.log(
		renderTable(
			["Category", "Count"],
			[
				["📄 Posts", String(files.length)],
				["📝 Drafts", String(draftCount)],
				["📱 Device Cards", String(deviceFiles.length)],
				["📝 Device Card Drafts", String(hyphenDevices)],
			],
		),
	);
} catch (error) {
	console.error("🚨 Error reading content directory:", error);
}
