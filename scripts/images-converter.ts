import { Image } from "@cross/image";

const args = Deno.args;
const targetPath = args[0];

let quality = 90;
const qualityArgIndex = args.findIndex((arg) => arg === "--quality");
if (qualityArgIndex !== -1 && args[qualityArgIndex + 1]) {
	const q = parseInt(args[qualityArgIndex + 1], 10);
	if (!isNaN(q) && q >= 0 && q <= 100) {
		quality = q;
	}
}

if (!targetPath) {
	console.error("❌ Specify a file or a folder.");
	Deno.exit(1);
}

async function convertToWebp(inputPath: string) {
	const stat = await Deno.stat(inputPath);

	if (stat.isFile) {
		await convertFile(inputPath);
	} else if (stat.isDirectory) {
		const filePaths: string[] = [];
		for await (const entry of Deno.readDir(inputPath)) {
			if (entry.isFile) {
				const ext = entry.name.toLowerCase();
				if (
					ext.endsWith(".png") ||
					ext.endsWith(".jpg") ||
					ext.endsWith(".jpeg")
				) {
					filePaths.push(`${inputPath}/${entry.name}`);
				}
			}
		}

		const results = await Promise.allSettled(filePaths.map(convertFile));
		for (const [i, result] of results.entries()) {
			if (result.status === "rejected") {
				console.error(`🚨 Failed to convert ${filePaths[i]}:`, result.reason);
			}
		}
	}
}

async function convertFile(filePath: string) {
	const data = await Deno.readFile(filePath);
	const image = await Image.decode(data);
	const output = filePath.replace(/\.(png|jpg|jpeg)$/i, ".webp");
	const webpData = await image.encode("webp", { quality });
	await Deno.writeFile(output, webpData);
	console.log(`✅ ${filePath} → ${output} (quality: ${quality})`);
}

await convertToWebp(targetPath);
