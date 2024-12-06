<script setup lang="ts">
import { SITE_TITLE, SITE_DESCRIPTION } from "@/utils/config";

type Theme = "dark" | "light" | "xmas" | "xmas-dark";

const options: { [k: string]: Theme } = {
  dark: "xmas-dark",
  light: "xmas",
}

const theme = useState<Theme>('theme', () => options.light)

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
  ],
  htmlAttrs: {
    lang: "it-IT",
    "data-theme": options[theme.value],
    class: theme.value,
  }
});

//updateDocument(current.value);
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

<style>
@import 'node_modules/modern-normalize/modern-normalize.css';
@import './globals.css';
</style>