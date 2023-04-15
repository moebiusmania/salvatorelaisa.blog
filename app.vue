<script setup lang="ts">
import { Ref } from "vue";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/utils/config";

const LIGHT: string = "corporate";
const DARK: string = "night";
const theme: Ref<string> = ref(LIGHT);

const switchTheme = () => {
  theme.value = theme.value === DARK ? LIGHT : DARK;
  updateHead();
};

const updateHead = () => {
  const htmlAttrs = {
      lang: "it-IT",
      "data-theme": theme.value,
      class: theme.value === DARK ? "dark" : 'light',
    }

  return useHead({
    title: SITE_TITLE,
    meta: [
      { name: "title", content: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
    ],
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
    htmlAttrs
  });
}
  
updateHead();
</script>

<template>
  <Header :dark="theme === DARK" @theme="switchTheme" />
  <main>
    <Container>
      <NuxtPage />
    </Container>
    <Footer />
  </main>
</template>