<script setup lang="ts">
import type { Ref } from "vue";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/utils/config";

const route = useRoute()

const themes: { [k: string]: string } = {
  dark: "sunset",
  light: "corporate",
}

const current: string = route.query.theme as string;

const theme: Ref<string> = ref(themes[current] || themes.light);

const updateHead = () => {
  const htmlAttrs = {
    lang: "it-IT",
    "data-theme": theme.value,
    class: theme.value === themes.dark ? "dark" : "light",
  };

  return useHead({
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
    htmlAttrs,
  });
};

updateHead();
</script>

<template>
  <Header :dark="current === 'dark'" />
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