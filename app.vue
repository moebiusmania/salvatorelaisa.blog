<script setup lang="ts">
import { SITE_TITLE, SITE_DESCRIPTION, CURRENT_THEME } from "@/utils/config";

// Add theme constant with proper typing
type BlogTheme = 'default' | 'spring' | 'xmas'
type Theme = "dark" | "light";

const options: { [k: string]: Theme } = {
  dark: "dark",
  light: "light",
}

const theme = useState<Theme>('theme', () => options.light)

// Add computed property for theme import
const themeImport = computed(() => {
  const themes: Record<BlogTheme, string> = {
    default: '/styles/themes/default.css',
    spring: '/styles/themes/spring.css',
    xmas: '/styles/themes/xmas.css'
  }
  return themes[CURRENT_THEME]
})

const changeTheme = () => {
  theme.value = theme.value === options.light ? options.dark : options.light;
  if (document) {
    document.documentElement.setAttribute("data-theme", options[theme.value]);
    document.documentElement.className = theme.value;
  }
}

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
    "data-theme": options[theme.value],
    class: theme.value,
  }
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
</template>