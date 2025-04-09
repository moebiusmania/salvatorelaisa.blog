import { writeFile } from "fs/promises";

export const createContent = async (
  title,
  folder,
  entity = "post",
  frontMatter = "",
  ext = "md"
) => {
  if (!title) {
    console.error(`⚠️ Please provide a ${entity} title`);
    process.exit(1);
  }

  const fileName = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with single dash
    .replace(/-+/g, "-"); // Remove multiple dashes

  const date = new Date().toISOString().split("T")[0];

  frontMatter = frontMatter.replace("{{title}}", title);
  frontMatter = frontMatter.replace("{{date}}", date);

  const filePath = `${folder}/${fileName}.${ext}`;

  try {
    await writeFile(filePath, frontMatter);
    console.log(`✨ Created new ${entity} at ${filePath}`);
  } catch (err) {
    console.error(`🚨 Failed to create ${entity}:`, err.message);
    process.exit(1);
  }
};
