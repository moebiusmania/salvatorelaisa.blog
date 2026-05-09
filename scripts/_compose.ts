export const createContent = async (
	title: string,
	folder: string,
	entity = "post",
	frontMatter = "",
	ext = "md",
) => {
	if (!title) {
		console.error(`⚠️ Please provide a ${entity} title`);
		Deno.exit(1);
	}

	const fileName = title
		.toLowerCase()
		.replace(/[^a-zA-Z0-9 ]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

	const date = new Date().toISOString().split("T")[0];

	frontMatter = frontMatter.replace("{{title}}", title);
	frontMatter = frontMatter.replace("{{date}}", date);

	const filePath = `${folder}/${fileName}.${ext}`;

	try {
		await Deno.writeTextFile(filePath, frontMatter);
		console.log(`✨ Created new ${entity} at ${filePath}`);
	} catch (err) {
		console.error(`🚨 Failed to create ${entity}:`, (err as Error).message);
		Deno.exit(1);
	}
};
