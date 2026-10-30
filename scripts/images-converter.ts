import { readdir, stat } from "node:fs/promises";
import sharp from "sharp";

const args = process.argv.slice(2);
const targetPath = args[0];

let quality = 90;
const qualityArgIndex = args.findIndex((arg) => arg === "--quality");
const qualityArg = args[qualityArgIndex + 1];
if (qualityArgIndex !== -1 && qualityArg) {
	const q = parseInt(qualityArg, 10);
	if (!isNaN(q) && q >= 0 && q <= 100) {
		quality = q;
	}
}

if (!targetPath) {
	console.error("❌ Specify a file or a folder.");
	process.exit(1);
}

async function convertToWebp(inputPath: string) {
	const info = await stat(inputPath);

	if (info.isFile()) {
		await convertFile(inputPath);
	} else if (info.isDirectory()) {
		const filePaths = (await readdir(inputPath, { withFileTypes: true }))
			.filter(
				(entry) => entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name),
			)
			.map((entry) => `${inputPath}/${entry.name}`);

		const results = await Promise.allSettled(filePaths.map(convertFile));
		for (const [i, result] of results.entries()) {
			if (result.status === "rejected") {
				console.error(`🚨 Failed to convert ${filePaths[i]}:`, result.reason);
			}
		}
	}
}

async function convertFile(filePath: string) {
	const output = filePath.replace(/\.(png|jpg|jpeg)$/i, ".webp");
	await sharp(filePath).webp({ quality }).toFile(output);
	console.log(`✅ ${filePath} → ${output} (quality: ${quality})`);
}

await convertToWebp(targetPath);
