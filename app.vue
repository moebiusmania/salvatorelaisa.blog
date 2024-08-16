<script setup lang="ts">
import type { Ref } from "vue";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/utils/config";

const themes: { [k: string]: string } = {
  dark: "sunset",
  light: "corporate",
}

const current: Ref<string> = ref("light");

const theme: Ref<string> = ref(themes[current.value] || themes.light);

const changeTheme = () => {
  current.value = current.value === "dark" ? "light" : "dark";
  theme.value = themes[current.value] || themes.light;
  // updateHead()
  updateDocument(current.value);
}

const updateDocument = (update: string) => {
  if (document) {
    document.documentElement.setAttribute("data-theme", theme.value);
    document.documentElement.className = update;
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
    "data-theme": theme.value,
    class: document && document.documentElement.classList.contains("dark") ? "dark" : "light",
  }
});

//updateDocument(current.value);
</script>

<template>
  <Header :dark="current === 'dark'" @change-theme="changeTheme" />
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