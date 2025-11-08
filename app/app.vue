<script setup lang="ts">
import { SITE_TITLE, SITE_DESCRIPTION, CURRENT_THEME } from "@/utils/config";

// Add theme constant with proper typing
type BlogTheme = "default" | "spring" | "summer" | "xmas" | "halloween";
type Theme = "dark" | "light";

const options: Record<Theme, Theme> = {
	dark: "dark",
	light: "light",
};

const theme = useState<Theme>("theme", () => "light");

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

const changeTheme = () => {
	const currentTheme = theme.value;
	const newTheme: Theme = currentTheme === "light" ? "dark" : "light";
	theme.value = newTheme;
	if (document) {
		document.documentElement.setAttribute("data-theme", newTheme);
		document.documentElement.className = newTheme;
	}
};

useHead({
	title: SITE_TITLE,
	meta: [
		{ name: "title", content: SITE_TITLE },
		{ name: "description", content: SITE_DESCRIPTION },
		{ property: "og:description", content: SITE_DESCRIPTION },
	],
	// script: [
	//   {
	//     src: "https://platform.twitter.com/widgets.js",
	//     crossorigin: "anonymous",
	//     defer: true,
	//     async: true,
	//   },
	// ],
	link: [
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
		{ rel: "stylesheet", href: "/styles/normalize.css" },
		{ rel: "stylesheet", href: "/styles/spacing.css" },
		{ rel: "stylesheet", href: themeImport.value },
		{ rel: "stylesheet", href: "/styles/typography.css" },
	],
	htmlAttrs: {
		lang: "it-IT",
		"data-theme": theme.value,
		class: theme.value,
	},
});
</script>

<template>
  <Header :dark="theme === options.dark" @change-theme="changeTheme" />
  <main>
    <Container>
      <NuxtPage />
    </Container>
    <Footer />
  </main>
  <PWAInstallBanner />
</template>