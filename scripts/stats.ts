import { Table } from "@cliffy/table";

const title = "📊 Blog quick stats";
const contentDir = `${Deno.cwd()}/content`;
const devicesDir = `${Deno.cwd()}/content/devices`;

try {
	const files: string[] = [];
	for await (const entry of Deno.readDir(contentDir)) {
		if (
			entry.isFile &&
			entry.name.endsWith(".md") &&
			entry.name !== "_template.md"
		) {
			files.push(entry.name);
		}
	}

	const contents = await Promise.all(
		files.map((file) => Deno.readTextFile(`${contentDir}/${file}`)),
	);
	const draftCount = contents.filter((content) =>
		content.includes("draft: true"),
	).length;

	const deviceFiles: string[] = [];
	for await (const entry of Deno.readDir(devicesDir)) {
		if (entry.isFile) {
			deviceFiles.push(entry.name);
		}
	}

	const hyphenDevices = deviceFiles.filter((file) =>
		file.startsWith("-"),
	).length;

	console.log(`\n${title}\n`);

	new Table()
		.header(["Category", "Count"])
		.body([
			["📄 Posts", String(files.length)],
			["📝 Drafts", String(draftCount)],
			["📱 Device Cards", String(deviceFiles.length)],
			["📝 Device Card Drafts", String(hyphenDevices)],
		])
		.border()
		.render();
} catch (error) {
	console.error("🚨 Error reading content directory:", error);
}
