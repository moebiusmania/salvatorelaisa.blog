/** File name (without extension) generated from a title. */
export const slugify = (title: string) =>
	title
		.toLowerCase()
		.replace(/[^a-zA-Z0-9 ]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

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

	const fileName = slugify(title);

	const date = new Date().toISOString().split("T")[0];

	// The templates wrap the title in double quotes, so escape it for YAML. The
	// replacer functions stop `$&`-style patterns in the title from expanding.
	const yamlTitle = title.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	frontMatter = frontMatter.replace("{{title}}", () => yamlTitle);
	frontMatter = frontMatter.replace("{{date}}", () => date);

	const filePath = `${folder}/${fileName}.${ext}`;

	try {
		// `createNew` refuses to clobber an existing file with the same slug.
		await Deno.writeTextFile(filePath, frontMatter, { createNew: true });
		console.log(`✨ Created new ${entity} at ${filePath}`);
	} catch (err) {
		console.error(`🚨 Failed to create ${entity}:`, (err as Error).message);
		Deno.exit(1);
	}
};
