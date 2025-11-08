import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
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
	process.exit(1);
}

async function convertToWebp(inputPath) {
	const stats = await fs.stat(inputPath);

	if (stats.isFile()) {
		await convertFile(inputPath);
	} else if (stats.isDirectory()) {
		const files = await fs.readdir(inputPath);
		for (const file of files) {
			const fullPath = path.join(inputPath, file);
			const ext = path.extname(file).toLowerCase();
			if ([".png", ".jpg", ".jpeg"].includes(ext)) {
				await convertFile(fullPath);
			}
		}
	}
}

async function convertFile(filePath) {
	const { dir, name } = path.parse(filePath);
	const output = path.join(dir, `${name}.webp`);
	await sharp(filePath).webp({ quality }).toFile(output);
	console.log(`✅ ${filePath} → ${output} (quality: ${quality})`);
}

convertToWebp(targetPath).catch((err) => {
	console.error("❌ Error:", err);
	process.exit(1);
});
