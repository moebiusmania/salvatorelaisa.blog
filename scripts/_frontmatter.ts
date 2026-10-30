// Front matter parsing for the CLI tools. The site itself goes through Astro's
// content collections (src/content.config.ts).

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export const parseMarkdown = (
	source: string,
): { data: Record<string, unknown>; body: string } => {
	const match = source.match(FRONT_MATTER);
	if (!match) return { data: {}, body: source };

	return {
		data: (Bun.YAML.parse(match[1] as string) as Record<string, unknown>) ?? {},
		body: source.slice(match[0].length),
	};
};
