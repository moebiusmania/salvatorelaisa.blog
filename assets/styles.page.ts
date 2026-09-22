// Concatenates the component and page stylesheets (kept as sibling .css files,
// untouched from the Nuxt version) into a single /assets/app.css.
//
// Nuxt used to inline only the styles of the components rendered on each page;
// every selector in these files is already scoped by a component or page class,
// so serving them together is safe. The only exceptions are the seasonal
// decorations (they style `body`), which get their own file and are linked by
// the base layout only when their theme is active.

const read = (path: string): Promise<string> =>
	Deno.readTextFile(new URL(`../${path}`, import.meta.url));

// Rendered only while their season is active, see base.vto.
const DECORATIONS = new Set([
	"_components/content/Clouds.css",
	"_components/content/Snow.css",
	"_components/content/Spooks.css",
]);

// Shared by several components, so it goes first.
const FIRST = ["_components/Badge.css", "_components/now/card.css"];

// Every .css file under `dir` (recursively), as repo-relative paths.
const collect = async (dir: string): Promise<string[]> => {
	const files: string[] = [];
	for await (const entry of Deno.readDir(new URL(`../${dir}`, import.meta.url))) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory) files.push(...(await collect(path)));
		else if (entry.name.endsWith(".css")) files.push(path);
	}
	return files.sort();
};

const bundle = async (files: string[]): Promise<string> => {
	const parts = await Promise.all(
		files.map(async (file) => `/* ${file} */\n${await read(file)}`),
	);
	return parts.join("\n");
};

export default async function* () {
	const components = (await collect("_components")).filter(
		(file) => !DECORATIONS.has(file) && !FIRST.includes(file),
	);
	const pages = await collect("_includes/css");

	yield {
		url: "/assets/app.css",
		content: await bundle([...FIRST, ...components, ...pages]),
	};
	yield {
		url: "/assets/clouds.css",
		content: await bundle(["_components/content/Clouds.css"]),
	};
	yield {
		url: "/assets/spooks.css",
		content: await bundle(["_components/content/Spooks.css"]),
	};
	yield {
		url: "/assets/snow.css",
		content: await bundle(["_components/content/Snow.css"]),
	};
}
