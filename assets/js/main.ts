// Client-side interactivity, powered by Alpine.js. Every component below is
// referenced from the Hugo templates via `x-data="<name>"`; the markup itself
// is rendered at build time. Bundled by Hugo's js.Build into /assets/js/main.js.

import Alpine from "./vendor/alpinejs-3.17.4.esm.js";
import { DARK, LIGHT, THEME_COOKIE, THEME_MAX_AGE, type Theme } from "./theme.ts";
import {
	getLatestRepos,
	getWeather,
	NOW_GITHUB_USER,
	NOW_WEATHER_LOCATION,
	type Repo,
	type Weather,
} from "./now.ts";

const prefersReducedMotion = (): boolean =>
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// --- theme --------------------------------------------------------------------

// The inline script in <head> already applied the persisted theme before the
// first paint; this only keeps the toggle icon in sync and flips it on click.
Alpine.data("themeToggle", () => ({
	dark: document.documentElement.getAttribute("data-theme") === DARK,

	toggle(): void {
		const theme: Theme = this.dark ? LIGHT : DARK;
		this.dark = theme === DARK;

		document.cookie =
			`${THEME_COOKIE}=${theme}; path=/; max-age=${THEME_MAX_AGE}; samesite=lax`;

		const el = document.documentElement;
		el.setAttribute("data-theme", theme);
		el.className = theme;
	},
}));

// --- back to top --------------------------------------------------------------

// Visible only once the page header (navigation) has scrolled out of view.
Alpine.data("backToTop", () => ({
	visible: false,
	observer: null as IntersectionObserver | null,
	onScroll: null as (() => void) | null,

	init(): void {
		const header = document.querySelector(".header");

		// Preferred: watch the header itself so the button mirrors the nav exactly.
		if (header && "IntersectionObserver" in window) {
			this.observer = new IntersectionObserver(
				([entry]) => {
					this.visible = !entry?.isIntersecting;
				},
				{ threshold: 0 },
			);
			this.observer.observe(header);
			return;
		}

		// Fallback for environments without IntersectionObserver.
		this.onScroll = () => {
			this.visible = window.scrollY > 200;
		};
		window.addEventListener("scroll", this.onScroll, { passive: true });
		this.onScroll();
	},

	destroy(): void {
		this.observer?.disconnect();
		if (this.onScroll) window.removeEventListener("scroll", this.onScroll);
	},

	scrollToTop(): void {
		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion() ? "auto" : "smooth",
		});
	},
}));

// --- PWA install banner -------------------------------------------------------

const PWA_DISMISSED = "pwa-install-dismissed";

type InstallPrompt = Event & {
	prompt: () => void;
	userChoice: Promise<unknown>;
};

Alpine.data("pwaInstallBanner", () => ({
	showBanner: false,
	canPrompt: false,
	deferredPrompt: null as InstallPrompt | null,

	init(): void {
		// Check if user already dismissed the banner
		try {
			if (localStorage.getItem(PWA_DISMISSED)) return;
		} catch {
			// Storage blocked: just behave as if nothing was dismissed.
		}

		// Check if app is already installed
		if (window.matchMedia?.("(display-mode: standalone)").matches) return;

		// Check if running in PWA mode on iOS
		const isInStandaloneMode =
			(navigator as Navigator & { standalone?: boolean }).standalone;
		if (isInStandaloneMode) return;

		window.addEventListener("beforeinstallprompt", (event) => {
			event.preventDefault();
			this.deferredPrompt = event as InstallPrompt;
			this.canPrompt = true;
			this.showBanner = true;
		});

		// Show banner for iOS users (Safari doesn't support beforeinstallprompt)
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isSafari = /Safari/.test(navigator.userAgent) &&
			!/Chrome/.test(navigator.userAgent);

		if (isIOS && isSafari) this.showBanner = true;
	},

	dismiss(): void {
		this.showBanner = false;
		try {
			localStorage.setItem(PWA_DISMISSED, "true");
		} catch {
			// Nothing to persist to.
		}
	},

	async install(): Promise<void> {
		if (!this.deferredPrompt) return;

		this.deferredPrompt.prompt();
		await this.deferredPrompt.userChoice;

		this.deferredPrompt = null;
		this.canPrompt = false;
		this.dismiss();
	},
}));

// --- post search --------------------------------------------------------------

// Filters every published post by title. On first focus htmx loads the
// pre-rendered list (/fragments/posts.html, the same PostPreview markup as the
// build-time pages) into the results container; each item there is shown or
// hidden by `matches`. While the query is empty the page's own list is shown.
Alpine.data("postSearch", () => ({
	enabled: false,
	query: "",
	index: [] as { slug: string; title: string }[],

	init(): void {
		this.enabled = true;
	},

	// Called by htmx:afterSwap once the fragment is in the page.
	indexResults(container: HTMLElement): void {
		this.index = [...container.querySelectorAll<HTMLElement>("[data-slug]")].map(
			(item) => ({ slug: item.dataset.slug ?? "", title: item.dataset.title ?? "" }),
		);
	},

	get results(): string[] {
		const value = this.query.toLowerCase();
		return value.length > 0
			? this.index
				.filter((post) => post.title.toLowerCase().includes(value))
				.map((post) => post.slug)
			: [];
	},

	clear(): void {
		this.query = "";
	},
}));

// --- books --------------------------------------------------------------------

Alpine.data("bookshelf", () => ({
	open(slug: string): void {
		const dialog = document.querySelector<HTMLDialogElement>(
			`dialog[data-book="${slug}"]`,
		);
		dialog?.showModal();
	},
}));

// --- /now ---------------------------------------------------------------------

Alpine.data("weather", () => ({
	loading: true,
	error: false,
	data: null as Weather | null,

	async init(): Promise<void> {
		try {
			this.data = await getWeather(NOW_WEATHER_LOCATION);
		} catch {
			this.error = true;
		} finally {
			this.loading = false;
		}
	},
}));

Alpine.data("githubRepos", () => ({
	loading: true,
	error: false,
	repos: [] as Repo[],

	async init(): Promise<void> {
		try {
			this.repos = await getLatestRepos(NOW_GITHUB_USER, 3);
		} catch {
			this.error = true;
		} finally {
			this.loading = false;
		}
	},
}));

Alpine.start();
