<script setup lang="ts">
import { SITE_TITLE, SITE_DESCRIPTION, CURRENT_THEME } from "@/utils/config";
import { THEME_COOKIE, LIGHT, DARK, type Theme } from "@/utils";

// Add theme constant with proper typing
type BlogTheme = "default" | "spring" | "summer" | "xmas" | "halloween";

const options: Record<Theme, Theme> = {
	dark: DARK,
	light: LIGHT,
};

// One year, in seconds, so the chosen theme sticks across visits.
const THEME_MAX_AGE = 60 * 60 * 24 * 365;

// Cookie based persistence: the value is sent with every request so the server
// can render the correct theme on the very first paint (no flash of light
// content on refresh). On the first visit there is no cookie yet, so we fall
// back to the light theme on the server and let the inline script below upgrade
// it to the system preference before the page is painted.
const theme = useCookie<Theme>(THEME_COOKIE, {
	default: () => LIGHT,
	path: "/",
	sameSite: "lax",
	maxAge: THEME_MAX_AGE,
});

// Add computed property for theme import
const themeImport = computed(() => {
	const themes: Record<BlogTheme, string> = {
		default: "/styles/themes/default.css",
		halloween: "/styles/themes/halloween.css",
		spring: "/styles/themes/spring.css",
		summer: "/styles/themes/summer.css",
		xmas: "/styles/themes/xmas.css",
	};
	return themes[CURRENT_THEME];
});

const applyTheme = (value: Theme) => {
	const el = document.documentElement;
	el.setAttribute("data-theme", value);
	el.className = value;
};

const changeTheme = () => {
	// Updating the cookie ref persists the choice; the inline script will read
	// it on the next load so refreshes keep the same theme without a flash.
	theme.value = theme.value === LIGHT ? DARK : LIGHT;
	if (import.meta.client) {
		applyTheme(theme.value);
	}
};

// Inline, render-blocking script injected in <head>. It runs before the body is
// painted, so it can apply the persisted theme (or, on a first visit, the
// system preference) with no flash. It also writes the cookie on first visit so
// that hydration and subsequent requests already agree on the theme.
const themeInitScript = `(function(){try{var n=${JSON.stringify(
	THEME_COOKIE,
)};var m=document.cookie.match(new RegExp("(?:^|; )"+n+"=([^;]+)"));var t=m?decodeURIComponent(m[1]):((window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?${JSON.stringify(
	DARK,
)}:${JSON.stringify(
	LIGHT,
)});if(!m){document.cookie=n+"="+t+"; path=/; max-age=${THEME_MAX_AGE}; samesite=lax"}var e=document.documentElement;e.setAttribute("data-theme",t);e.className=t;}catch(e){}})();`;

// Keep the reactive state in sync with whatever the inline script applied
// (covers the first visit where the system preference differs from the light
// SSR default) and persist it so the toggle and future requests stay correct.
onMounted(() => {
	const applied = document.documentElement.getAttribute(
		"data-theme",
	) as Theme | null;
	if (applied && applied !== theme.value) {
		theme.value = applied;
	}
});

useHead({
	title: SITE_TITLE,
	meta: [
		{ name: "title", content: SITE_TITLE },
		{ name: "description", content: SITE_DESCRIPTION },
		{ property: "og:description", content: SITE_DESCRIPTION },
	],
	script: [
		// Render-blocking theme bootstrap: must run before the body paints so
		// the correct theme (persisted cookie or, on first visit, the system
		// preference) is applied with no flash of light content.
		{
			key: "theme-init",
			tagPriority: "critical",
			innerHTML: themeInitScript,
		},
	],
	link: [
		// Preload the display serif (latin, 700) so headlines don't flash.
		{
			rel: "preload",
			href: "/fonts/fraunces/fraunces-07.woff2",
			as: "font",
			type: "font/woff2",
			crossorigin: "anonymous",
		},
		// Preload critical CSS for parallel loading
		{ rel: "preload", href: "/fonts/fonts.css", as: "style" },
		{ rel: "preload", href: "/styles/normalize.css", as: "style" },
		{ rel: "preload", href: "/styles/spacing.css", as: "style" },
		{ rel: "preload", href: themeImport.value, as: "style" },
		{ rel: "preload", href: "/styles/typography.css", as: "style" },
		// Critical CSS (load these first)
		{ rel: "stylesheet", href: "/fonts/fonts.css" },
		{ rel: "stylesheet", href: "/styles/normalize.css" },
		{ rel: "stylesheet", href: "/styles/spacing.css" },
		{ rel: "stylesheet", href: themeImport.value },
		{ rel: "stylesheet", href: "/styles/typography.css" },
		// Non-critical resources (don't block rendering)
		{ rel: "stylesheet", href: "/styles/view-transitions.css", media: "print", onload: "this.media='all'" },
		{ rel: "alternate", type: "application/rss+xml", href: "/rss.xml" },
		{ rel: "manifest", href: "/manifest.json" },
		{ rel: "icon", type: "image/png", href: "/static/favicons/favicon.ico" },
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			href: "/static/favicons/favicon-16x16.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			href: "/static/favicons/favicon-32x32.png",
		},
	],
	htmlAttrs: {
		lang: "it-IT",
		"data-theme": theme,
		class: theme,
	},
});
</script>

<template>
	<Header :dark="theme === options.dark" @change-theme="changeTheme" />
	<!-- <Snow /> -->
	<Clouds v-if="CURRENT_THEME === 'summer'" />
	<Spooks v-if="CURRENT_THEME === 'halloween'" />
	<main>
		<Container>
			<NuxtPage />
		</Container>
		<Footer />
	</main>
	<PWAInstallBanner />
</template>