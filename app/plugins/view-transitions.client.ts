/**
 * Drives the native View Transitions API for route changes.
 *
 * Instead of Vue/Nuxt `<Transition>` classes we wrap each navigation in
 * `document.startViewTransition()` so the browser captures before/after
 * snapshots and cross-fades (or morphs shared `view-transition-name`
 * elements) for us. The transition callback resolves only once Nuxt has
 * committed the new page (`page:finish`), bridging the async page swap.
 *
 * Degrades gracefully: if the API is missing or the user prefers reduced
 * motion, navigation happens normally with no wrapping.
 */
export default defineNuxtPlugin((nuxtApp) => {
	if (typeof document === "undefined" || !document.startViewTransition) {
		return;
	}

	const prefersReducedMotion = (): boolean =>
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// `/post/page/3` -> 3, anything else -> null
	const pageNumber = (path: string): number | null => {
		const match = path.match(/^\/post\/page\/(\d+)/);
		return match ? Number(match[1]) : null;
	};

	const router = useRouter();

	// Pick a slide direction for paginated lists; plain cross-fade elsewhere.
	router.beforeEach((to, from) => {
		const toPage = pageNumber(to.path);
		const fromPage = pageNumber(from.path);
		const direction =
			toPage !== null && fromPage !== null && toPage !== fromPage
				? toPage > fromPage
					? "forward"
					: "back"
				: "fade";
		document.documentElement.dataset.vtDirection = direction;
	});

	let commitPage: (() => void) | undefined;

	nuxtApp.hook("page:start", () => {
		if (prefersReducedMotion()) {
			return;
		}

		const pageCommitted = new Promise<void>((resolve) => {
			commitPage = resolve;
		});

		const transition = document.startViewTransition(() => pageCommitted);
		transition.finished.finally(() => {
			commitPage = undefined;
		});
	});

	nuxtApp.hook("page:finish", () => {
		commitPage?.();
	});

	// Make sure a failed navigation never leaves the transition hanging.
	nuxtApp.hook("vue:error", () => {
		commitPage?.();
	});
});
