// markdown-it plugin replacing the old `ProseImg.vue`: the first markdown image
// of each rendered document gets `fetchpriority="high"`, since it is usually
// the post's hero image and the LCP element.

// deno-lint-ignore-file no-explicit-any

export default function firstImage(md: any): void {
	const fallback = md.renderer.rules.image;

	md.renderer.rules.image = (
		tokens: any[],
		index: number,
		options: any,
		env: any,
		self: any,
	): string => {
		// markdown-it creates a fresh `env` for every render call, so the flag is
		// scoped to a single document.
		if (env && !env.__firstImageRendered) {
			env.__firstImageRendered = true;
			tokens[index].attrSet("fetchpriority", "high");
		}

		return fallback(tokens, index, options, env, self);
	};
}
